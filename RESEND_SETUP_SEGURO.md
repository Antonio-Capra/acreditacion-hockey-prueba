# 🔐 Guía Segura de Configuración Resend API

## ❌ Qué NO hacer (causó el bloqueo anterior)

```bash
# ❌ NUNCA usar un email sin verificar
from = "noreply@agencia.com"  # ← Esto causó el bloqueo

# ❌ NUNCA cambiar el dominio sin verificación DNS
# Resend marca como SPAM automáticamente
```

## ✅ Solución Implementada

Tu API ahora usa un sistema inteligente de 3 niveles:

### **Nivel 1: RECOMENDADO para Producción Inmediata** ⭐
```env
# Sin necesidad de verificación DNS
RESEND_FROM_EMAIL=noreply@acreditaciones.resend.dev
```

**Ventajas:**
- ✅ Verificado automáticamente por Resend
- ✅ No hay riesgo de bloqueo
- ✅ Funciona instantáneamente
- ✅ Confiable y profesional

**Cómo usar:**
1. En tu `.env.local`, define:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@acreditaciones.resend.dev
   ```
2. ¡Listo! Ya funciona sin riesgo

---

### **Nivel 2: Solo si quieres usar dominio propio** ⚠️
```env
# SOLO después de verificación DNS completa
RESEND_VERIFIED_DOMAIN=acreditaciones.agencia.com
```

**⚠️ REQUISITOS CRÍTICOS:**

1. **Verificar dominio en Resend Dashboard:**
   - https://resend.com/domains
   - Agregar nuevo dominio
   - Copiar los DNS records

2. **Configurar DNS en tu proveedor (GoDaddy, Namecheap, etc.):**
   ```
   Tipo: SPF
   Valor: v=spf1 include:resend.com ~all
   
   Tipo: DKIM
   Valor: [Copiar de Resend]
   
   Tipo: DMARC
   Valor: v=DMARC1; p=none;
   ```

3. **Esperar validación (24-48 horas)**

4. **SOLO ENTONCES** usar en `.env.local`:
   ```
   RESEND_VERIFIED_DOMAIN=acreditaciones.agencia.com
   ```

---

## 🛡️ Sistema de Seguridad Implementado

La API ahora:

```typescript
// 1️⃣ Valida el email de destino
if (!correo) return error

// 2️⃣ Elige email seguro automáticamente
const from = getFromEmail()
// - Si existe dominio verificado → úsalo
// - Si no → usa subdomain Resend (seguro)

// 3️⃣ Detecta errores de verificación
if (error.message.includes("verify")) {
  console.error("⚠️ CRÍTICO: Dominio no verificado")
  return "Contacte al administrador"
}

// 4️⃣ Logs seguros (sin exponer datos sensibles)
console.error("Error enviando a:", correo.split("@")[1])
// Output: "Error enviando a: gmail.com" ← Sin email completo
```

---

## 📋 Checklist de Implementación

- [x] API configurada con sistema de 3 niveles
- [x] Uso de subdomain Resend (más seguro)
- [x] Validación de errores de verificación
- [x] Logs seguros
- [ ] **TODO para producción:**
  - Decidir si usar OPCIÓN 1 (Resend subdomain) ← RECOMENDADO
  - Si elige OPCIÓN 2, verificar dominio en Resend
  - Configurar DNS records en proveedor
  - Actualizar `.env.local` con valores finales

---

## 🚨 Si se vuelve a bloquear el correo

1. **Immediato:** Cambiar a subdomain Resend:
   ```bash
   RESEND_FROM_EMAIL=noreply@acreditaciones.resend.dev
   ```

2. **Revisar logs:**
   ```bash
   # En tu servidor/log
   grep "ERROR RESEND" logs.txt
   grep "⚠️ CRÍTICO" logs.txt
   ```

3. **Contactar Resend Support:**
   - https://resend.com/support
   - Decir: "Email bloqueado, necesito cambiar a dominio verificado"

---

## 📞 Comparativa Rápida

| Aspecto | Resend Subdomain | Dominio Propio |
|--------|------------------|----------------|
| Seguridad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (si verificado) |
| Setup | Inmediato | 24-48h |
| Riesgo | CERO | Medio (mal DNS) |
| Profesionalismo | Alto | Máximo |
| Precio | Incluido | Incluido |
| **Recomendación** | ✅ USA ESTO | ❌ Solo si necesitas |

---

## ✨ Ejemplo Final de Uso

```typescript
// Tu código en next.js/api no cambia:
const { data, error } = await resend.emails.send({
  from,  // ← Automáticamente seguro
  to: correo,
  subject: "✅ Tu acreditación ha sido aprobada",
  html: template,
});
```

**¡Sin cambios en tu lógica! Todo es automático y seguro.** 🎉
