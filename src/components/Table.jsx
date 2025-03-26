import React from 'react'
import './css/Table.css'

const Table = ({ dhParams }) => {
  return (
    <div className="table-container">
    <h2 className="table-title">Tabla de Parámetros DH</h2>
    <table className="table">
      <thead>
        <tr className='table-titles'>
          <th>i</th>
          <th>θ</th>
          <th>α</th>
          <th>a</th>
          <th>d</th>
        </tr>
      </thead>
      <tbody className='table-params'>
        {dhParams.map((param, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{param.θ}</td>
            <td>{param.α}</td>
            <td>{param.a}</td>
            <td>{param.d}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  )
}

export default Table