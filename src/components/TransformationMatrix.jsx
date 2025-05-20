/* import "./css/TransformationMatrix.css";
import { useEffect, useState } from "react";
import { simplify, parse } from 'mathjs';

// Verifica si un valor es numérico\ nconst isNumeric = (val) => {
const isNumeric = (val) => {
  return !isNaN(parseFloat(val)) && isFinite(val);
};


const roundIfCloseToZero = (value) => Math.abs(value) < 1e-10 ? 0 : value;

// Detecta y procesa ángulos con ±90°
const adjustAngleExpr = (exp) => {
  if (typeof exp === 'string') {
    // Quitar espacios
    const trimmed = exp.replace(/\s+/g, '');
    // Coincide base+90 o base-90
    const plusMatch = trimmed.match(/^(.+)\+90$/);
    const minusMatch = trimmed.match(/^(.+)-90$/);
    if (plusMatch) return { base: plusMatch[1], offset: 90 };
    if (minusMatch) return { base: minusMatch[1], offset: -90 };
  }
  return null;
};

const getCos = (exp) => {
  // Manejo de ajustes ±90°
  const adj = adjustAngleExpr(exp);
  if (adj) {
    // cos(base + 90) = -sin(base), cos(base - 90) = sin(base)
    const { base, offset } = adj;
    return offset === 90
      ? `-sin(${base})`
      : `sin(${base})`;
  }

  if (isNumeric(exp)) {
    return roundIfCloseToZero(Math.cos((parseFloat(exp) * Math.PI) / 180));
  }
  return `cos(${exp})`;
};

const getSin = (exp) => {
  // Manejo de ajustes ±90°
  const adj = adjustAngleExpr(exp);
  if (adj) {
    // sin(base + 90) = cos(base), sin(base - 90) = -cos(base)
    const { base, offset } = adj;
    return offset === 90
      ? `cos(${base})`
      : `-cos(${base})`;
  }

  if (isNumeric(exp)) {
    return roundIfCloseToZero(Math.sin((parseFloat(exp) * Math.PI) / 180));
  }
  return `sin(${exp})`;
};

// Procesa los parámetros lineales "a" y "d"
const processLinear = (exp) => (isNumeric(exp) ? parseFloat(exp) : exp);

// Simplifica automáticamente cualquier expresión
const simplifyExpr = (expr) => {
  try {
    return simplify(parse(expr)).toString();
  } catch (error) {
    console.warn("No se pudo simplificar:", expr);
    return expr;
  }
};

const safeMultiply = (x, y) => {
  const expr = `(${x}) * (${y})`;
  return simplifyExpr(expr);
};

const safeAdd = (x, y) => {
  const expr = `(${x}) + (${y})`;
  return simplifyExpr(expr);
};

export const multiplyMatrices = (A, B) => {
  let result = Array(4)
    .fill(null)
    .map(() => Array(4).fill(0));

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        const a = A[i][k];
        const b = B[k][j];
        let prod = safeMultiply(a, b);

        if (sum === 0) {
          sum = prod;
        } else if (prod !== 0) {
          sum = safeAdd(sum, prod);
        }
      }
      result[i][j] = sum;
    }
  }
  return result;
};  

export const computeMatrixA = ({ θ, α, a, d }) => {
  const cosT = getCos(θ);
  const sinT = getSin(θ);
  const cosA = getCos(α);
  const sinA = getSin(α);
  const aVal = processLinear(a);
  const dVal = processLinear(d);

  // Fila 1: [cosθ, -cosα*sinθ, sinθ*sinα, a*cosθ]
  const r1_1 = cosT;
  const r1_2 = safeMultiply(`-${cosA}`, sinT);
  const r1_3 = safeMultiply(sinT, sinA);
  const r1_4 = safeMultiply(aVal, cosT);

  // Fila 2: [sinθ, cosθ*cosα, -cosθ*sinα, a*sinθ]
  const r2_1 = sinT;
  const r2_2 = safeMultiply(cosT, cosA);
  const r2_3 = safeMultiply(`-${cosT}`, sinA);
  const r2_4 = safeMultiply(aVal, sinT);

  // Fila 3: [0, sinα, cosα, d]
  const r3_1 = 0;
  const r3_2 = sinA;
  const r3_3 = cosA;
  const r3_4 = dVal;

  // Fila 4: [0, 0, 0, 1]
  const r4 = [0, 0, 0, 1];

  return [
    [r1_1, r1_2, r1_3, r1_4],
    [r2_1, r2_2, r2_3, r2_4],
    [r3_1, r3_2, r3_3, r3_4],
    r4,
  ];
};

export const computeMatrixD = ({ θ, α, a, d }) => {
  const cosT = getCos(θ);
  const sinT = getSin(θ);
  const cosA = getCos(α);
  const sinA = getSin(α);
  const aVal = processLinear(a);
  const dVal = processLinear(d);

  // Fila 1: [cosθ, -sinθ, 0, a]
  const r1_1 = cosT;
  const r1_2 = safeMultiply(`-${sinT}`, 1);
  const r1_3 = 0;
  const r1_4 = aVal;

  // Fila 2: [sinθ*cosα, cosθ*cosα, -sinα, -d*sinα]
  const r2_1 = safeMultiply(sinT, cosA);
  const r2_2 = safeMultiply(cosT, cosA);
  const r2_3 = safeMultiply(`-${sinA}`, 1);
  const r2_4 = safeMultiply(`-${dVal}`, sinA);

  // Fila 3: [sinθ*sinα, cosθ*sinα, cosα, d*cosα]
  const r3_1 = safeMultiply(sinT, sinA);
  const r3_2 = safeMultiply(cosT, sinA);
  const r3_3 = cosA;
  const r3_4 = safeMultiply(dVal, cosA);

  // Fila 4: [0, 0, 0, 1]
  const r4 = [0, 0, 0, 1];

  return [
    [r1_1, r1_2, r1_3, r1_4],
    [r2_1, r2_2, r2_3, r2_4],
    [r3_1, r3_2, r3_3, r3_4],
    r4,
  ];
};

function TransformationMatrix({ dhParams, onMatricesComputed }) {
  const [finalMatrixA, setFinalMatrixA] = useState(null);
  const [finalMatrixD, setFinalMatrixD] = useState(null);

  useEffect(() => {
    if (dhParams.length > 0) {
      let resultA = computeMatrixA(dhParams[0]);
      for (let i = 1; i < dhParams.length; i++) {
        resultA = multiplyMatrices(resultA, computeMatrixA(dhParams[i]));
      }
      setFinalMatrixA(resultA);

      let resultD = computeMatrixD(dhParams[0]);
      for (let i = 1; i < dhParams.length; i++) {
        resultD = multiplyMatrices(resultD, computeMatrixD(dhParams[i]));
      }
      setFinalMatrixD(resultD);

      onMatricesComputed?.({ A: resultA, D: resultD });
    }
  }, [dhParams, onMatricesComputed]);

  const renderCell = (cell) => {
    if (typeof cell === "number") {
      return cell.toFixed(0);
    }
    return cell;
  };

  return (
    <div className="transformation-container">
      <h2 className="transformation-container-title">
        Matrices de Transformación
      </h2>

      <h4 className="title-descompotition">Descomposición en a</h4>
      {dhParams.map((params, index) => {
        const matrixA = computeMatrixA(params);
        return (
          <div key={index} className="matrix-container">
            <h3>
              T<sub>{index}</sub>
              <sup>{index + 1}</sup>
            </h3>
            <div className="matrix">
              {matrixA.flat().map((value, idx) => (
                <div key={idx}>{renderCell(value)}</div>
              ))}
            </div>
          </div>
        );
      })}

      {finalMatrixA && (
        <div className="final-matrix">
          <h2 className="final-matrix-title">
            Matriz de Transformación Final (Descomposición en A)
          </h2>
          <div className="matrix final">
            {finalMatrixA.flat().map((value, idx) => (
              <div key={idx}>{renderCell(value)}</div>
            ))}
          </div>
        </div>
      )}

      <h4 className="title-descompotition">Descomposición en d</h4>
      {dhParams.map((params, index) => {
        const matrixD = computeMatrixD(params);
        return (
          <div key={index} className="matrix-container">
            <h3>
              T<sub>{index}</sub>
              <sup>{index + 1}</sup>
            </h3>
            <div className="matrix">
              {matrixD.flat().map((value, idx) => (
                <div key={idx}>{renderCell(value)}</div>
              ))}
            </div>
          </div>
        );
      })}

      {finalMatrixD && (
        <div className="final-matrix">
          <h2 className="final-matrix-title">
            Matriz de Transformación Final (Descomposición en d)
          </h2>
          <div className="matrix final">
            {finalMatrixD.flat().map((value, idx) => (
              <div key={idx}>{renderCell(value)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TransformationMatrix;
 */

import "./css/TransformationMatrix.css";
import { useEffect, useState } from "react";
import { simplify, parse } from 'mathjs';

// Verifica si un valor es numérico
const isNumeric = (val) => {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

const roundIfCloseToZero = (value) => Math.abs(value) < 1e-10 ? 0 : value;

// Detecta y procesa ángulos con desplazamientos numéricos (e.g., +90, -90, +180)
const adjustAngleExpr = (exp) => {
  if (typeof exp === 'string') {
    const trimmed = exp.replace(/\s+/g, '');
    const match = trimmed.match(/^(.+?)([+-]\d+)$/);
    if (match) {
      const base = match[1];
      const offset = parseInt(match[2], 10);
      return { base, offset };
    }
  }
  return null;
};

const getCos = (exp) => {
  const adj = adjustAngleExpr(exp);
  if (adj) {
    const { base, offset } = adj;
    // Normaliza el offset a [0, 360)
    const o = ((offset % 360) + 360) % 360;
    switch (o) {
      case 0:
        return `cos(${base})`;
      case 90:
        return `-sin(${base})`;
      case 180:
        return `-cos(${base})`;
      case 270:
        return `sin(${base})`;
      default:
        return simplifyExpr(`cos((${base}) + (${offset}))`);
    }
  }
  if (isNumeric(exp)) {
    return roundIfCloseToZero(Math.cos((parseFloat(exp) * Math.PI) / 180));
  }
  return `cos(${exp})`;
};

const getSin = (exp) => {
  const adj = adjustAngleExpr(exp);
  if (adj) {
    const { base, offset } = adj;
    const o = ((offset % 360) + 360) % 360;
    switch (o) {
      case 0:
        return `sin(${base})`;
      case 90:
        return `cos(${base})`;
      case 180:
        return `-sin(${base})`;
      case 270:
        return `-cos(${base})`;
      default:
        return simplifyExpr(`sin((${base}) + (${offset}))`);
    }
  }
  if (isNumeric(exp)) {
    return roundIfCloseToZero(Math.sin((parseFloat(exp) * Math.PI) / 180));
  }
  return `sin(${exp})`;
};

// Procesa los parámetros lineales "a" y "d"
const processLinear = (exp) => (isNumeric(exp) ? parseFloat(exp) : exp);

// Simplifica cualquier expresión simbólica\ n
const simplifyExpr = (expr) => {
  try {
    return simplify(parse(expr)).toString();
  } catch (error) {
    console.warn("No se pudo simplificar:", expr);
    return expr;
  }
};

// Operaciones simbólicas seguras
const safeMultiply = (x, y) => {
  const expr = `(${x}) * (${y})`;
  return simplifyExpr(expr);
};

const safeAdd = (x, y) => {
  const expr = `(${x}) + (${y})`;
  return simplifyExpr(expr);
};

// Multiplica matrices 4x4 simbólicas
export const multiplyMatrices = (A, B) => {
  const result = Array(4).fill(null).map(() => Array(4).fill(0));
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        const prod = safeMultiply(A[i][k], B[k][j]);
        sum = sum === 0 ? prod : (prod !== 0 ? safeAdd(sum, prod) : sum);
      }
      result[i][j] = sum;
    }
  }
  return result;
};

// Matriz DH tipo A
export const computeMatrixA = ({ θ, α, a, d }) => {
  const cosT = getCos(θ);
  const sinT = getSin(θ);
  const cosA = getCos(α);
  const sinA = getSin(α);
  const aVal = processLinear(a);
  const dVal = processLinear(d);

  return [
    [cosT, safeMultiply(`-${cosA}`, sinT), safeMultiply(sinT, sinA), safeMultiply(aVal, cosT)],
    [sinT, safeMultiply(cosT, cosA), safeMultiply(`-${cosT}`, sinA), safeMultiply(aVal, sinT)],
    [0, sinA, cosA, dVal],
    [0, 0, 0, 1],
  ];
};

// Matriz DH tipo D
export const computeMatrixD = ({ θ, α, a, d }) => {
  const cosT = getCos(θ);
  const sinT = getSin(θ);
  const cosA = getCos(α);
  const sinA = getSin(α);
  const aVal = processLinear(a);
  const dVal = processLinear(d);

  return [
    [cosT, safeMultiply(`-${sinT}`, 1), 0, aVal],
    [safeMultiply(sinT, cosA), safeMultiply(cosT, cosA), safeMultiply(`-${sinA}`, 1), safeMultiply(`-${dVal}`, sinA)],
    [safeMultiply(sinT, sinA), safeMultiply(cosT, sinA), cosA, safeMultiply(dVal, cosA)],
    [0, 0, 0, 1],
  ];
};

function TransformationMatrix({ dhParams, onMatricesComputed }) {
  const [finalMatrixA, setFinalMatrixA] = useState(null);
  const [finalMatrixD, setFinalMatrixD] = useState(null);

  useEffect(() => {
    if (dhParams.length > 0) {
      let resA = computeMatrixA(dhParams[0]);
      dhParams.slice(1).forEach(p => { resA = multiplyMatrices(resA, computeMatrixA(p)); });
      setFinalMatrixA(resA);
      let resD = computeMatrixD(dhParams[0]);
      dhParams.slice(1).forEach(p => { resD = multiplyMatrices(resD, computeMatrixD(p)); });
      setFinalMatrixD(resD);
      onMatricesComputed?.({ A: resA, D: resD });
    }
  }, [dhParams, onMatricesComputed]);

  const renderCell = (cell) => typeof cell === 'number' ? cell.toFixed(0) : cell;

  return (
    <div className="transformation-container">
      <h2 className="transformation-container-title">Matrices de Transformación</h2>
      <h4 className="title-descompotition">Descomposición en a</h4>
      {dhParams.map((params, i) => (
        <div key={i} className="matrix-container">
          <h3>T<sub>{i}</sub><sup>{i + 1}</sup></h3>
          <div className="matrix">{computeMatrixA(params).flat().map((v, idx) => <div key={idx}>{renderCell(v)}</div>)}</div>
        </div>
      ))}
      {finalMatrixA && (
        <div className="final-matrix">
          <h2 className="final-matrix-title">Matriz Final (A)</h2>
          <div className="matrix final">{finalMatrixA.flat().map((v, idx) => <div key={idx}>{renderCell(v)}</div>)}</div>
        </div>
      )}
      <h4 className="title-descompotition">Descomposición en d</h4>
      {dhParams.map((params, i) => (
        <div key={i} className="matrix-container">
          <h3>T<sub>{i}</sub><sup>{i + 1}</sup></h3>
          <div className="matrix">{computeMatrixD(params).flat().map((v, idx) => <div key={idx}>{renderCell(v)}</div>)}</div>
        </div>
      ))}
      {finalMatrixD && (
        <div className="final-matrix">
          <h2 className="final-matrix-title">Matriz Final (D)</h2>
          <div className="matrix final">{finalMatrixD.flat().map((v, idx) => <div key={idx}>{renderCell(v)}</div>)}</div>
        </div>
      )}
    </div>
  );
}

export default TransformationMatrix;
