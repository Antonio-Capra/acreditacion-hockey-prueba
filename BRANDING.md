# Sistema de Branding Multi-Marca

Este proyecto soporta múltiples marcas/equipos con configuraciones personalizadas.

## Marcas Disponibles

### Universidad Católica (por defecto)
- **URL**: `/?brand=uc` o sin parámetro
- **Colores**: Azul UC (#1e5799, #2989d8, #ffffff)
- **Estadio**: Claro Arena
- **Rival**: Deportes Concepción

### Colo-Colo
- **URL**: `/?brand=colocolo`
- **Colores**: Blanco/Negro/Rojo (#ffffff, #000000, #ed1c24)
- **Estadio**: Estadio Monumental
- **Rival**: Universidad Católica

## Cómo Agregar una Nueva Marca

1. **Agregar configuración en `lib/branding.ts`**:
```typescript
colocolo: {
  name: "Colo-Colo",
  shortName: "CC",
  primaryColor: "#ffffff",
  secondaryColor: "#000000",
  accentColor: "#ed1c24",
  logo: "/colocolo/EscudoColoColo.png",
  shield: "/colocolo/EscudoColoColo.png",
  backgroundImage: "/colocolo/EstadioColoColo.jpg",
  title: "Acreditaciones Colo-Colo",
  description: "Sistema de acreditación oficial para el partido Colo-Colo vs Universidad Católica",
  eventTitle: "COLO-COLO",
  eventSubtitle: "VS UNIVERSIDAD CATÓLICA",
  eventDate: "8 de Febrero 2026",
  eventVenue: "Estadio Monumental",
  opponent: "Universidad Católica",
  opponentShield: "/UCimg/EscudoUC.png",
  customCSS: `/* Estilos personalizados */`
}
```

2. **Crear carpeta de assets**: `public/[marca]/`
3. **Agregar imágenes**:
   - `Escudo[Marca].png` - Escudo del equipo
   - `Estadio[Marca].jpg` - Imagen de fondo del estadio

## Uso en Desarrollo

- **Selector visual**: Hay un selector en la esquina superior derecha para cambiar entre marcas
- **URL directa**: `http://localhost:3000/?brand=colocolo`
- **Programático**: Usar el hook `useBranding()` en componentes

## Archivos Importantes

- `lib/branding.ts` - Configuraciones de todas las marcas
- `hooks/useBranding.ts` - Hook para acceder al branding actual
- `components/BrandSelector.tsx` - Selector visual de marcas
- `app/page.tsx` - Página principal que usa branding dinámico
- `app/layout.tsx` - Layout con metadata dinámico

## Próximos Pasos

1. Agregar imágenes reales de Colo-Colo
2. Configurar colores específicos del branding
3. Personalizar más elementos de la UI
4. Agregar soporte para más equipos si es necesario