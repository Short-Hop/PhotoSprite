import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './styles/styles.css';
import axios from "axios";
import HomePage from "./components/HomePage";
import ConverterPage from "./components/ConverterPage";
import GalleryPage from './components/GalleryPage';


function App() {
  let tempID = Date.now();
  localStorage.setItem("tempID", tempID);
  console.log(localStorage.getItem("tempID"));

  return (
    <div>
      {/* <ConverterPage/> */}
      <GalleryPage/>
    </div>
    
  );
}

export default App;
