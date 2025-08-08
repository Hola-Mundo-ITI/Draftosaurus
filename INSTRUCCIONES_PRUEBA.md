# 🚀 Instrucciones Rápidas para Probar las Restricciones

## 📋 Pasos para Verificar la Implementación

### 1. **Abrir el Juego**
1. Navega a `Draftosaurus/digital.php`
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña "Console"

### 2. **Ejecutar Pruebas Automatizadas**
```javascript
// Copia y pega en la consola:
ejecutarPruebasRestricciones();
```

**Resultado esperado:** Debe mostrar "🎉 ¡Todas las pruebas pasaron exitosamente!" con 100% de éxito.

### 3. **Pruebas Manuales Rápidas**

#### 🌲 **Bosque de la Semejanza** (Colocación Secuencial)
1. Selecciona un Triceratops
2. **Intenta colocarlo en el slot 2 del Bosque** → ❌ Debe fallar con mensaje "🌲 En el Bosque: coloca de izquierda a derecha sin espacios"
3. **Colócalo en el slot 1** → ✅ Debe funcionar
4. Selecciona otro Triceratops
5. **Intenta colocarlo en el slot 3** → ❌ Debe fallar
6. **Colócalo en el slot 2** → ✅ Debe funcionar

#### 🌾 **Prado de la Diferencia** (Colocación Secuencial + Especies Diferentes)
1. Selecciona un Stegosaurus
2. **Colócalo en el slot 1 del Prado** → ✅ Debe funcionar
3. Selecciona un Brontosaurus (especie diferente)
4. **Intenta colocarlo en el slot 3** → ❌ Debe fallar (no secuencial)
5. **Colócalo en el slot 2** → ✅ Debe funcionar
6. Selecciona otro Stegosaurus
7. **Intenta colocarlo en el slot 3** → ❌ Debe fallar (especie repetida)

#### 🏝️ **Isla Solitaria** (Único en Todo el Parque)
1. Selecciona un Pteranodon
2. **Colócalo en la Isla Solitaria** → ✅ Debe funcionar
3. Abre el modal de puntuación (botón "📊 Puntos")
4. **Verifica que la Isla da 7 puntos**
5. Selecciona otro Pteranodon
6. **Colócalo en cualquier otra zona** (ej: Bosque)
7. Abre el modal de puntuación nuevamente
8. **Verifica que la Isla ahora da 0 puntos** (ya no es único)

#### 👑 **Rey de la Selva** (Comparación con Otros Jugadores)
1. Selecciona un T-Rex
2. **Colócalo en Rey de la Selva** → ✅ Debe funcionar
3. Abre el modal de puntuación
4. **Verifica la puntuación** (depende de cuántos T-Rex tenga el otro jugador)

### 4. **Verificar Tooltips**
1. **Pasa el mouse sobre el Bosque de la Semejanza**
   - Debe mostrar: "**Reglas:** • Solo dinosaurios de la misma especie • Colocar de izquierda a derecha • Sin dejar espacios"

2. **Pasa el mouse sobre el Prado de la Diferencia**
   - Debe mostrar: "**Reglas:** • Solo especies diferentes • Colocar de izquierda a derecha • Sin dejar espacios"

3. **Pasa el mouse sobre la Isla Solitaria**
   - Debe mostrar: "**Reglas:** • Solo un dinosaurio • 7 puntos si es el único de su especie en TODO tu parque"

4. **Pasa el mouse sobre el Rey de la Selva**
   - Debe mostrar: "**Reglas:** • Solo un dinosaurio • 7 puntos si ningún rival tiene más de esa especie"

### 5. **Verificar Feedback Visual**
1. **Selecciona cualquier dinosaurio**
2. **Observa que solo se resaltan los slots realmente válidos** (no todos los slots vacíos)
3. **Para Bosque y Prado:** Solo el primer slot disponible debe resaltarse en azul con animación
4. **Para otras zonas:** Los slots disponibles se resaltan según sus reglas específicas

### 6. **Probar Casos Específicos**

#### Caso A: Secuencia en Bosque
```
Objetivo: Verificar que no se pueden dejar espacios
1. Coloca Triceratops en slot 1 del Bosque ✅
2. Coloca Triceratops en slot 2 del Bosque ✅  
3. Intenta colocar Triceratops en slot 4 del Bosque ❌
4. Debe mostrar error sobre colocación secuencial
```

#### Caso B: Isla Solitaria
```
Objetivo: Verificar unicidad en todo el parque
1. Coloca Pteranodon en Isla Solitaria ✅ (7 puntos)
2. Coloca Pteranodon en otra zona ✅
3. Verifica que Isla ahora da 0 puntos ✅
```

#### Caso C: Rey de la Selva
```
Objetivo: Verificar comparación entre jugadores
1. Coloca T-Rex en Rey de la Selva ✅
2. Verifica puntuación según contexto ✅
```

---

## 🔍 Comandos de Debugging

### En la Consola del Navegador:

```javascript
// Ejecutar todas las pruebas
ejecutarPruebasRestricciones();

// Probar zona específica
probarZona("bosque");
probarZona("prado");
probarZona("isla");
probarZona("rey");

// Acceder a objetos del juego
draftosaurusDebug.validador();
draftosaurusDebug.calculadora();
draftosaurusDebug.estado();

// Ver estado actual del tablero
draftosaurusDebug.estado().obtenerEstado().tablero;
```

---

## ✅ Lista de Verificación Rápida

- [ ] **Pruebas automatizadas pasan al 100%**
- [ ] **Bosque requiere colocación secuencial**
- [ ] **Prado requiere colocación secuencial + especies diferentes**
- [ ] **Isla Solitaria verifica unicidad en todo el parque**
- [ ] **Rey de la Selva compara con otros jugadores**
- [ ] **Tooltips muestran reglas actualizadas**
- [ ] **Solo slots válidos se resaltan**
- [ ] **Mensajes de error son específicos por zona**
- [ ] **Feedback visual funciona correctamente**

---

## 🚨 Problemas Comunes y Soluciones

### **Si las pruebas fallan:**
1. Verifica que todos los archivos se hayan guardado correctamente
2. Recarga la página (Ctrl+F5)
3. Verifica que no hay errores en la consola

### **Si los tooltips no aparecen:**
1. Verifica que `sistemaTooltips` esté cargado
2. Espera 1-2 segundos después de cargar la página
3. Intenta recargar la página

### **Si la validación no funciona:**
1. Verifica que `validadorZona` esté inicializado
2. Comprueba que no hay errores de JavaScript en la consola
3. Verifica que los slots tengan el atributo `data-slot` correcto

---

## 🎯 Resultado Esperado

Al completar todas estas pruebas, deberías ver:

1. **✅ Todas las pruebas automatizadas pasan**
2. **✅ Las restricciones secuenciales funcionan correctamente**
3. **✅ Las validaciones de contexto completo funcionan**
4. **✅ Los tooltips muestran información actualizada**
5. **✅ El feedback visual es claro y específico**
6. **✅ Los mensajes de error son informativos**

**¡Si todo funciona correctamente, la implementación está completa y lista para usar!** 🎉

---

**Tiempo estimado de prueba:** 5-10 minutos  
**Dificultad:** Fácil  
**Requisitos:** Navegador web moderno con consola de desarrollador