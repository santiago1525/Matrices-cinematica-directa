import "./css/TransformationMatrix.css";
import { useEffect, useState } from "react";
import { simplify, parse } from 'mathjs';

// Verifica si un valor es numérico
const isNumeric = (val) => {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

const roundIfCloseToZero = (value) => Math.abs(value) < 1e-10 ? 0 : value;

// Detecta y procesa ángulos con desplazamientos numéricos (e.g., +90, -90, +180)
const adjustAngleExpr = (exp) => {
  if (typeof exp === 'string') {
    const trimmed = exp.replace(/\s+/g, '');
    const match = trimmed.match(/^(.+?)([+-]\d+)$/);
    if (match) {
      const base = match[1];
      const offset = parseInt(match[2], 10);
      return { base, offset };
    }
  }
  return null;
};

const getCos = (exp) => {
  const adj = adjustAngleExpr(exp);
  if (adj) {
    const { base, offset } = adj;
    // Normaliza el offset a [0, 360)
    const o = ((offset % 360) + 360) % 360;
    switch (o) {
      case 0:
        return `cos(${base})`;
      case 90:
        return `-sin(${base})`;
      case 180:
        return `-cos(${base})`;
      case 270:
        return `sin(${base})`;
      default:
        return simplifyExpr(`cos((${base}) + (${offset}))`);
    }
  }
  if (isNumeric(exp)) {
    return roundIfCloseToZero(Math.cos((parseFloat(exp) * Math.PI) / 180));
  }
  return `cos(${exp})`;
};

const getSin = (exp) => {
  const adj = adjustAngleExpr(exp);
  if (adj) {
    const { base, offset } = adj;
    const o = ((offset % 360) + 360) % 360;
    switch (o) {
      case 0:
        return `sin(${base})`;
      case 90:
        return `cos(${base})`;
      case 180:
        return `-sin(${base})`;
      case 270:
        return `-cos(${base})`;
      default:
        return simplifyExpr(`sin((${base}) + (${offset}))`);
    }
  }
  if (isNumeric(exp)) {
    return roundIfCloseToZero(Math.sin((parseFloat(exp) * Math.PI) / 180));
  }
  return `sin(${exp})`;
};

// Procesa los parámetros lineales "a" y "d"
const processLinear = (exp) => (isNumeric(exp) ? parseFloat(exp) : exp);

// Aplica identidades trigonométricas comunes
const applyTrigIdentities = (expr) => {
  if (typeof expr !== 'string') return expr;
  
  let result = expr;
  
  // Identidad: cos(a) * cos(b) + sin(a) * sin(b) = cos(a - b)
  result = result.replace(
    /cos\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)\s*\+\s*sin\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `cos((${a1}) - (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: cos(a) * cos(b) - sin(a) * sin(b) = cos(a + b)
  result = result.replace(
    /cos\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)\s*-\s*sin\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `cos((${a1}) + (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: sin(a) * sin(b) - cos(a) * cos(b) = -cos(a + b)
  result = result.replace(
    /sin\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)\s*-\s*cos\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `-cos((${a1}) + (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: sin(a) * cos(b) + cos(a) * sin(b) = sin(a + b)
  result = result.replace(
    /sin\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)\s*\+\s*cos\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `sin((${a1}) + (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: sin(a) * cos(b) - cos(a) * sin(b) = sin(a - b)
  result = result.replace(
    /sin\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)\s*-\s*cos\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `sin((${a1}) - (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: cos(a) * sin(b) + sin(a) * cos(b) = sin(a + b) (orden alternativo)
  result = result.replace(
    /cos\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)\s*\+\s*sin\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `sin((${a1}) + (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: cos(a) * sin(b) - sin(a) * cos(b) = sin(b - a)
  result = result.replace(
    /cos\(([^)]+)\)\s*\*\s*sin\(([^)]+)\)\s*-\s*sin\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)/g,
    (match, a1, b1, a2, b2) => {
      if (a1 === a2 && b1 === b2) {
        return `sin((${b1}) - (${a1}))`;
      }
      return match;
    }
  );
  
  // Identidades con expresiones más complejas (como θ1 + θ2)
  // Identidad: sin(A) * sin(B) - cos(A) * cos(B) = -cos(A + B) donde A y B pueden ser expresiones complejas
  result = result.replace(
    /sin\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\*\s*sin\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*-\s*cos\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\*\s*cos\(([^)]+(?:\([^)]*\))*[^)]*)\)/g,
    (match, a1, b1, a2, b2) => {
      // Normalizar espacios para comparación
      const normalizeExpr = (expr) => expr.replace(/\s+/g, '');
      if (normalizeExpr(a1) === normalizeExpr(a2) && normalizeExpr(b1) === normalizeExpr(b2)) {
        return `-cos((${a1}) + (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: cos(A) * cos(B) + sin(A) * sin(B) = cos(A - B) para expresiones complejas
  result = result.replace(
    /cos\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\*\s*cos\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\+\s*sin\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\*\s*sin\(([^)]+(?:\([^)]*\))*[^)]*)\)/g,
    (match, a1, b1, a2, b2) => {
      const normalizeExpr = (expr) => expr.replace(/\s+/g, '');
      if (normalizeExpr(a1) === normalizeExpr(a2) && normalizeExpr(b1) === normalizeExpr(b2)) {
        return `cos((${a1}) - (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: -(sin(A) * sin(B) + cos(A) * cos(B)) = -cos(A - B) para expresiones negativas con paréntesis
  result = result.replace(
    /-\(\s*sin\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\*\s*sin\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\+\s*cos\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\*\s*cos\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\)/g,
    (match, a1, b1, a2, b2) => {
      const normalizeExpr = (expr) => expr.replace(/\s+/g, '');
      if (normalizeExpr(a1) === normalizeExpr(a2) && normalizeExpr(b1) === normalizeExpr(b2)) {
        return `-cos((${a1}) - (${b1}))`;
      }
      return match;
    }
  );
  
  // Identidad: -(cos(A) * cos(B) + sin(A) * sin(B)) = -cos(A - B) (orden alternativo)
  result = result.replace(
    /-\(\s*cos\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\*\s*cos\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\+\s*sin\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\*\s*sin\(([^)]+(?:\([^)]*\))*[^)]*)\)\s*\)/g,
    (match, a1, b1, a2, b2) => {
      const normalizeExpr = (expr) => expr.replace(/\s+/g, '');
      if (normalizeExpr(a1) === normalizeExpr(a2) && normalizeExpr(b1) === normalizeExpr(b2)) {
        return `-cos((${a1}) - (${b1}))`;
      }
      return match;
    }
  );
  
  // Simplificar expresiones con paréntesis redundantes
  result = result.replace(/\(\(([^)]+)\)\)/g, '($1)');
  
  // Simplificar sumas/restas con cero
  result = result.replace(/\s*\+\s*0\s*/g, '');
  result = result.replace(/\s*-\s*0\s*/g, '');
  result = result.replace(/^0\s*\+\s*/, '');
  
  return result;
};

// Simplifica cualquier expresión simbólica
const simplifyExpr = (expr) => {
  try {
    let simplified = simplify(parse(expr)).toString();
    // Aplicar identidades trigonométricas después de la simplificación básica
    simplified = applyTrigIdentities(simplified);
    return simplified;
  } catch (error) {
    console.warn("No se pudo simplificar:", expr);
    return expr;
  }
};

// Operaciones simbólicas seguras
const safeMultiply = (x, y) => {
  const expr = `(${x}) * (${y})`;
  return simplifyExpr(expr);
};

const safeAdd = (x, y) => {
  const expr = `(${x}) + (${y})`;
  return simplifyExpr(expr);
};

// Multiplica matrices 4x4 simbólicas y aplica simplificaciones
export const multiplyMatrices = (A, B) => {
  const result = Array(4).fill(null).map(() => Array(4).fill(0));
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        // Multiplicar los elementos y aplicar simplificación
        const prod = safeMultiply(A[i][k], B[k][j]);
        // Sumar al resultado actual, asegurando mantener la expresión simbólica
        sum = sum === 0 ? prod : (prod !== 0 ? safeAdd(sum, prod) : sum);
      }
      // Aplicar simplificaciones adicionales al resultado final
      result[i][j] = typeof sum === 'string' ? simplifyExpr(sum) : sum;
    }
  }
  return result;
};

// Matriz DH tipo A
export const computeMatrixA = ({ θ, α, a, d }) => {
  const cosT = getCos(θ);
  const sinT = getSin(θ);
  const cosA = getCos(α);
  const sinA = getSin(α);
  const aVal = processLinear(a);
  const dVal = processLinear(d);

  return [
    [cosT, safeMultiply(`-${cosA}`, sinT), safeMultiply(sinT, sinA), safeMultiply(aVal, cosT)],
    [sinT, safeMultiply(cosT, cosA), safeMultiply(`-${cosT}`, sinA), safeMultiply(aVal, sinT)],
    [0, sinA, cosA, dVal],
    [0, 0, 0, 1],
  ];
};

// Matriz DH tipo D
export const computeMatrixD = ({ θ, α, a, d }) => {
  const cosT = getCos(θ);
  const sinT = getSin(θ);
  const cosA = getCos(α);
  const sinA = getSin(α);
  const aVal = processLinear(a);
  const dVal = processLinear(d);

  return [
    [cosT, safeMultiply(`-${sinT}`, 1), 0, aVal],
    [safeMultiply(sinT, cosA), safeMultiply(cosT, cosA), safeMultiply(`-${sinA}`, 1), safeMultiply(`-${dVal}`, sinA)],
    [safeMultiply(sinT, sinA), safeMultiply(cosT, sinA), cosA, safeMultiply(dVal, cosA)],
    [0, 0, 0, 1],
  ];
};

// Función para renderizar celdas de la matriz
const renderCell = (cell) => typeof cell === 'number' ? cell.toFixed(0) : cell;

// Componente para el modal
const MatrixModal = ({ isOpen, onClose, matrix, title }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Matriz de Transformación {title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-matrix-container">
          <div className="matrix">
            {matrix.flat().map((v, idx) => (
              <div key={idx}>{renderCell(v)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para el menú desplegable
const MatrixDropdown = ({ currentFrame, totalFrames, onSelect, isOpen, onToggle }) => {
  const options = [];
  
  // Generar opciones desde el marco actual-1 hasta 0
  // Para 6 eslabones (índices 0-5), si currentFrame es 5, mostrará opciones hasta T5→T0
  for (let i = currentFrame - 1; i >= 0; i--) {
    options.push(
      <button 
        key={i} 
        className="dropdown-item"
        onClick={() => onSelect(i)}
      >
        T{currentFrame+1}→T{i+1}
      </button>
    );
  }
  
  return (
    <div className="dropdown-container">
      <button 
        className="dropdown-toggle"
        onClick={onToggle}
      >
        <span>Ver transformación</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      {isOpen && options.length > 0 && (
        <div className="dropdown-menu">
          {options}
        </div>
      )}
    </div>
  );
};

function TransformationMatrix({ dhParams, onMatricesComputed }) {
  const [finalMatrixA, setFinalMatrixA] = useState(null);
  const [finalMatrixD, setFinalMatrixD] = useState(null);
  // Variables de estado para las matrices intermedias (se usan en el cálculo de las matrices finales)
  const [, setIntermediateMatricesA] = useState([]);
  const [, setIntermediateMatricesD] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    matrix: null,
    title: ''
  });

  // Función para calcular la matriz entre dos frames
  // Multiplica en el mismo orden que el cálculo de la matriz final: T0 * T1 * ... * Tn
  const getTransformationBetweenFrames = (startFrame, endFrame, matrixType) => {
    if (startFrame === endFrame) return null;
    
    const computeFn = matrixType === 'A' ? computeMatrixA : computeMatrixD;
    
    // Multiplicamos en orden ascendente para mantener consistencia con el cálculo final
    // Ejemplo: Para T0→T4, calculamos T0 * T1 * T2 * T3 * T4
    let result = computeFn(dhParams[endFrame]);
    for (let i = endFrame + 1; i <= startFrame; i++) {
      result = multiplyMatrices(result, computeFn(dhParams[i]));
    }
    return result;
  };

  // Manejar la selección de un frame objetivo
  const handleFrameSelect = (startFrame, endFrame, matrixType) => {
    // Verificamos que los índices sean válidos
    if (startFrame < 0 || endFrame < 0 || startFrame >= dhParams.length || endFrame >= dhParams.length) {
      console.warn('Índices de frames fuera de rango');
      return;
    }
    
    // Aseguramos que startFrame sea mayor que endFrame
    if (startFrame <= endFrame) {
      console.warn('El frame de inicio debe ser mayor que el frame final para la transformación');
      return;
    }
    
    const result = getTransformationBetweenFrames(startFrame, endFrame, matrixType);
    setModalState({
      isOpen: true,
      matrix: result,
      title: `T${startFrame}→T${endFrame}`
    });
    setActiveDropdown(null);
  };

  // Cerrar el modal
  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (dhParams.length > 0) {
      // Calcular y guardar todas las matrices intermedias
      const matricesA = [computeMatrixA(dhParams[0])];
      const matricesD = [computeMatrixD(dhParams[0])];
      
      for (let i = 1; i < dhParams.length; i++) {
        matricesA.push(multiplyMatrices(matricesA[i-1], computeMatrixA(dhParams[i])));
        matricesD.push(multiplyMatrices(matricesD[i-1], computeMatrixD(dhParams[i])));
      }
      
      setFinalMatrixA(matricesA[matricesA.length - 1]);
      setFinalMatrixD(matricesD[matricesD.length - 1]);
      setIntermediateMatricesA(matricesA);
      setIntermediateMatricesD(matricesD);
      onMatricesComputed?.({ A: matricesA[matricesA.length - 1], D: matricesD[matricesD.length - 1] });
    }
  }, [dhParams, onMatricesComputed]);

  const renderCell = (cell) => typeof cell === 'number' ? cell.toFixed(0) : cell;

  return (
    <div className="transformation-container">
      <h2 className="transformation-container-title">Matrices de Transformación</h2>
      
      {/* Sección de matrices A (RTTR) */}
      <h4 className="title-descompotition">Descomposición en a (RTTR)</h4>
      {dhParams.map((params, i) => (
        <div key={`A-${i}`} className="matrix-row">
          <div className="matrix-container">
            <h3>T<sub>{i}</sub><sup>{i + 1}</sup></h3>
            <div className="matrix">
              {computeMatrixA(params).flat().map((v, idx) => (
                <div key={idx}>{renderCell(v)}</div>
              ))}
            </div>
          </div>
          {i > 0 && (
            <MatrixDropdown
              currentFrame={i}
              totalFrames={dhParams.length}
              onSelect={(targetFrame) => handleFrameSelect(i, targetFrame, 'A')}
              isOpen={activeDropdown === `A-${i}`}
              onToggle={() => setActiveDropdown(activeDropdown === `A-${i}` ? null : `A-${i}`)}
            />
          )}
        </div>
      ))}
      
      {/* Matriz final A */}
      {finalMatrixA && (
        <div className="final-matrix">
          <h2 className="final-matrix-title">Matriz Final (A)</h2>
          <div className="matrix final">
            {finalMatrixA.flat().map((v, idx) => (
              <div key={idx}>{renderCell(v)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de matrices D (RTRT) */}
      <h4 className="title-descompotition">Descomposición en d (RTRT)</h4>
      {dhParams.map((params, i) => (
        <div key={`D-${i}`} className="matrix-row">
          <div className="matrix-container">
            <h3>T<sub>{i}</sub><sup>{i + 1}</sup></h3>
            <div className="matrix">
              {computeMatrixD(params).flat().map((v, idx) => (
                <div key={idx}>{renderCell(v)}</div>
              ))}
            </div>
          </div>
          {i > 0 && (
            <MatrixDropdown
              currentFrame={i}
              totalFrames={dhParams.length}
              onSelect={(targetFrame) => handleFrameSelect(i, targetFrame, 'D')}
              isOpen={activeDropdown === `D-${i}`}
              onToggle={() => setActiveDropdown(activeDropdown === `D-${i}` ? null : `D-${i}`)}
            />
          )}
        </div>
      ))}
      
      {/* Matriz final D */}
      {finalMatrixD && (
        <div className="final-matrix">
          <h2 className="final-matrix-title">Matriz Final (D)</h2>
          <div className="matrix final">
            {finalMatrixD.flat().map((v, idx) => (
              <div key={idx}>{renderCell(v)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para mostrar las transformaciones */}
      <MatrixModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        matrix={modalState.matrix}
        title={modalState.title}
      />
    </div>
  );
}

export default TransformationMatrix;
