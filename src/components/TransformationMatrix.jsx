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

// Aplica identidades trigonométricas comunes
const applyTrigIdentities = (expr) => {
  if (typeof expr !== 'string') return expr;
  
  let result = expr;
  
  // Identidad: cos(a) * cos(b) + sin(a) * sin(b) = cos(a - b)
  result = result.replace(
    /cos\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)\s*\+\s*sin\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `cos((${a1}) - (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: cos(a) * cos(b) - sin(a) * sin(b) = cos(a + b)
  result = result.replace(
    /cos\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)\s*-\s*sin\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `cos((${a1}) + (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: sin(a) * cos(b) + cos(a) * sin(b) = sin(a + b)
  result = result.replace(
    /sin\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)\s*\+\s*cos\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `sin((${a1}) + (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: sin(a) * cos(b) - cos(a) * sin(b) = sin(a - b)
  result = result.replace(
    /sin\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)\s*-\s*cos\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `sin((${a1}) - (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: cos(a) * sin(b) + sin(a) * cos(b) = sin(a + b) (orden alternativo)
  result = result.replace(
    /cos\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)\s*\+\s*sin\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `sin((${a1}) + (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: cos(a) * sin(b) - sin(a) * cos(b) = sin(b - a)
  result = result.replace(
    /cos\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)\s*-\s*sin\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `sin((${b1}) - (${a1}))`;
      }
      return match;
    }
  );
  
  // Simplificar expresiones con paréntesis redundantes
  result = result.replace(/\(\(([^)]+)\)\)/g, '($1)');
  
  // Simplificar sumas/restas con cero
  result = result.replace(/\s*\+\s*0\s*/g, '');
  result = result.replace(/\s*-\s*0\s*/g, '');
  result = result.replace(/^0\s*\+\s*/, '');
  
  return result;
};

// Simplifica cualquier expresión simbólica
const simplifyExpr = (expr) => {
  try {
    let simplified = simplify(parse(expr)).toString();
    // Aplicar identidades trigonométricas después de la simplificación básica
    simplified = applyTrigIdentities(simplified);
    return simplified;
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
      <h4 className="title-descompotition">Descomposición en a (RTTR)</h4>
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
      <h4 className="title-descompotition">Descomposición en d (RTRT)</h4>
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
