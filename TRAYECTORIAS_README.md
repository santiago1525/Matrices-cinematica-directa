# Módulo de Cálculo de Trayectorias

## Descripción General

Se ha implementado un módulo completo de cálculo de trayectorias robóticas basado en el método de **perfil trapezoidal de velocidad** y **polinomios cúbicos** para cada articulación.

## Implementación

### Archivos Creados

1. **`src/components/TrajectoryCalculator.jsx`**: Componente principal que calcula y muestra las trayectorias
2. **`src/components/css/TrajectoryCalculator.css`**: Estilos para el componente

### Archivos Modificados

- **`src/App.js`**: Integrado como paso 5 en el flujo de la aplicación

## Funcionalidades Implementadas

### 1. Planificación de Segmentos (Perfil Trapezoidal)

El módulo calcula tres segmentos de movimiento:

#### **Segmento de Aceleración**
- Fórmula: `L_acc = (v_r² - v_1²) / (2 * a_max)`
- Tiempo: `t_acc = (v_r - v_1) / a_max`

#### **Segmento de Velocidad Constante**
- Fórmula: `L_mid = L - L_acc - L_dec`
- Tiempo: `t_mid = L_mid / v_r`

#### **Segmento de Deceleración**
- Fórmula: `L_dec = (v_r² - v_2²) / (2 * a_max)`
- Tiempo: `t_dec = (v_r - v_2) / a_max`

#### **Tiempo Total**
- Fórmula: `t_total = t_acc + t_mid + t_dec`

### 2. Polinomios Cúbicos para Articulaciones

Para cada articulación, se calcula un polinomio cúbico que define la trayectoria suave:

**Forma general**: `θ(t) = a₀ + a₁·t + a₂·t² + a₃·t³`

**Condiciones de contorno**:
- `θ(0) = θ_inicial` → `a₀ = θ_inicial`
- `θ(t_f) = θ_final`
- `θ̇(0) = 0` → `a₁ = 0`
- `θ̇(t_f) = 0`

**Coeficientes calculados**:
- `a₀ = θ_inicial`
- `a₁ = 0`
- `a₂ = 3·Δθ / t_f²`
- `a₃ = -2·Δθ / t_f³`

Donde `Δθ = θ_final - θ_inicial`

### 3. Perfiles de Trayectoria

Para cada articulación se generan 100 puntos que incluyen:
- **Posición**: `θ(t)`
- **Velocidad**: `θ̇(t) = a₁ + 2·a₂·t + 3·a₃·t²`
- **Aceleración**: `θ̈(t) = 2·a₂ + 6·a₃·t`

## Interfaz de Usuario

### Entradas Requeridas

#### Datos del Segmento:
- **Longitud del segmento (L)**: Distancia total del movimiento [m]
- **Velocidad nominal (v_r)**: Velocidad máxima deseada [m/s]
- **Velocidad inicial (v_1)**: Velocidad al inicio [m/s]
- **Velocidad final (v_2)**: Velocidad al final [m/s]
- **Aceleración máxima (a_max)**: Aceleración límite [m/s²]

#### Posiciones Angulares:
Para cada articulación:
- **θ inicial**: Posición angular inicial [grados]
- **θ final**: Posición angular final [grados]

### Resultados Mostrados

#### 1. Planificación de Segmentos
- Distancias de aceleración, velocidad constante y deceleración
- Tiempos de cada fase
- Tiempo total de movimiento
- Descripción textual del proceso

#### 2. Polinomios Cúbicos
Para cada articulación:
- **Coeficientes** (a₀, a₁, a₂, a₃)
- **Cambio angular total** (Δθ)
- **Ecuación de posición** formateada
- **Tabla con puntos representativos** (tiempo, posición, velocidad, aceleración)

#### 3. Visualización Gráfica
- Gráficas SVG de la trayectoria de posición vs tiempo para cada articulación

## Ejemplo de Uso

### Datos de Entrada (Basado en el ejemplo del PDF):
```
Longitud del segmento: 0.5 m
Velocidad nominal: 0.15 m/s
Velocidad inicial: 0 m/s
Velocidad final: 0 m/s
Aceleración máxima: 0.1 m/s²

Articulación 1:
  - θ inicial: 15°
  - θ final: 75°
```

### Resultados Esperados:
```
L_acc = 0.1125 m
L_mid = 0.275 m
L_dec = 0.1125 m
t_acc = 1.5 s
t_mid = 1.83 s
t_dec = 1.5 s
t_total = 4.83 s

Polinomio: θ(t) = 15 + 15t² - 3.2t³
```

## Flujo de la Aplicación

```
Paso 1: Seleccionar número de eslabones
  ↓
Paso 2: Ingresar parámetros DH
  ↓
Paso 3: Calcular matrices de transformación
  ↓
Paso 4: Calcular velocidades (Jacobiano)
  ↓
Paso 5: Calcular trayectorias ← NUEVO
```

## Tecnologías Utilizadas

- **React**: Framework para la interfaz
- **mathjs**: Cálculos matemáticos y derivadas
- **CSS**: Estilos responsivos y modernos
- **SVG**: Visualización de gráficas

## Características Técnicas

- ✅ Cálculo automático de todos los parámetros
- ✅ Generación de perfiles de trayectoria punto por punto
- ✅ Visualización de resultados completos
- ✅ Gráficas interactivas
- ✅ Diseño responsivo
- ✅ Validación de entradas
- ✅ Formato matemático claro

## Notas Importantes

1. El módulo asume que las articulaciones parten y llegan con velocidad cero (reposo)
2. Los polinomios cúbicos garantizan transiciones suaves sin discontinuidades
3. El perfil trapezoidal optimiza el tiempo de movimiento con las restricciones de velocidad y aceleración
4. Todos los cálculos siguen las ecuaciones presentadas en el material de referencia

## Próximas Mejoras Posibles

- [ ] Exportar resultados a CSV/Excel
- [ ] Gráficas más avanzadas (usando bibliotecas como Chart.js o Recharts)
- [ ] Animación 3D del robot siguiendo la trayectoria
- [ ] Perfiles de trayectoria alternativos (quintica, senoidal)
- [ ] Detección de colisiones
- [ ] Optimización de trayectorias
