# Plan Mail Escalable

## Objetivo
Disenar un sistema de emails para aprobacion y rechazo que sea escalable, con variables configurables por evento y sin cambios de codigo para ajustar contenido operativo.

## Principios
- Separar contenido editable (texto) de la plantilla HTML.
- Centralizar variables del evento en una fuente de verdad.
- Validar variables disponibles y fallback seguros.
- Permitir versionado de plantillas y cambios auditables.

## Variables estandar (catalogo)
### Datos del acreditado
- nombre
- apellido
- correo
- zona
- area

### Datos del evento
- evento_nombre
- rival
- fecha
- hora
- lugar
- escudo_local_url
- escudo_rival_url

### Operacion y logistica
- apertura_puertas
- cierre_prensa
- instalacion_tecnica
- contacto_email

### Textos largos (bloques)
- instrucciones_acceso_cancha
- instrucciones_acceso_prensa
- normas_cobertura
- info_estacionamientos
- notas_legales

## Modelo de datos (sugerido)
Opcion A (simple): agregar columnas a eventos.
- email_aprobado_text
- email_rechazo_text
- apertura_puertas
- cierre_prensa
- instalacion_tecnica
- contacto_email
- instrucciones_acceso_cancha
- instrucciones_acceso_prensa
- normas_cobertura
- info_estacionamientos
- notas_legales

Opcion B (escalable): tabla eventos_email_config.
- id
- evento_id (fk)
- aprobado_text
- rechazo_text
- variables_json (jsonb)
- version
- activo
- created_at
- updated_at

## Arquitectura de plantillas
1) HTML base fijo (aprobado / rechazado) con secciones y estilos.
2) Intro dinamico inyectado usando renderTemplate(template_text, variables).
3) Bloques largos opcionales renderizados con placeholders o usando secciones condicionales.

## Flujo de resolucion
1) Resolver eventoId (request -> evento activo si no viene).
2) Cargar configuracion (eventos o eventos_email_config).
3) Construir diccionario de variables:
   - datos del acreditado + datos del evento + textos largos.
4) Renderizar texto editable con renderTemplate.
5) Inyectar texto en HTML base y enviar.
6) Guardar log con version de plantilla usada.

## UI Admin (minimo viable)
- Formulario por evento con campos:
  - evento basico + horarios + contacto
  - bloques de texto (textarea)
  - preview en vivo
- Boton de "Guardar y publicar" con validacion de placeholders.
- Indicador de variables disponibles.

## Validaciones
- Validar placeholders usados vs. catalogo.
- Reemplazar variables faltantes por string vacio.
- Sanitizar HTML para texto editable.

## Versionado y auditoria
- Guardar version incremental de cada cambio.
- Log de envio con:
  - template_version
  - evento_id
  - email_type
  - payload (hash)

## Roadmap
1) Definir catalogo final de variables.
2) Crear tabla/configuracion y migrar datos existentes.
3) Refactor de rutas send-approval y send-rejection.
4) UI admin con preview y validacion.
5) Logs con versionado.

## Resultado esperado
- Admin actualiza variables y textos sin tocar codigo.
- Emails consistentes y configurables por evento.
- Escalabilidad para nuevos tipos de email.