// src/VertexGame.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
`;

const Board = styled.div`
  position: relative;
  width: 400px;
  height: 400px;
  border: 2px solid #333;
  margin: 20px 0;
`;

const Vertex = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #3498db;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  color: white;
  z-index: 2;
`;

const Line = styled.div`
  position: absolute;
  background-color: #2c3e50;
  transform-origin: 0 50%;
  z-index: 1;
`;

const Triangle = styled.polygon`
  fill: ${props => props.color};
  stroke: #2c3e50;
  stroke-width: 1;
`;

const Button = styled.button`
  font-size: 18px;
  padding: 10px 20px;
  margin: 10px;
  cursor: pointer;
`;

const BOARD_SIZE = 400;
const GRID_SIZE = 4;

function VertexGame() {
  const [vertices, setVertices] = useState([]);
  const [lines, setLines] = useState([]);
  const [triangles, setTriangles] = useState([]);
  const [selectedVertex, setSelectedVertex] = useState(null);
  const [imageData, setImageData] = useState([]);
  const [tempLine, setTempLine] = useState(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newVertices = [];
    const cellSize = BOARD_SIZE / GRID_SIZE;
    for (let y = 0; y <= GRID_SIZE; y++) {
      for (let x = 0; x <= GRID_SIZE; x++) {
        newVertices.push({
          id: y * (GRID_SIZE + 1) + x,
          x: x * cellSize,
          y: y * cellSize,
          edges: 4,
        });
      }
    }
    setVertices(newVertices);
    setLines([]);
    setTriangles([]);
    setSelectedVertex(null);
    setImageData([
      'red', 'red', 'blue', 'blue',
      'red', 'red', 'blue', 'blue',
      'red', 'red', 'blue', 'blue',
      'red', 'red', 'blue', 'blue',
    ]);
  };

  const handleVertexClick = (vertex) => {
    if (selectedVertex === null) {
      setSelectedVertex(vertex);
    } else if (selectedVertex.id !== vertex.id) {
      const newLine = { start: selectedVertex, end: vertex };
      if (!lines.some(line => 
        (line.start.id === newLine.start.id && line.end.id === newLine.end.id) ||
        (line.start.id === newLine.end.id && line.end.id === newLine.start.id)
      )) {
        setLines([...lines, newLine]);
        updateVertexEdges(selectedVertex.id);
        updateVertexEdges(vertex.id);
        checkAndAddTriangles(newLine);
      }
      setSelectedVertex(null);
    } else {
      setSelectedVertex(null);
    }
    setTempLine(null);
  };

  const updateVertexEdges = (vertexId) => {
    setVertices(vertices.map(v => 
      v.id === vertexId ? { ...v, edges: Math.max(0, v.edges - 1) } : v
    ));
  };

  const checkAndAddTriangles = (newLine) => {
    const potentialTriangles = lines.filter(line => 
      line.start.id === newLine.start.id || line.end.id === newLine.start.id ||
      line.start.id === newLine.end.id || line.end.id === newLine.end.id
    );

    potentialTriangles.forEach(line => {
      const thirdPoint = vertices.find(v => 
        v.id !== newLine.start.id && v.id !== newLine.end.id &&
        (v.id === line.start.id || v.id === line.end.id)
      );

      if (thirdPoint && lines.some(l => 
        (l.start.id === thirdPoint.id && l.end.id === newLine.end.id) ||
        (l.start.id === newLine.end.id && l.end.id === thirdPoint.id) ||
        (l.start.id === thirdPoint.id && l.end.id === newLine.start.id) ||
        (l.start.id === newLine.start.id && l.end.id === thirdPoint.id)
      )) {
        const cellSize = BOARD_SIZE / GRID_SIZE;
        const cellX = Math.floor((newLine.start.x + newLine.end.x + thirdPoint.x) / 3 / cellSize);
        const cellY = Math.floor((newLine.start.y + newLine.end.y + thirdPoint.y) / 3 / cellSize);
        const cellIndex = cellY * GRID_SIZE + cellX;
        const color = imageData[cellIndex];

        setTriangles([...triangles, { points: [newLine.start, newLine.end, thirdPoint], color }]);
      }
    });
  };

  const handleMouseMove = (e) => {
    if (selectedVertex) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setTempLine({ start: selectedVertex, end: { x, y } });
    }
  };

  const renderLine = (line, index) => {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    return (
      <Line
        key={index}
        style={{
          left: `${line.start.x}px`,
          top: `${line.start.y}px`,
          width: `${length}px`,
          height: '2px',
          transform: `rotate(${angle}deg)`,
        }}
      />
    );
  };

  return (
    <GameContainer>
      <h1>Vertex Clone</h1>
      <Board onMouseMove={handleMouseMove} onMouseLeave={() => setTempLine(null)}>
        <svg width={BOARD_SIZE} height={BOARD_SIZE}>
          {triangles.map((triangle, index) => (
            <Triangle
              key={index}
              points={`${triangle.points[0].x},${triangle.points[0].y} ${triangle.points[1].x},${triangle.points[1].y} ${triangle.points[2].x},${triangle.points[2].y}`}
              color={triangle.color}
            />
          ))}
        </svg>
        {vertices.map(vertex => (
          <Vertex
            key={vertex.id}
            style={{ left: `${vertex.x - 15}px`, top: `${vertex.y - 15}px` }}
            onClick={() => handleVertexClick(vertex)}
          >
            {vertex.edges}
          </Vertex>
        ))}
        {lines.map(renderLine)}
        {tempLine && renderLine(tempLine, 'temp')}
      </Board>
      <Button onClick={initializeGame}>New Game</Button>
    </GameContainer>
  );
}

export default VertexGame;