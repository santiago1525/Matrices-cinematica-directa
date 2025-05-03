// src/utils/jacobian.js
import { computeMatrixA, multiplyMatrices } from '../components/TransformationMatrix';


// --- Helpers de álgebra simbólica/numérica ---
const isNumber = (x) => typeof x === 'number';
const isZero   = (x) => x === 0 || x === '0';

// suma segura: números los suma, ceros los omite, cadenas las concatena
function safeAdd(x, y) {
  if (isZero(x)) return y;
  if (isZero(y)) return x;
  if (isNumber(x) && isNumber(y)) return x + y;
  return `(${x}) + (${y})`;
}

// resta segura
function safeSubtract(x, y) {
  if (isZero(y)) return x;
  if (isNumber(x) && isNumber(y)) return x - y;
  return `(${x}) - (${y})`;
}

// multiplicación segura
function safeMultiply(x, y) {
  if (isZero(x) || isZero(y)) return 0;
  if (isNumber(x) && isNumber(y)) return x * y;
  return `(${x})*(${y})`;
}

// cross product simbólico/numérico
function cross(a, b) {
  const [ax, ay, az] = a;
  const [bx, by, bz] = b;
  return [
    safeSubtract( safeMultiply(ay, bz), safeMultiply(az, by) ),
    safeSubtract( safeMultiply(az, bx), safeMultiply(ax, bz) ),
    safeSubtract( safeMultiply(ax, by), safeMultiply(ay, bx) ),
  ];
}

// mat·vec: produce suma de productos simbólicos
function matVec(J, qDot) {
  return J.map(row => 
    row.reduce((acc, Jij, i) => {
      const prod = safeMultiply(Jij, qDot[i]);
      return safeAdd(acc, prod);
    }, 0)
  );
}


// Importa aquí tus funciones de transformación numérico/simbólica
// (las que extraíste a src/utils/transformations.js)


/**
 * @param dhParams Array<{θ, α, a, d}>  // pueden ser cadenas o números
 * @param qDot     Array<number|string>  // velocidades articulares (num o simbólicas)
 * @param finalA   number[][]|string[][] // matriz final A (columna 3 con o_n)
 * @returns {{
 *   v:     (number|string)[],
 *   omega: (number|string)[],
 *   J:     (number|string)[][] 
 * }}
 */
export function computeVelocities(dhParams, qDot, finalA) {
  const n = dhParams.length;

  // 1) Extrae o_n de finalA (columna 3)
  const o_n = [
    finalA[0][3],
    finalA[1][3],
    finalA[2][3],
  ];

  // 2) Reconstruye T⁰ⁱ para extraer zᵢ⁻¹ y oᵢ⁻¹
  let T = [
    [1,0,0,0],
    [0,1,0,0],
    [0,0,1,0],
    [0,0,0,1],
  ];
  const zs = [], os = [];
  for (let i = 0; i < n; i++) {
    T = multiplyMatrices(T, computeMatrixA(dhParams[i]));
    zs.push([ T[0][2], T[1][2], T[2][2] ]);
    os.push([ T[0][3], T[1][3], T[2][3] ]);
  }

  // 3) Construye el Jacobiano simbólico/numérico 6×n
  const J = Array(6).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    const Jv = cross(zs[i], subtractPoints(o_n, os[i]));
    const Jw = zs[i];
    for (let k = 0; k < 3; k++) {
      J[k    ][i] = Jv[k];
      J[k + 3][i] = Jw[k];
    }
  }

  // 4) Multiplica J · qDot
  const vel6 = matVec(J, qDot);

  return {
    v:     vel6.slice(0, 3),
    omega: vel6.slice(3, 6),
    J
  };
}

// Helper que resta puntos/vector simbólico
function subtractPoints(a, b) {
  return [
    safeSubtract(a[0], b[0]),
    safeSubtract(a[1], b[1]),
    safeSubtract(a[2], b[2]),
  ];
}
