# Testing

Este proyecto incluye una suite completa de tests unitarios usando **Jest** y **React Testing Library**.

## 🚀 Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (re-ejecuta automáticamente al cambiar archivos)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

## 📊 Cobertura Actual

```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------|---------|----------|---------|---------|-------------------
All files            |     100 |    90.47 |     100 |     100 |
components/common    |     100 |      100 |     100 |     100 |
lib                  |     100 |    89.47 |     100 |     100 | 26
---------------------|---------|----------|---------|---------|-------------------
```

## 🧪 Suites de Test

### 1. **Validaciones** (`__tests__/validation.test.ts`)
- ✅ **validateRUT**: Validación de RUT chileno con algoritmo correcto
- ✅ **validateEmail**: Validación de emails con TLD válido
- ✅ **formatRUT**: Formateo de RUT con puntos y guion

### 2. **Componentes UI** (`__tests__/LoadingSpinner.test.tsx`, `__tests__/ButtonSpinner.test.tsx`)
- ✅ **LoadingSpinner**: Renderizado correcto, mensajes personalizables, animación
- ✅ **ButtonSpinner**: Props personalizables, estructura SVG correcta

### 3. **Lógica de Negocio** (`__tests__/adminFiltering.test.ts`)
- ✅ **normalizeText**: Normalización de texto (quitar tildes)
- ✅ **Búsqueda**: Filtrado por nombre, email, RUT, empresa, cargo, zona
- ✅ **Búsqueda insensible**: A mayúsculas, minúsculas y tildes
- ✅ **Filtrado por estado**: Pendiente, aprobado, rechazado

## 🛠️ Configuración Técnica

### Jest Configuration (`jest.config.ts`)
```typescript
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
}

export default createJestConfig(config)
```

### Setup (`jest.setup.ts`)
```typescript
import '@testing-library/jest-dom'
```

### Dependencias de Testing
```json
{
  "@testing-library/jest-dom": "^6.1.4",
  "@testing-library/react": "^14.0.0",
  "@testing-library/user-event": "^14.5.1",
  "@types/jest": "^29.5.5",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0"
}
```

## 📋 Mejores Prácticas Implementadas

1. **Nombres descriptivos**: Cada test explica claramente qué funcionalidad valida
2. **Tests independientes**: Cada test es autónomo y no depende de otros
3. **Matchers apropiados**: Uso de matchers de React Testing Library y jest-dom
4. **Cobertura completa**: Tests para funciones críticas, componentes y lógica de negocio
5. **Configuración moderna**: Uso del preset oficial de Next.js para Jest

## 🎯 Próximos Tests a Implementar

- **Tests de integración**: Formularios completos de acreditación
- **Tests de acciones masivas**: Aprobar, rechazar, eliminar múltiples items
- **Tests de modales**: Confirmaciones y manejo de errores
- **Tests end-to-end**: Con Playwright para flujos completos
- **Tests de API routes**: Endpoints de backend

## 🔄 CI/CD Integration

Los tests están configurados para ejecutarse automáticamente en:
- **Pre-commit hooks**: Usando Husky
- **GitHub Actions**: En cada push y PR
- **Build de producción**: Validación antes del deploy

¡La suite de tests garantiza la calidad y confiabilidad del código! ✅