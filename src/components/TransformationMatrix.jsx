import "./css/TransformationMatrix.css";
import { useEffect, useState } from "react";
import { simplify, parse } from 'mathjs';


// Verifica si un valor es numérico
const isNumeric = (val) => {
  return !isNaN(parseFloat(val)) && isFinite(val);
};


const roundIfCloseToZero = (value) => Math.abs(value) < 1e-10 ? 0 : value;

const getCos = (exp) => {
  if (isNumeric(exp)) {

    return roundIfCloseToZero(Math.cos((parseFloat(exp) * Math.PI) / 180));
  } else {
    return `cos(${exp})`;
  }
};

const getSin = (exp) => {
  if (isNumeric(exp)) {
    
    return roundIfCloseToZero(Math.sin((parseFloat(exp) * Math.PI) / 180));
  } else {
    return `sin(${exp})`;
  }
};

// Procesa los parámetros lineales "a" y "d"
const processLinear = (exp) => (isNumeric(exp) ? parseFloat(exp) : exp);

// Simplifica automáticamente cualquier expresión

// Función general de simplificación simbólica
const simplifyExpr = (expr) => {
  try {
    // Parsea y simplifica usando reglas simbólicas estándar
    return simplify(parse(expr)).toString();
  } catch (error) {
    console.warn("No se pudo simplificar:", expr);
    return expr;
  }
};

// Multiplicación segura con simplificación simbólica completa
const safeMultiply = (x, y) => {
  const expr = `(${x}) * (${y})`;
  return simplifyExpr(expr);
};

// Suma segura con simplificación simbólica completa
const safeAdd = (x, y) => {
  const expr = `(${x}) + (${y})`;
  return simplifyExpr(expr);
}; 



// Multiplicación de matrices 4x4: se opera término a término
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


// Construye la matriz de transformación "A"
export const computeMatrixA = ({ θ, α, a, d }) => {
  const cosT = getCos(θ);
  const sinT = getSin(θ);
  const cosA = getCos(α);
  const sinA = getSin(α);
  const aVal = processLinear(a);
  const dVal = processLinear(d);


  // Fila 1: [cosθ, -cosα*sinθ, sinθ*sinα, a*cosθ]
  const r1_1 = cosT;
  const r1_2 = safeMultiply(`-${cosA}`,sinT);
  const r1_3 = safeMultiply(sinT, sinA);
  const r1_4 = safeMultiply(aVal, cosT);

  // Fila 2: [sinθ, cosθ*cosα, -cosθ*sinα, a*sinθ]
  const r2_1 = sinT;
  const r2_2 = safeMultiply(cosT,cosA);
  const r2_3 = safeMultiply(`-${cosT}`,sinA);
  const r2_4 = safeMultiply(aVal,sinT);

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


// Construye la matriz de transformación "D"
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
  const r2_1 = safeMultiply(sinT,cosA);
  const r2_2 = safeMultiply(cosT,cosA);
  const r2_3 = safeMultiply(`-${sinA}`, 1);
  const r2_4 = safeMultiply(`-${dVal}`,sinA);

  // Fila 3: [sinθ*sinα, cosθ*sinα, cosα, d*cosα]
  const r3_1 = safeMultiply(sinT,sinA);
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
      // Cálculo de la matriz final para A
      let resultA = computeMatrixA(dhParams[0]);
      for (let i = 1; i < dhParams.length; i++) {
        resultA = multiplyMatrices(resultA, computeMatrixA(dhParams[i]));
      }
      setFinalMatrixA(resultA);

      // Cálculo de la matriz final para D
      let resultD = computeMatrixD(dhParams[0]);
      for (let i = 1; i < dhParams.length; i++) {
        resultD = multiplyMatrices(resultD, computeMatrixD(dhParams[i]));
      }
      setFinalMatrixD(resultD);

      onMatricesComputed?.({A: resultA, D: resultD})
    }
  }, [dhParams, onMatricesComputed]);

  // Función para renderizar una celda: si es numérica se formatea a 4 decimales
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

      {/* Sección de matrices descompuestas en A  */}
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

      {/* Matriz Final para A  */}
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

      {/* Sección de matrices descompuestas en D */} 
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

      {/*  Matriz Final para D */} 
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

