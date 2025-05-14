// src/components/VelocityDisplay.jsx
import React, { useState } from 'react';
// Agrega esta línea arriba junto con tus imports
import Algebrite from 'algebrite';
import { create, all } from 'mathjs';
import './css/VelocityDisplay.css';

const math = create(all);

export default function VelocityDisplay({ mats }) {
  const [variablesInput, setVariablesInput] = useState('');
  const [derivatives, setDerivatives] = useState([]);
  const [selected, setSelected] = useState(true);
  const [matrixDerivatives, setMatrixDerivatives] = useState([]);
  const [determinantExpr, setDeterminantExpr] = useState('');


  if (!mats.A || !mats.D) return <p>Las matrices no están disponibles.</p>;

  // Obtener la columna de posición de las matrices A y D
  const ColumnA = mats.A.slice(0, 3).map(row => String(row[3]));
  const ColumnD = mats.D.slice(0, 3).map(row => String(row[3]));

  const handleCalculateDerivatives = (Column) => {
    try {
      const variables = variablesInput.split(',').map(v => v.trim()).filter(v => v);
      const symbols = variables.map(v => math.parse(v).name);

      const matrix = symbols.map(sym => {
        return Column.map(exprStr => {
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

      // También conservamos el estado antiguo en caso de que lo uses aún en la interfaz
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
    if (matrixDerivatives.length !== matrixDerivatives[0]?.length) {
      setDeterminantExpr("La matriz no es cuadrada. No se puede calcular el determinante.");
      return;
    }

    try {
      // Prepara la matriz en formato Algebrite (cadena tipo matriz)
      const algebriteMatrixString = '[' +
        matrixDerivatives.map(row =>
          '[' + row.map(cell =>
            cell
              .replace(/θ/g, 'theta') // reemplazo por compatibilidad
              .replace(/π/g, 'pi')
          ).join(',') + ']'
        ).join(',') + ']';

      // Ejecuta el determinante con Algebrite
      const result = Algebrite.run(`det(${algebriteMatrixString})`);
      const simplified = Algebrite.run(`simplify(${result})`);

      // Convertir 'theta' a su símbolo 'θ' en el resultado
      const finalResult = simplified.toString().replace(/theta/g, 'θ').replace(/pi/g, 'π');

      // Actualiza el estado con el determinante simbólico
      setDeterminantExpr(finalResult);

    } catch (err) {
      setDeterminantExpr(`Error al calcular el determinante con Algebrite: ${err.message}`);
    }
  };





  return (
    <>
      {/* // Pestañas */}
      <h3 className='indicator'>Seleccione la matriz:</h3>
      <div className='button-selected-container'>
        <button className='button-selected'
          onClick={() => setSelected(true)}
          style={selected ? { backgroundColor: '#D36135', color: '#fff' } : { backgroundColor: '#fff', color: '#000' }}
        >
          Matriz A
        </button>
        <button className='button-selected'
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

          <h3 className='indicator'>Ingresa las variables simbólicas separadas por comas (por ejemplo: θ1,θ2,a1,a2):</h3>
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
        </>
      ) : (
        <>
          <div className="velocity-display-container">
            <div className="vector">
              <h3>Vector Posición de la matriz D:</h3>
              <p>{JSON.stringify(ColumnD, null, 2)}</p>
            </div>
          </div>

          <h3 className='indicator'>Ingresa las variables simbólicas separadas por comas (por ejemplo: θ1,θ2,a1,a2):</h3>
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


        </>
      )}




    </>

  );
}

