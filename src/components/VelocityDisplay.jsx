// src/components/VelocityDisplay.jsx
import React, { useState } from 'react';
import Algebrite from 'algebrite';
import { create, all } from 'mathjs';
import './css/VelocityDisplay.css';

const math = create(all);

export default function VelocityDisplay({ mats, numLinks }) {
  const [variablesInput, setVariablesInput] = useState('');
  const [derivatives, setDerivatives] = useState([]);
  const [selected, setSelected] = useState(true); // true para matriz A, false para matriz D
  const [matrixDerivatives, setMatrixDerivatives] = useState([]);
  const [determinantExpr, setDeterminantExpr] = useState('');

  // Estado para controlar si es paralelo o rotado para cada eslabón
  // Array de booleanos: true = paralelo, false = rotado
  const [zParallelArray, setZParallelArray] = useState(Array(numLinks).fill(true));

  if (!mats.A || !mats.D) return <p>Las matrices no están disponibles.</p>;

  // Obtener la columna de posición de las matrices A y D
  const ColumnA = mats.A.slice(0, 3).map(row => String(row[3]));
  const ColumnD = mats.D.slice(0, 3).map(row => String(row[3]));

  // Función para obtener el vector Z (tercera columna) de la matriz seleccionada y fila dada
  // Convirtiendo cada componente a string legible para evitar objetos internos
  const getVectorZ = (mat, index) => {
    if (!mat || mat.length === 0) return ['0', '0', '0'];
    // mat es una matriz 4x4 (asumo)
    // La columna Z son los elementos mat[0][2], mat[1][2], mat[2][2]
    // Usamos toString() para convertir objetos simbólicos a string legible
    return [
      mat[0][2] ? mat[0][2].toString() : '0',
      mat[1][2] ? mat[1][2].toString() : '0',
      mat[2][2] ? mat[2][2].toString() : '0',
    ];
  };

  // El vector z0 siempre es [0,0,1]
  const vectorZ0 = ['0', '0', '1'];

  // Construir la matriz de velocidades angulares
  // Se usa zParallelArray para decidir qué vector asignar a cada columna
  const buildAngularVelocityMatrix = () => {
    const mat = selected ? mats.A : mats.D;
    let angularMatrix = [];

    for (let i = 0; i < numLinks; i++) {
      if (zParallelArray[i]) {
        // Paralelo -> vector [0,0,1]
        angularMatrix.push(vectorZ0);
      } else {
        // Rotado -> tomar vector Z de la matriz
        angularMatrix.push(getVectorZ(mat, i));
      }
    }
    return angularMatrix;
  };

  const handleCalculateDerivatives = (Column) => {
    try {
      const variables = variablesInput.split(',').map(v => v.trim()).filter(v => v);
      const symbols = variables.map(v => math.parse(v).name);

      // Matriz original en caso de error
      /* const matrix = symbols.map(sym => {
        return Column.map(exprStr => {
          try {
            const parsedExpr = math.parse(exprStr);
            const deriv = math.derivative(parsedExpr, sym);
            return deriv.toString();
          } catch (err) {
            return `Error: ${err.message}`;
          }
        });
      }); */

      const matrix = Column.map(exprStr => {
        return symbols.map(sym => {
          try {
            const parsedExpr = math.parse(exprStr);
            const deriv = math.derivative(parsedExpr, sym);
            return deriv.toString();
          } catch (err) {
            return `Error: ${err.message}`;
          }
        });
      });

      setMatrixDerivatives(matrix);

      const derivs = Column.map((exprStr, index) => {
        const parsedExpr = math.parse(exprStr);
        const derivadasPorVar = symbols.map(sym => {
          try {
            const deriv = math.derivative(parsedExpr, sym);
            return { variable: sym, result: deriv.toString() };
          } catch (err) {
            return { variable: sym, result: `Error al derivar: ${err.message}` };
          }
        });
        return {
          original: exprStr,
          derivadas: derivadasPorVar,
        };
      });
      setDerivatives(derivs);

    } catch (err) {
      console.error("Error en el cálculo de derivadas:", err);
      alert("Error en la entrada o el cálculo: " + err.message);
    }
  };

  const handleCalculateDeterminant = () => {
  let rows = matrixDerivatives.length;
  let cols = matrixDerivatives[0]?.length || 0;

  // Determinar el tamaño máximo
  const maxSize = Math.max(rows, cols);

  // Rellenar la matriz con ceros hasta que sea cuadrada
  const squaredMatrix = Array.from({ length: maxSize }, (_, i) => 
    Array.from({ length: maxSize }, (_, j) => 
      (matrixDerivatives[i]?.[j] !== undefined ? matrixDerivatives[i][j] : '0')
    )
  );

  try {
    // Prepara la matriz en formato Algebrite
    const algebriteMatrixString = '[' +
      squaredMatrix.map(row =>
        '[' + row.map(cell =>
          cell
            .replace(/θ/g, 'theta')
            .replace(/π/g, 'pi')
        ).join(',') + ']'
      ).join(',') + ']';

    const result = Algebrite.run(`det(${algebriteMatrixString})`);
    const simplified = Algebrite.run(`simplify(${result})`);
    const finalResult = simplified.toString().replace(/theta/g, 'θ').replace(/pi/g, 'π');

    setDeterminantExpr(finalResult);

  } catch (err) {
    setDeterminantExpr(`Error al calcular el determinante con Algebrite: ${err.message}`);
  }
};


  // Handler para cambiar si el vector z es paralelo o rotado para un eslabón
  const handleZParallelChange = (index, value) => {
    const newArray = [...zParallelArray];
    newArray[index] = value === 'paralelo';
    setZParallelArray(newArray);
  };

  // Obtener matriz de velocidades angulares construida
  const angularVelMatrix = buildAngularVelocityMatrix();

  return (
    <>
      {/* Selección Matriz A o D */}
      <h3 className='indicator'>Seleccione la matriz:</h3>
      <div className='button-selected-container'>
        <button
          className='button-selected'
          onClick={() => setSelected(true)}
          style={selected ? { backgroundColor: '#D36135', color: '#fff' } : { backgroundColor: '#fff', color: '#000' }}
        >
          Matriz A
        </button>
        <button
          className='button-selected'
          onClick={() => setSelected(false)}
          style={selected ? { backgroundColor: '#fff', color: '#000' } : { backgroundColor: '#D36135', color: '#fff' }}
        >
          Matriz D
        </button>
      </div>

      {selected ? (
        <>
          <div className="velocity-display-container">
            <div className="vector">
              <h3>Vector Posición de la matriz A:</h3>
              <p>{JSON.stringify(ColumnA, null, 2)}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="velocity-display-container">
            <div className="vector">
              <h3>Vector Posición de la matriz D:</h3>
              <p>{JSON.stringify(ColumnD, null, 2)}</p>
            </div>
          </div>
        </>
      )}

      <h3 className='indicator'>
        Ingresa las variables simbólicas separadas por comas (por ejemplo: θ1,θ2,a1,a2):
      </h3>
      <input
        value={variablesInput}
        onChange={(e) => setVariablesInput(e.target.value)}
        className="input-box derivatives-button"
        placeholder="θ1,θ2,a1,a2"
      />
      <button
        className="App-button"
        onClick={() => handleCalculateDerivatives(selected ? ColumnA : ColumnD)}
      >
        Calcular Derivadas
      </button>

      <div className="derivative-results">
        {derivatives.map((entry, i) => (
          <div key={i} className="derivative-block">
            <p className="original-expression">{entry.original}</p>
            {entry.derivadas.map((d, j) => (
              <div key={j} className="derivative-line">
                <div className="symbol">
                  <span>d</span>
                  <span className="fraction-line" />
                  <span>d({d.variable})</span>
                </div>
                <span className="result">{d.result}</span>
              </div>
            ))}
          </div>
        ))}

        {matrixDerivatives.length > 0 && (
          <div className="matrix-display">
            <h3>Matriz Velocidades Lineales:</h3>
            <table className="derivative-matrix">
              <tbody>
                {matrixDerivatives.map((row, i) => (
                  <tr key={i}>
                    {row.map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {matrixDerivatives.length > 0 && (
          <div className="determinant-section">
            <button className="App-button" onClick={handleCalculateDeterminant}>
              Calcular Determinante
            </button>

            {determinantExpr && (
              <>
                <h3>Determinante Simbólico:</h3>
                <div className="container-determinant">
                  <p className='determinant'>{determinantExpr}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Selector para cada eslabón - paralelo o rotado */}
      <div className="z-parallel-selector">
        <h3>Seleccione la relación entre z₀ y zᵢ para cada eslabón:</h3>
        {Array.from({ length: numLinks }, (_, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <label><b>Eslabón {i + 1}:</b></label>{' '}
            <select
              value={zParallelArray[i] ? 'paralelo' : 'rotado'}
              onChange={(e) => handleZParallelChange(i, e.target.value)}
            >
              <option value="paralelo">Paralelo</option>
              <option value="rotado">Rotado</option>
            </select>
          </div>
        ))}
      </div>

      {/* Mostrar matriz angular resultante */}
      <div className="angular-velocity-matrix">
        <h3>Matriz de Velocidades Angulares:</h3>
        <table className="angular-matrix-table">
          <thead>
          </thead>
          <tbody>
            {[0, 1, 2].map(row => (
              <tr key={row}>
                {angularVelMatrix.map((vec, col) => (
                  <td key={col}>{vec[row]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}





