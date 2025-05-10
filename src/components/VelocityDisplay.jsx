// src/components/VelocityDisplay.jsx
import React, { useState } from 'react';
import { create, all } from 'mathjs';
import './css/VelocityDisplay.css';

const math = create(all);

export default function VelocityDisplay({ mats }) {
  const [variablesInput, setVariablesInput] = useState('');
  const [derivatives, setDerivatives] = useState([]);
  const [selected, setSelected] = useState(true);


  if (!mats.A || !mats.D) return <p>Las matrices no están disponibles.</p>;

  // Obtener la columna de posición de las matrices A y D
  const ColumnA = mats.A.map(row => String(row[3]));
  const ColumnD = mats.D.map(row => String(row[3]));

  const handleCalculateDerivatives = (Column) => {
    try {
      // Convertir entrada del usuario en un array de variables simbólicas
      const variables = variablesInput.split(',').map(v => v.trim()).filter(v => v);

      // Validar que todas las variables existan como identificadores válidos
      const symbols = variables.map(v => math.parse(v).name);

      // Derivar cada expresión del vector ColumnA con respecto a cada variable
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

  return (
    <>
      {/* Pestañas */}
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
            <div className='vector'>
              <h3>Vector Posición de la matriz A:</h3>
              <p>{JSON.stringify(ColumnA, null, 2)}</p>
            </div>
          </div>

          <h3 className='indicator'>Ingresa las variables simbólicas separadas por comas (por ejemplo: θ1,θ2,a1,a2):</h3>
          <input
            value={variablesInput}
            onChange={(e) => setVariablesInput(e.target.value)}
            className="input-box"
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
            className="input-box"
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
          </div>
        </>
      )}




    </>

  );
}

