import "./css/TransformationMatrix.css";
import { useEffect, useState } from "react";

// Función para convertir grados a radianes
const degToRad = (deg) => (deg * Math.PI) / 180;

// Función para multiplicar dos matrices 4x4
const multiplyMatrices = (A, B) => {
  let result = Array(4).fill(0).map(() => Array(4).fill(0));

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
};

function TransformationMatrix({ dhParams }) {
  const [finalMatrixA, setFinalMatrixA] = useState(0);
  const [finalMatrixD, setFinalMatrixD] = useState(0);

  // Calcular matriz descomponiendo a
  const computeMatrixA = ({ θ, α, a, d }) => {
    const t = degToRad(θ);
    const al = degToRad(α);

    return [
      [Math.cos(t), -Math.cos(al) * Math.sin(t), Math.sin(t) * Math.sin(al), a * Math.cos(t)],
      [Math.sin(t), Math.cos(t) * Math.cos(al), -Math.sin(al) * Math.cos(t), a * Math.sin(t)],
      [0, Math.sin(al), Math.cos(al), d],
      [0, 0, 0, 1]
    ];
  };

  // Calcular matriz descomponiendo d
  const computeMatrixD = ({ θ, α, a, d }) => {
    const t = degToRad(θ);
    const al = degToRad(α);

    return [
      [Math.cos(t), -Math.sin(t), 0, a],
      [Math.sin(t) * Math.cos(al), Math.cos(t) * Math.cos(al), -Math.sin(al), -d * Math.sin(al)],
      [Math.sin(t) * Math.sin(al), Math.cos(t) * Math.sin(al), Math.cos(al), d * Math.cos(al)],
      [0, 0, 0, 1]
    ];
  };

  useEffect(() => {
    if (dhParams.length > 0) {
      let resultA = computeMatrixA(dhParams[0]);
      let resultD = computeMatrixD(dhParams[0]);

      for (let i = 1; i < dhParams.length; i++) {
        resultA = multiplyMatrices(resultA, computeMatrixA(dhParams[i]));
        resultD = multiplyMatrices(resultD, computeMatrixD(dhParams[i]));
      }

      setFinalMatrixA(resultA);
      setFinalMatrixD(resultD);
    }
  }, [dhParams]);

  return (
    <div className="transformation-container">
      <h2>Matrices de Transformación</h2>

      {/* Descomposición en A */}
      <h4 className="title-descompotition">Descomposición en a</h4>
      {dhParams.map((params, index) => {
        const matrixA = computeMatrixA(params);
        return (
          <div key={index} className="matrix-container">
            <h3>T_{index}^{index + 1}</h3>
            <div className="matrix">
              {matrixA.flat().map((value, idx) => (
                <div key={idx}>{value.toFixed(4)}</div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Matriz Final Descomposición en A */}
      {finalMatrixA && (
        <div className="final-matrix">
          <h2>Matriz de Transformación Final (Descomposición en A)</h2>
          <div className="matrix">
            {finalMatrixA.flat().map((value, idx) => (
              <div key={idx}>{value.toFixed(4)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Descomposición en D */}
      <h4 className="title-descompotition">Descomposición en d</h4>
      {dhParams.map((params, index) => {
        const matrixD = computeMatrixD(params);
        return (
          <div key={index} className="matrix-container">
            <h3>T_{index}^{index + 1}</h3>
            <div className="matrix">
              {matrixD.flat().map((value, idx) => (
                <div key={idx}>{value.toFixed(4)}</div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Matriz Final Descomposición en D */}
      {finalMatrixD && (
        <div className="final-matrix">
          <h2>Matriz de Transformación Final (Descomposición en D)</h2>
          <div className="matrix">
            {finalMatrixD.flat().map((value, idx) => (
              <div key={idx}>{value.toFixed(4)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TransformationMatrix;
