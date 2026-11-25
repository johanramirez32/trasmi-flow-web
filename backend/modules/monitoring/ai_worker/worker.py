import os
import json
import time
from datetime import datetime, timezone

import cv2
import numpy as np
import requests
from dotenv import load_dotenv
from ultralytics import YOLO

load_dotenv()

API_URL = os.getenv("MONITORING_API_URL", "http://localhost:3000/api/monitoring")
API_KEY = os.getenv("MONITORING_API_KEY", "")
CONFIG_PATH = os.getenv("CAMERAS_CONFIG", "cameras.json")
SEND_EVERY = float(os.getenv("SEND_EVERY_SECONDS", "5"))
MODEL_PATH = os.getenv("MODEL", "yolo11n.pt")
CONFIDENCE = float(os.getenv("CONFIDENCE", "0.35"))

if not API_KEY:
    raise RuntimeError("Configura MONITORING_API_KEY en el archivo .env del worker")

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    cameras = json.load(f)

model = YOLO(MODEL_PATH)
headers = {"x-monitoring-key": API_KEY, "Content-Type": "application/json"}


def open_source(source):
    # "0" abre webcam; una URL RTSP se mantiene como string.
    if isinstance(source, str) and source.isdigit():
        source = int(source)
    cap = cv2.VideoCapture(source)
    # Reduce el buffer para streams en vivo cuando el backend lo soporte.
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)
    return cap


def inside(point, polygon):
    return cv2.pointPolygonTest(
        np.asarray(polygon, dtype=np.int32),
        (float(point[0]), float(point[1])),
        False
    ) >= 0


def process_camera(camera):
    source = camera["source"]
    polygon = camera["polygon"]
    camera_code = camera["camera_code"]
    cap = open_source(source)

    if not cap.isOpened():
        print(f"[{camera_code}] No se pudo abrir la fuente; reintentando.")
        cap.release()
        time.sleep(3)
        return

    last_send = 0.0
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                print(f"[{camera_code}] No se recibió frame; reconectando.")
                break

            result = model.track(
                frame,
                persist=True,
                tracker="bytetrack.yaml",
                classes=[0],  # clase person en COCO
                conf=CONFIDENCE,
                verbose=False
            )[0]

            count = 0
            if result.boxes is not None and result.boxes.xyxy is not None:
                boxes = result.boxes.xyxy.cpu().numpy()
                for box in boxes:
                    x1, y1, x2, y2 = box[:4]
                    center = ((x1 + x2) / 2, (y1 + y2) / 2)
                    if inside(center, polygon):
                        count += 1

            now = time.time()
            if now - last_send >= SEND_EVERY:
                payload = {
                    "cameraCode": camera_code,
                    "peopleCount": int(count),
                    "capturedAt": datetime.now(timezone.utc).isoformat()
                }
                try:
                    response = requests.post(
                        f"{API_URL}/metrics",
                        headers=headers,
                        json=payload,
                        timeout=5
                    )
                    response.raise_for_status()
                    print(f"[{camera_code}] {count} personas -> {response.status_code}")
                except requests.RequestException as exc:
                    print(f"[{camera_code}] Error enviando métrica: {exc}")
                last_send = now

            # Ventana opcional para pruebas locales.
            if os.getenv("SHOW_VIDEO", "false").lower() == "true":
                preview = frame.copy()
                cv2.polylines(
                    preview, [np.asarray(polygon, dtype=np.int32)],
                    True, (0, 255, 255), 2
                )
                cv2.putText(
                    preview, f"{camera_code}: {count}",
                    (20, 35), cv2.FONT_HERSHEY_SIMPLEX,
                    1, (0, 255, 0), 2
                )
                cv2.imshow("TransmiFlow AI Worker", preview)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    return
    finally:
        cap.release()
        if os.getenv("SHOW_VIDEO", "false").lower() == "true":
            cv2.destroyAllWindows()


def main():
    # Prototipo: procesa cámaras secuencialmente.
    # Para producción, ejecuta un worker por cámara o implementa concurrencia
    # con límites de CPU/GPU y supervisión de procesos.
    while True:
        for camera in cameras:
            process_camera(camera)


if __name__ == "__main__":
    main()
