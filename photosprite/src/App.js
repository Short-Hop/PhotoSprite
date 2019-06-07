import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './styles/styles.css';
import axios from "axios";
import Hero from "./components/Hero";
import Converter from "./components/Converter";
import Gallery from './components/Gallery';
import { BrowserRouter, Route, Switch, Redirect} from "react-router-dom";


function App() {
  let tempID = Date.now();
  localStorage.setItem("tempID", tempID);
  console.log(localStorage.getItem("tempID"));

  return (
    <BrowserRouter>
      <Switch>
        <Redirect from="/" exact to="/home"></Redirect>
        <Route path="/home" component ={Hero}/>
        <Route path="/convert" component={Converter}/>
        <Route path="/gallery" component={Gallery}/>
      </Switch>
    
    </BrowserRouter>
  );
}

export default App;
