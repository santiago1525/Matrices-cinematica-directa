// src/App.jsx
import React, { useState, useCallback } from "react";
import "./App.css";
import InputForm from "./components/InputForm";
import Table from "./components/Table";
import TransformationMatrix from "./components/TransformationMatrix";
import VelocityDisplay from './components/VelocityDisplay';
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRotateLeft } from "react-icons/fa6";



function App() {
  const [step, setStep] = useState(0);
  const [numLinks, setNumLinks] = useState(0);
  const [dhParams, setDhParams] = useState([]);
  const [mats, setMats] = useState({ A: null, D: null });
  const [prevStep, setPrevStep] = useState(null); // Estado para el paso anterior




  // Callback estable para recibir matrices finales
  const handleMats = useCallback((newMats) => {
    if (newMats && newMats.A && newMats.D) {
      setMats(newMats); // Solo actualizar el estado si newMats contiene A y D
    }
  }, []);


  const goToPreviousStep = () => {
    if (prevStep !== null) {
      setStep(prevStep); // Vuelve al paso anterior
    }
  };

  const updateStep = (newStep) => {
    setPrevStep(step); // Guarda el paso anterior
    setStep(newStep);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Biomecatrónica - Cinemática Directa</h1>


        {step === 0 && (
          <button className="App-button" onClick={() => updateStep(1)}>
            Iniciar
          </button>
        )}

        {step >= 1 && (
          <div className="fixed-menu">
            <button className="button-menu" onClick={goToPreviousStep}>
              <FaArrowLeft />
            </button>
            <button className="button-menu" onClick={() => updateStep(1)}>
              <FaArrowRotateLeft />
            </button>
          </div>
        )}

        {
          step === 1 && (
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
                onClick={() => numLinks > 0 && numLinks <= 10 && updateStep(2)}
              >
                Continuar
              </button>
            </div>
          )
        }

        {
          step === 2 && (
            <InputForm
              numLinks={numLinks}
              setDhParams={setDhParams}
              setStep={updateStep}
            />
          )
        }

        {
          step === 3 && (
            <>
              <Table dhParams={dhParams} />
              <TransformationMatrix
                dhParams={dhParams}
                onMatricesComputed={handleMats}
              />
              <button
                className="App-button"
                onClick={() => updateStep(4)}
              >
                Calcular Velocidades
              </button>
            </>
          )
        }

        {
          step === 4 && (
            <VelocityDisplay
              mats={mats}
              numLinks={numLinks}
            />
          )
        }
      </header >
    </div >
  );
}

export default App;
