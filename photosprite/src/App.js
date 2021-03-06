import React from 'react';
import './styles/styles.css';
import Hero from "./components/Hero";
import Converter from "./components/Converter";
import Gallery from './components/Gallery';
import { BrowserRouter, Route, Switch, Redirect} from "react-router-dom";


function App() {
  let tempID = Date.now();
  localStorage.setItem("tempID", tempID);
  

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
