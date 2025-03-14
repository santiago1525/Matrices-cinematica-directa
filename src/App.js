import { useState } from "react";
import "./App.css";
import InputForm from "./components/InputForm";
import Table from "./components/Table";
import TransformationMatrix from "./components/TransformationMatrix";



function App() {
  const [step, setStep] = useState(0);
  const [numLinks, setNumLinks] = useState(0);
  const [dhParams, setDhParams] = useState([]);


  const handleCompute = () => {
    setStep(1); // Mostrar la matriz final
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Biomecatrónica - Cinemática Directa</h1>

        {step === 0 && (
          <div className="separator">
            <button
              className="App-button"
              onClick={() => setStep(1)} > Iniciar </button>
          </div>


        )}

        {step === 1 && (
          <div className="modal">
            <h2>Selecciona el número de eslabones</h2>
            <input
              type="number"
              min="1"
              max="4"
              value={numLinks}
              onChange={(e) => setNumLinks(parseInt(e.target.value))}
              className="input-box"
            />
            <button
              className="App-button"
              onClick={() => numLinks > 0 && numLinks <= 4 && setStep(2)}
            > Continuar</button>
          </div>
        )}

        {step === 2 && (
          <InputForm numLinks={numLinks} setDhParams={setDhParams} setStep={setStep} />
        )}

        {step === 3 && (
          <>
            <Table dhParams={dhParams} />
            <TransformationMatrix dhParams={dhParams} />
            <button className="App-button" onClick={handleCompute}>Reiniciar</button>
          </>
        )}

      </header>
    </div>
  );
}

export default App;
