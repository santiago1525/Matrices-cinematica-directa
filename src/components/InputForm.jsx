import { useState } from "react";
import './css/InputForm.css'


function InputForm({ numLinks, setDhParams, setStep }) {
    const [params, setParams] = useState(
      Array(numLinks).fill({ θ: 0, α: 0, a: 0, d: 0 })
    );
  
    const handleChange = (index, field, value) => {
      const newParams = [...params];
      newParams[index] = { ...newParams[index], [field]: parseFloat(value) };
      setParams(newParams);
    };
  
    const handleSubmit = (e) => {
        e.preventDefault();
        setDhParams(params);
        setStep(3);
      };
  
    return (
        <div className="input-form">
            <h2 className="input-title">Ingresa los parámetros DH</h2>
            <form onSubmit={handleSubmit} >
                <div className="input-container">
                    {params.map((_, index) => (
                    <div key={index} className="input-list-container">
                        <h3 className="input-link">Eslabón {index + 1}</h3>
                        {["θ", "α", "a", "d"].map((param) => (
                        <div key={param} className="input-box-container">
                            <label className="mr-2">{param}:</label>
                            <input
                            type="number"
                            step="any"
                            onChange={(e) => handleChange(index, param, e.target.value)}
                            className="input-box"
                            />
                        </div>
                        ))}
                    </div>
                    ))}
                </div>

                <button type="submit" className="App-button">Calcular Matrices</button>
            </form>
        </div>
      
    );
  }
  
  export default InputForm;