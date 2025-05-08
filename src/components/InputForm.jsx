import { useState } from "react";
import "./css/InputForm.css";

function InputForm({ numLinks, setDhParams, setStep }) {
  // Se almacenan los parámetros como strings inicialmente
  const [params, setParams] = useState(
    Array(numLinks).fill({ θ: "", α: "", a: "", d: "" })
  );

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
    
    // Convertir los valores vacíos en 0 y transformar a número si son numéricos
    const cleanedParams = params.map((param) => ({
      θ: param.θ.trim() === "" ? 0 : isNaN(param.θ) ? param.θ : Number(param.θ),
      α: param.α.trim() === "" ? 0 : isNaN(param.α) ? param.α : Number(param.α),
      a: param.a.trim() === "" ? 0 : isNaN(param.a) ? param.a : Number(param.a),
      d: param.d.trim() === "" ? 0 : isNaN(param.d) ? param.d : Number(param.d),
    })); 

    /* const cleanedParams = params.map((param) => ({
      θ: param.θ.trim() === "" ? "0" : param.θ.trim(),
      α: param.α.trim() === "" ? "0" : param.α.trim(),
      a: param.a.trim() === "" ? "0" : param.a.trim(),
      d: param.d.trim() === "" ? "0" : param.d.trim(),
    })); */

    setDhParams(cleanedParams);
    setStep(3);
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
                    onChange={(e) =>
                      handleChange(index, param, e.target.value)
                    }
                    className="input-box"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <button type="submit" className="App-button">
          Calcular Matrices
        </button>
      </form>
    </div>
  );
}

export default InputForm;


