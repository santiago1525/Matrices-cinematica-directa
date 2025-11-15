// src/components/TrajectoryCalculator.jsx
import React, { useState } from 'react';
import './css/TrajectoryCalculator.css';

export default function TrajectoryCalculator({ numLinks, dhParams }) {
  // Estados para los parámetros de entrada
  const [segmentLength, setSegmentLength] = useState(0.5);
  const [nominalVelocity, setNominalVelocity] = useState(0.15);
  const [initialVelocity, setInitialVelocity] = useState(0);
  const [finalVelocity, setFinalVelocity] = useState(0);
  const [maxAcceleration, setMaxAcceleration] = useState(0.1);

  // Estados para las posiciones angulares
  const [jointPositions, setJointPositions] = useState(
    Array(numLinks).fill(null).map(() => ({ initial: 0, final: 0 }))
  );

  // Estados para los resultados
  const [results, setResults] = useState(null);
  const [trajectoryProfiles, setTrajectoryProfiles] = useState([]);

  // Función para calcular los segmentos de la trayectoria
  const calculateTrajectorySegments = () => {
    const vr = parseFloat(nominalVelocity);
    const v1 = parseFloat(initialVelocity);
    const v2 = parseFloat(finalVelocity);
    const amax = parseFloat(maxAcceleration);
    const L = parseFloat(segmentLength);

    // 1. Cálculo de distancias de aceleración y deceleración
    const L_acc = (Math.pow(vr, 2) - Math.pow(v1, 2)) / (2 * amax);
    const L_dec = (Math.pow(vr, 2) - Math.pow(v2, 2)) / (2 * amax);

    // 2. Cálculo del segmento medio
    const L_mid = L - L_acc - L_dec;

    // 3. Cálculo de tiempos
    const t_acc = (vr - v1) / amax;
    const t_dec = (vr - v2) / amax;
    const t_mid = L_mid / vr;
    const t_total = t_acc + t_mid + t_dec;

    return {
      L_acc,
      L_dec,
      L_mid,
      t_acc,
      t_dec,
      t_mid,
      t_total,
      vr,
      v1,
      v2,
      amax,
      L
    };
  };

  // Función para calcular los coeficientes del polinomio cúbico
  const calculateCubicPolynomial = (theta_i, theta_f, t_f) => {
    const delta_theta = theta_f - theta_i;

    // Condiciones de contorno:
    // θ(0) = theta_i → a0 = theta_i
    // θ(tf) = theta_f → theta_f = a0 + a1*tf + a2*tf² + a3*tf³
    // θ̇(0) = 0 → a1 = 0
    // θ̇(tf) = 0 → 0 = a1 + 2*a2*tf + 3*a3*tf²

    const a0 = theta_i;
    const a1 = 0;
    const a2 = (3 * delta_theta) / Math.pow(t_f, 2);
    const a3 = (-2 * delta_theta) / Math.pow(t_f, 3);

    return { a0, a1, a2, a3, delta_theta };
  };

  // Función para generar el perfil de trayectoria en el tiempo
  const generateTrajectoryProfile = (coeffs, t_f, numPoints = 100) => {
    const { a0, a1, a2, a3 } = coeffs;
    const profile = [];

    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * t_f;
      const position = a0 + a1 * t + a2 * Math.pow(t, 2) + a3 * Math.pow(t, 3);
      const velocity = a1 + 2 * a2 * t + 3 * a3 * Math.pow(t, 2);
      const acceleration = 2 * a2 + 6 * a3 * t;

      profile.push({
        time: t,
        position,
        velocity,
        acceleration
      });
    }

    return profile;
  };

  // Función principal de cálculo
  const handleCalculateTrajectory = () => {
    // 1. Calcular segmentos de trayectoria
    const segmentResults = calculateTrajectorySegments();

    // 2. Calcular polinomios cúbicos para cada articulación
    const profiles = jointPositions.map((joint, index) => {
      const theta_i = parseFloat(joint.initial);
      const theta_f = parseFloat(joint.final);
      const coeffs = calculateCubicPolynomial(theta_i, theta_f, segmentResults.t_total);
      const profile = generateTrajectoryProfile(coeffs, segmentResults.t_total);

      return {
        jointIndex: index,
        coefficients: coeffs,
        profile
      };
    });

    setResults(segmentResults);
    setTrajectoryProfiles(profiles);
  };

  // Función para actualizar posición de una articulación
  const updateJointPosition = (index, field, value) => {
    const newPositions = [...jointPositions];
    newPositions[index][field] = value;
    setJointPositions(newPositions);
  };

  return (
    <div className="trajectory-container">
      <h2 className="trajectory-title">Cálculo de Trayectorias</h2>

      {/* Sección de Datos Iniciales */}
      <div className="trajectory-section">
        <h3 className="section-title">Datos Iniciales del Segmento</h3>
        <div className="input-grid">
          <div className="input-group">
            <label>Longitud del Segmento (L) [m]:</label>
            <input
              type="number"
              step="0.01"
              value={segmentLength}
              onChange={(e) => setSegmentLength(e.target.value)}
              className="input-box"
            />
          </div>
          <div className="input-group">
            <label>Velocidad Nominal (vr) [m/s]:</label>
            <input
              type="number"
              step="0.01"
              value={nominalVelocity}
              onChange={(e) => setNominalVelocity(e.target.value)}
              className="input-box"
            />
          </div>
          <div className="input-group">
            <label>Velocidad Inicial (v1) [m/s]:</label>
            <input
              type="number"
              step="0.01"
              value={initialVelocity}
              onChange={(e) => setInitialVelocity(e.target.value)}
              className="input-box"
            />
          </div>
          <div className="input-group">
            <label>Velocidad Final (v2) [m/s]:</label>
            <input
              type="number"
              step="0.01"
              value={finalVelocity}
              onChange={(e) => setFinalVelocity(e.target.value)}
              className="input-box"
            />
          </div>
          <div className="input-group">
            <label>Aceleración Máxima (amax) [m/s²]:</label>
            <input
              type="number"
              step="0.01"
              value={maxAcceleration}
              onChange={(e) => setMaxAcceleration(e.target.value)}
              className="input-box"
            />
          </div>
        </div>
      </div>

      {/* Sección de Posiciones Angulares */}
      <div className="trajectory-section">
        <h3 className="section-title">Posiciones Angulares de las Articulaciones</h3>
        <div className="joints-grid">
          {jointPositions.map((joint, index) => (
            <div key={index} className="joint-input-group">
              <h4>Articulación {index + 1}</h4>
              <div className="joint-inputs">
                <div className="input-group">
                  <label>θ inicial [deg]:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={joint.initial}
                    onChange={(e) => updateJointPosition(index, 'initial', e.target.value)}
                    className="input-box"
                  />
                </div>
                <div className="input-group">
                  <label>θ final [deg]:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={joint.final}
                    onChange={(e) => updateJointPosition(index, 'final', e.target.value)}
                    className="input-box"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de Cálculo */}
      <button className="App-button calculate-trajectory-btn" onClick={handleCalculateTrajectory}>
        Calcular Trayectoria
      </button>

      {/* Resultados */}
      {results && (
        <>
          {/* Resultados de Segmentos */}
          <div className="trajectory-section results-section">
            <h3 className="section-title">Resultados - Planificación de Segmentos</h3>
            
            <div className="results-grid">
              <div className="result-card">
                <h4>Segmento de Aceleración</h4>
                <p><strong>L_acc:</strong> {results.L_acc.toFixed(4)} m</p>
                <p><strong>t_acc:</strong> {results.t_acc.toFixed(4)} s</p>
              </div>

              <div className="result-card">
                <h4>Segmento Medio (Velocidad Constante)</h4>
                <p><strong>L_mid:</strong> {results.L_mid.toFixed(4)} m</p>
                <p><strong>t_mid:</strong> {results.t_mid.toFixed(4)} s</p>
              </div>

              <div className="result-card">
                <h4>Segmento de Deceleración</h4>
                <p><strong>L_dec:</strong> {results.L_dec.toFixed(4)} m</p>
                <p><strong>t_dec:</strong> {results.t_dec.toFixed(4)} s</p>
              </div>

              <div className="result-card highlight">
                <h4>Tiempo Total</h4>
                <p><strong>t_total:</strong> {results.t_total.toFixed(4)} segundos</p>
              </div>
            </div>

            <div className="result-description">
              <p>
                El segmento de la trayectoria se planifica con una aceleración constante 
                durante los primeros <strong>{results.L_acc.toFixed(4)} m</strong>, luego mantiene 
                la velocidad nominal de <strong>{results.vr} m/s</strong> durante 
                los siguientes <strong>{results.L_mid.toFixed(4)} m</strong>, y finalmente 
                desacelera durante los últimos <strong>{results.L_dec.toFixed(4)} m</strong> hasta 
                detenerse, logrando un tiempo total de <strong>{results.t_total.toFixed(2)} segundos</strong>.
              </p>
            </div>
          </div>

          {/* Resultados de Polinomios Cúbicos */}
          <div className="trajectory-section">
            <h3 className="section-title">Polinomios Cúbicos por Articulación</h3>
            
            {trajectoryProfiles.map((profile, index) => (
              <div key={index} className="polynomial-result">
                <h4>Articulación {index + 1}</h4>
                
                <div className="coefficients">
                  <h5>Coeficientes del Polinomio: θ(t) = a₀ + a₁t + a₂t² + a₃t³</h5>
                  <div className="coeff-grid">
                    <p><strong>a₀:</strong> {profile.coefficients.a0.toFixed(4)}</p>
                    <p><strong>a₁:</strong> {profile.coefficients.a1.toFixed(4)}</p>
                    <p><strong>a₂:</strong> {profile.coefficients.a2.toFixed(4)}</p>
                    <p><strong>a₃:</strong> {profile.coefficients.a3.toFixed(4)}</p>
                  </div>
                  <p className="delta-theta">
                    <strong>Δθ:</strong> {profile.coefficients.delta_theta.toFixed(2)}°
                  </p>
                </div>

                <div className="polynomial-equation">
                  <p><strong>Ecuación de Posición:</strong></p>
                  <p className="equation">
                    θ(t) = {profile.coefficients.a0.toFixed(2)} 
                    {profile.coefficients.a2 >= 0 ? ' + ' : ' - '}
                    {Math.abs(profile.coefficients.a2).toFixed(2)}t² 
                    {profile.coefficients.a3 >= 0 ? ' + ' : ' - '}
                    {Math.abs(profile.coefficients.a3).toFixed(2)}t³
                  </p>
                </div>

                {/* Tabla de Perfil de Trayectoria */}
                <div className="trajectory-table-container">
                  <h5>Perfil de Trayectoria (Puntos Representativos)</h5>
                  <table className="trajectory-table">
                    <thead>
                      <tr>
                        <th>Tiempo (s)</th>
                        <th>Posición (deg)</th>
                        <th>Velocidad (deg/s)</th>
                        <th>Aceleración (deg/s²)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.profile.filter((_, i) => i % 10 === 0).map((point, i) => (
                        <tr key={i}>
                          <td>{point.time.toFixed(3)}</td>
                          <td>{point.position.toFixed(4)}</td>
                          <td>{point.velocity.toFixed(4)}</td>
                          <td>{point.acceleration.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfica Visual Simple */}
          <div className="trajectory-section">
            <h3 className="section-title">Visualización de Trayectorias</h3>
            <div className="charts-container">
              {trajectoryProfiles.map((profile, index) => (
                <div key={index} className="chart-card">
                  <h4>Articulación {index + 1}</h4>
                  <div className="simple-chart">
                    <svg width="100%" height="200" viewBox="0 0 500 200" className="trajectory-svg">
                      {/* Eje X */}
                      <line x1="50" y1="180" x2="480" y2="180" stroke="#333" strokeWidth="2" />
                      {/* Eje Y */}
                      <line x1="50" y1="20" x2="50" y2="180" stroke="#333" strokeWidth="2" />
                      
                      {/* Labels */}
                      <text x="250" y="195" textAnchor="middle" fontSize="12">Tiempo (s)</text>
                      <text x="30" y="100" textAnchor="middle" fontSize="12" transform="rotate(-90 30 100)">
                        Posición (deg)
                      </text>

                      {/* Curva de trayectoria */}
                      <polyline
                        points={profile.profile.map((point, i) => {
                          const x = 50 + (i / profile.profile.length) * 430;
                          const minPos = Math.min(...profile.profile.map(p => p.position));
                          const maxPos = Math.max(...profile.profile.map(p => p.position));
                          const range = maxPos - minPos || 1;
                          const y = 180 - ((point.position - minPos) / range) * 160;
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#D36135"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
