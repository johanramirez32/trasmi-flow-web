// Ejemplo simple para consumir el módulo desde tu frontend.
// El navegador NO debe enviar MONITORING_API_KEY.

export async function getMonitoringDashboard(stationId) {
  const query = stationId ? `?stationId=${encodeURIComponent(stationId)}` : "";
  const response = await fetch(`/api/monitoring/dashboard${query}`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error("No se pudo cargar el dashboard");
  return response.json();
}

export async function getMonitoringAlerts(status = "active") {
  const response = await fetch(
    `/api/monitoring/alerts?status=${encodeURIComponent(status)}`,
    { credentials: "include" }
  );
  if (!response.ok) throw new Error("No se pudieron cargar las alertas");
  return response.json();
}

export async function acknowledgeMonitoringAlert(alertId) {
  const response = await fetch(
    `/api/monitoring/alerts/${encodeURIComponent(alertId)}/acknowledge`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    }
  );
  if (!response.ok) throw new Error("No se pudo reconocer la alerta");
  return response.json();
}
