import React from 'react'
import './ToolCard.css'

const ToolCard = ({ tool }) => {
  return (
    <div className="tool-card">
      <div className="tool-icon">{tool.icon}</div>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
      <div className="tool-category">{tool.category}</div>
      <button className="tool-button">Explore</button>
    </div>
  )
}

export default ToolCard
