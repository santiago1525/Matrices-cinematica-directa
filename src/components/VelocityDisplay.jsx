// src/components/VelocityDisplay.jsx
import React, { useState } from 'react';
import './css/VelocityDisplay.css'

export default function VelocityDisplay({ mats }) {

  const [derivadas, setDerivadas] = useState([])

  if (!mats.A || !mats.D) return <p>Las matrices no están disponibles.</p>;

  // Obtener la primera fila de la matriz A
  // const firstRowA = mats.A[3]; 

  // Obtener la posicion columna de la matriz A
  const ColumnA = mats.D.map(row => row[3]);

  // Obtener la posicion columna de la matriz D
  const ColumnD = mats.D.map(row => row[3]);

  return (
    <>
      <div className="velocity-display-container">

        <div className='vector-a'>
          <h3>Vector Posición de la matriz A:</h3>
          <pre>{JSON.stringify(ColumnA, null, 2)}</pre>
        </div>
        <div className="vector-d">
          <h3>Vector Posición de la matriz D:</h3>
          <pre>{JSON.stringify(ColumnD, null, 2)}</pre>
        </div>
      </div>
      <h3>Ingresa las derivadas</h3>
      <input
        value={derivadas}
        onChange={(e) => setDerivadas(parseInt(e.target.value) || 0)}
        className="input-box"
      />
      <button
        className="App-button"
        onClick={() => { }}
      >
        Continuar
      </button>
    </>
  );
} 
