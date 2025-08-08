# 🧪 Prueba Manual de Restricciones - Paso a Paso

## 🚀 **Instrucciones de Prueba Inmediata**

### **Opción 1: Página de Prueba Dedicada (RECOMENDADA)**

1. **Abrir la página de prueba:**
   ```
   Draftosaurus/prueba-restricciones.html
   ```
   (Abre este archivo directamente en tu navegador)

2. **Ejecutar pruebas automáticas:**
   - Haz clic en "🧪 Ejecutar Pruebas Automáticas"
   - Debe mostrar el resultado de todas las pruebas

3. **Prueba manual del Bosque:**
   - Haz clic en "🌲 Probar Bosque"
   - Selecciona "🦕 T1" (Triceratops)
   - Intenta hacer clic en slot "2" → ❌ Debe fallar
   - Haz clic en slot "1" → ✅ Debe funcionar
   - Selecciona "🦕 T2" (otro Triceratops)
   - Intenta hacer clic en slot "3" → ❌ Debe fallar
   - Haz clic en slot "2" → ✅ Debe funcionar

4. **Prueba manual del Prado:**
   - Haz clic en "🌾 Probar Prado"
   - Selecciona "🦕 T1" (Triceratops)
   - Haz clic en slot "1" → ✅ Debe funcionar
   - Selecciona "🦴 S1" (Stegosaurus - especie diferente)
   - Intenta hacer clic en slot "3" → ❌ Debe fallar (no secuencial)
   - Haz clic en slot "2" → ✅ Debe funcionar

### **Opción 2: Juego Principal**

1. **Abrir el juego:**
   ```
   Draftosaurus/digital.php
   ```

2. **Abrir consola del navegador (F12)**

3. **Ejecutar pruebas:**
   ```javascript
   ejecutarPruebasRestricciones();
   ```

---

## 🔍 **Casos de Prueba Específicos**

### **🌲 Bosque de la Semejanza**

#### **Caso 1: Colocación Secuencial**
```
✅ CORRECTO:
1. Seleccionar Triceratops → Colocar en slot 1
2. Seleccionar Triceratops → Colocar en slot 2
3. Seleccionar Triceratops → Colocar en slot 3

❌ INCORRECTO:
1. Seleccionar Triceratops → Intentar colocar en slot 2 (debe fallar)
2. Colocar en slot 1, luego intentar slot 3 (debe fallar)
```

#### **Caso 2: Misma Especie**
```
✅ CORRECTO:
- Solo Triceratops en todos los slots

❌ INCORRECTO:
- Mezclar Triceratops con Stegosaurus (debe fallar)
```

### **🌾 Prado de la Diferencia**

#### **Caso 1: Colocación Secuencial**
```
✅ CORRECTO:
1. Seleccionar Triceratops → Colocar en slot 1
2. Seleccionar Stegosaurus → Colocar en slot 2
3. Seleccionar Brontosaurus → Colocar en slot 3

❌ INCORRECTO:
1. Seleccionar Triceratops → Intentar colocar en slot 2 (debe fallar)
2. Colocar en slot 1, luego intentar slot 3 (debe fallar)
```

#### **Caso 2: Especies Diferentes**
```
✅ CORRECTO:
- Cada slot con especie diferente

❌ INCORRECTO:
- Repetir la misma especie (debe fallar)
```

---

## 🎯 **Resultados Esperados**

### **Feedback Visual Correcto:**
- ✅ **Slots válidos:** Borde verde, fondo verde claro
- ❌ **Slots inválidos:** Borde rojo punteado, fondo rojo claro, cursor "not-allowed"
- 🎯 **Slot seleccionado:** Borde dorado, efecto de brillo

### **Mensajes de Error Específicos:**
- 🌲 **Bosque:** "En el Bosque: coloca de izquierda a derecha sin espacios"
- 🌾 **Prado:** "En el Prado: coloca de izquierda a derecha sin espacios"
- 🚫 **Especie:** "Solo dinosaurios [tipo] permitidos" / "Solo especies diferentes permitidas"

### **Comportamiento de Slots:**
- Solo el **primer slot disponible** debe resaltarse en verde
- Los demás slots deben aparecer como **no disponibles** (rojo)
- Al colocar un dinosaurio, el **siguiente slot** debe volverse disponible

---

## 🐛 **Problemas Comunes y Soluciones**

### **Problema 1: Todos los slots se resaltan en verde**
**Causa:** La validación secuencial no se está aplicando
**Solución:** Verificar que `ValidadorZona.js` esté cargado correctamente

### **Problema 2: Las pruebas automáticas fallan**
**Causa:** Clases no inicializadas correctamente
**Solución:** Recargar la página y verificar la consola por errores

### **Problema 3: Los mensajes de error no son específicos**
**Causa:** El sistema de mensajes personalizados no está funcionando
**Solución:** Verificar que `TableroPointClick.js` esté actualizado

### **Problema 4: Los slots no se limpian correctamente**
**Causa:** Las clases CSS no se están removiendo
**Solución:** Verificar que `ManejadorSeleccion.js` esté limpiando todas las clases

---

## 📊 **Checklist de Verificación**

### **Funcionalidad Básica:**
- [ ] Las pruebas automáticas pasan al 100%
- [ ] Solo slots válidos se resaltan en verde
- [ ] Slots inválidos aparecen en rojo con cursor "not-allowed"
- [ ] Los mensajes de error son específicos por zona

### **Restricciones Secuenciales:**
- [ ] Bosque: Primer dinosaurio solo puede ir en slot 1
- [ ] Bosque: Segundo dinosaurio solo puede ir en slot 2
- [ ] Prado: Primer dinosaurio solo puede ir en slot 1
- [ ] Prado: Segundo dinosaurio solo puede ir en slot 2

### **Restricciones de Especie:**
- [ ] Bosque: Solo permite misma especie
- [ ] Prado: Solo permite especies diferentes
- [ ] Mensajes de error específicos para cada caso

### **Feedback Visual:**
- [ ] Dinosaurios seleccionados tienen borde dorado
- [ ] Slots disponibles tienen borde verde
- [ ] Slots no disponibles tienen borde rojo punteado
- [ ] La selección se limpia correctamente

---

## 🚀 **Prueba Rápida de 2 Minutos**

### **Paso 1:** Abrir `prueba-restricciones.html`
### **Paso 2:** Hacer clic en "🧪 Ejecutar Pruebas Automáticas"
### **Paso 3:** Verificar que muestre "🎉 Pruebas: X/X exitosas (100%)"
### **Paso 4:** Hacer clic en "🌲 Probar Bosque"
### **Paso 5:** Seleccionar "🦕 T1" y intentar colocar en slot 2 → Debe fallar
### **Paso 6:** Colocar en slot 1 → Debe funcionar

**Si todos estos pasos funcionan correctamente, las restricciones están implementadas correctamente.**

---

## 📞 **Resolución de Problemas**

### **Si algo no funciona:**

1. **Abrir la consola del navegador (F12)**
2. **Buscar errores de JavaScript**
3. **Verificar que todos los archivos se carguen correctamente:**
   - `ValidadorZona.js`
   - `pruebasRestricciones.js`
4. **Recargar la página (Ctrl+F5)**
5. **Intentar de nuevo**

### **Para debugging avanzado:**
```javascript
// En la consola del navegador:
console.log('ValidadorZona:', typeof ValidadorZona);
console.log('PruebasRestricciones:', typeof PruebasRestricciones);

// Crear instancia manual:
const validador = new ValidadorZona();
console.log('Validador creado:', validador);
```

---

**¡Con estas instrucciones deberías poder verificar inmediatamente si las restricciones están funcionando correctamente!** 🎉