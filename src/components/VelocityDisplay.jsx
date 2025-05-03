// src/components/VelocityDisplay.jsx
import React from 'react';
import './css/VelocityDisplay.css'

export default function VelocityDisplay({ vLin, vAng }) {
    const fmt = x =>
        (typeof x === 'number')
            ? x.toFixed(4)
            : x;       // si es string (simbólico), lo dejas tal cual

    return (
        <div>
            <h3>Velocidades del efector final</h3>
            <div className="velocity-container">
                <p>
                    <strong>Lineal:</strong>{' '}
                    [{vLin.map(fmt).join(', ')}]
                </p>
                <p>
                    <strong>Angular:</strong>{' '}
                    [{vAng.map(fmt).join(', ')}]
                </p>

            </div>
        </div>
    );
}

