import './App.css';
import VertexGame from './vertex';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;


function App() {
    return (
      <div className="App">
        <VertexGame />
      </div>
    );
  }
  
  export default App;