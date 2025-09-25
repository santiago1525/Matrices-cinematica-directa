import { useState, useEffect } from "react";
import "./css/InputForm.css";

// Clave para almacenar en localStorage
const STORAGE_KEY = 'dh_params';

function InputForm({ numLinks, setDhParams, setStep }) {
  // Cargar parámetros guardados o inicializar con valores vacíos
  const [params, setParams] = useState(() => {
    const savedParams = localStorage.getItem(STORAGE_KEY);
    return savedParams 
      ? JSON.parse(savedParams)
      : Array(numLinks).fill({ θ: "", α: "", a: "", d: "" });
  });

  // Efecto para guardar en localStorage cuando cambian los parámetros
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }, [params]);

  const handleChange = (index, field, value) => {
    const newParams = [...params];
    newParams[index] = { 
      ...newParams[index], 
      [field]: value 
    };
    setParams(newParams);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveAndProcessParams();
  };

  const saveAndProcessParams = () => {
    // Convertir los valores vacíos en 0 y transformar a número si son numéricos
    const cleanedParams = params.map((param) => ({
      θ: param.θ.trim() === "" ? 0 : isNaN(param.θ) ? param.θ : Number(param.θ),
      α: param.α.trim() === "" ? 0 : isNaN(param.α) ? param.α : Number(param.α),
      a: param.a.trim() === "" ? 0 : isNaN(param.a) ? param.a : Number(param.a),
      d: param.d.trim() === "" ? 0 : isNaN(param.d) ? param.d : Number(param.d),
    }));

    setDhParams(cleanedParams);
    setStep(3);
  };

  const handleClear = () => {
    // Limpiar los parámetros y el localStorage
    const emptyParams = Array(numLinks).fill({ θ: "", α: "", a: "", d: "" });
    setParams(emptyParams);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="input-form">
      <h2 className="input-title">Ingresa los parámetros DH</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          {params.map((_, index) => (
            <div key={index} className="input-list-container">
              <h3 className="input-link">Eslabón {index + 1}</h3>
              {["θ", "α", "a", "d"].map((param) => (
                <div key={param} className="input-box-container">
                  <label className="mr-2">{param}:</label>
                  <input
                    type="text"
                    value={params[index][param] || ""}
                    onChange={(e) => handleChange(index, param, e.target.value)}
                    className="input-box"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="form-buttons">
          <button type="submit" className="App-button calculate-btn">
            Calcular Matrices
          </button>
          <button 
            type="button" 
            className="App-button clear-btn"
            onClick={handleClear}
          >
            Limpiar Datos
          </button>
        </div>
      </form>
    </div>
  );
}

export default InputForm;
