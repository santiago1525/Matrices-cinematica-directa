// src/App.jsx
import React, { useState, useCallback, useEffect } from "react";
import "./App.css";
import InputForm from "./components/InputForm";
import Table from "./components/Table";
import TransformationMatrix from "./components/TransformationMatrix";
import VelocityDisplay from './components/VelocityDisplay';
import { computeVelocities } from './utils/jacobian';

function App() {
  const [step, setStep] = useState(0);
  const [numLinks, setNumLinks] = useState(0);
  const [dhParams, setDhParams] = useState([]);
  const [mats, setMats] = useState({ A: null, D: null });

  // Inicializa qDot según número de eslabones
  const [qDot, setQDot] = useState([]);
  useEffect(() => {
    setQDot(Array(dhParams.length).fill(0));
  }, [dhParams]);

  // Estados para velocidades calculadas
  const [vLin, setVLin] = useState([0,0,0]);
  const [vAng, setVAng] = useState([0,0,0]);

  // Cada vez que cambie dhParams, qDot o mats.A, recalcula velocidades
  useEffect(() => {
    if (mats.A && dhParams.length === qDot.length && qDot.length > 0) {
      const { v, omega } = computeVelocities(dhParams, qDot, mats.A);
      setVLin(v);
      setVAng(omega);
    }
  }, [dhParams, qDot, mats]);

  // Callback estable para recibir matrices finales
  const handleMats = useCallback((newMats) => {
    setMats(newMats);
  }, []);

  const handleCompute = () => {
    setStep(0); // Reiniciar flujo
    setDhParams([]);
    setNumLinks(0);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Biomecatrónica - Cinemática Directa</h1>

        {step === 0 && (
          <button className="App-button" onClick={() => setStep(1)}>
            Iniciar
          </button>
        )}

        {step === 1 && (
          <div className="modal">
            <h2>Selecciona el número de eslabones</h2>
            <input
              type="number"
              min="1"
              max="6"
              value={numLinks}
              onChange={(e) => setNumLinks(parseInt(e.target.value) || 0)}
              className="input-box"
            />
            <button
              className="App-button"
              onClick={() => numLinks > 0 && numLinks <= 6 && setStep(2)}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <InputForm
            numLinks={numLinks}
            setDhParams={setDhParams}
            setStep={setStep}
          />
        )}

        {step === 3 && (
          <>
            <Table dhParams={dhParams} />
            <TransformationMatrix
              dhParams={dhParams}
              onMatricesComputed={handleMats}
            />
            <button
              className="App-button"
              onClick={() => setStep(4)}
            >
              Calcular Velocidades
            </button>
          </>
        )}

        {step === 4 && (
          <>
            {/* Inputs para editar qDot */}
            <div style={{ margin: '1em 0' }}>
              <h3>Velocidades articulares (q̇)</h3>
              {qDot.map((val, i) => (
                <div key={i} style={{ marginBottom: '0.5em' }}>
                  <label>q̇{i + 1}: </label>
                  <input className="input-box"
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setQDot(prev => {
                        const next = [...prev];
                        next[i] = v;
                        return next;
                      });
                    }}
                  />
                </div>
              ))}
            </div>

            <VelocityDisplay
              vLin={vLin}
              vAng={vAng}
            />

            <button className="App-button" onClick={handleCompute}>
              Reiniciar
            </button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
