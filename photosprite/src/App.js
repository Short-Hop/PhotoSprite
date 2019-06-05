import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './styles/styles.css';

import HomePage from "./components/HomePage";
import ConverterPage from "./components/ConverterPage";





function App() {
  let tempID = Date.now();
  localStorage.setItem("tempID", tempID);

  return (
    <div>
      <ConverterPage/>
      
    </div>
    
  );
}

export default App;
