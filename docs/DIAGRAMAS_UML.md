# 🧩 TransmiFlow - Diagramas UML

## 1. Diagrama de casos de uso (PlantUML)

```plantuml
@startuml
left to right direction
actor Usuario
rectangle "TransmiFlow" {
  usecase "Registrar cuenta" as UC1
  usecase "Iniciar sesion" as UC2
  usecase "Ver mapa de estaciones" as UC3
  usecase "Ver ubicacion y cercanas" as UC4
  usecase "Buscar estacion" as UC5
  usecase "Ver detalle y aglomeracion" as UC6
  usecase "Enviar reporte" as UC7
  usecase "Ver alertas" as UC8
  usecase "Trazar ruta a estacion" as UC9
  usecase "Registrar como operario" as UC10
}
Usuario --> UC1
Usuario --> UC2
Usuario --> UC3
Usuario --> UC4
Usuario --> UC5
Usuario --> UC6
Usuario --> UC7
Usuario --> UC8
Usuario --> UC9
Usuario --> UC10
@enduml
```

## 2. Diagrama de clases (PlantUML)

```plantuml
@startuml
class Usuario {
    +id: int
    +nombre: String
    +email: String
    +password: String
    +rol: String
}
class Estacion {
    +id: int
    +nombre: String
    +lat: float
    +lng: float
    +tipo: String
    +capacidad: int
    +aglom: String
}
class Reporte {
    +id: int
    +nivel: String
    +creado_en: Date
}
class TransmiflowApp {
    +iniciarSesion()
    +registrar()
    +verMapa()
    +verCercanas()
    +buscarEstacion()
    +enviarReporte()
    +trazarRuta()
}
Usuario --> Reporte
Estacion --> Reporte
TransmiflowApp --> Usuario
TransmiflowApp --> Estacion
TransmiflowApp --> Reporte
@enduml
```

## 3. Diagrama de componentes (PlantUML)

```plantuml
@startuml
component "Frontend (public/js)" as FE
component "Backend (Express)" as BE
database "PostgreSQL" as DB
actor Usuario
BE --> DB
FE --> BE
Usuario --> FE
@enduml
```

## 4. Diagrama ER (Mermaid)

```mermaid
erDiagram
    USUARIO ||--o{ REPORTE : "emite"
    ESTACION ||--o{ REPORTE : "genera"
    ESTACION }o--|| TRONCAL : "pertenece_a"
```

## 5. Diagrama de secuencia (flujo: ruta)

```plantuml
@startuml
actor Usuario
participant "Frontend" as FE
participant "Backend" as BE
database "PostgreSQL" as DB

Usuario -> FE : presiona "Mi estacion mas cercana"
FE -> BE : GET /api/estaciones
BE -> DB : SELECT
DB --> BE : estaciones
BE --> FE : json
FE -> FE : calcula mas cercana (GPS)
FE -> BE : GET /api/niveles
BE --> FE : niveles
FE -> BE : GET /api/reportes
BE --> FE : reportes
FE --> Usuario : dibuja linea azul
@enduml
```
