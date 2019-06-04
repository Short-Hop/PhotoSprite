import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './styles/styles.css';
import axios from "axios"
import HomePage from "./components/HomePage";



function convertHex(hex, opacity) {
  hex = hex.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  let result = {r: r, g: g, b: b};
  return result;
}

function App() {

  
  const [count, setcount] = useState(0);
  const [image, setimage] = useState("")
  const [originalImage, setoriginalImage] = useState("")
  const [colors, setcolors] = useState(["color1"])

  

  const handleForm = (event) => {
    event.preventDefault()
    
    let array = [];

    colors.forEach((item, index) => {
      array.push(convertHex(event.target.childNodes[index + 3].value));
    })

    console.log(array);

    let paletteArray = JSON.stringify(array);
    
    const data = new FormData();
    data.append("fileInput", event.target.fileInput.files[0]);
    data.append("width", event.target.width.value);
    data.append("height", event.target.height.value);
    data.append("paletteArray", paletteArray);

    axios.post("http://localhost:8080/convertImage", data).then(response => {
      if(response.data) {
        let newImage = <img src={"http://localhost:8080/" + response.data[1] + "?" + new Date().getTime()}></img>;
        let original = <img src={"http://localhost:8080/" + response.data[0] + "?" + new Date().getTime()}></img>;
        setimage(newImage);
        setoriginalImage(original)
        console.log(image)
      } else {
        window.alert("An error has occurred, please try again")
      }
    })

  }

  function addColor(event) {
    let current = []
    colors.forEach(item => {
      current.push(item);
    })

    current.push("color" + (colors.length + 1))

    setcolors(current);

    console.log(colors);
  }

  
  return (
    <div>
      <HomePage/>
      <button type="button" onClick={() => setcount(count + 1)}></button>
      <div>{count}</div>
      {/* <form action="http://localhost:8080/convertImage" method="post" encType="multipart/form-data"> */}
      <form onSubmit= {handleForm} encType="multipart/form-data">
        <input name="fileInput" type="file" accept=".png,.jpg"></input>
        <input name="width" type="number" min="1" defaultValue="1"></input>
        <input name="height" type="number" min="1" defaultValue="1"></input>
        {colors.map(value => 
          <input name={value} key={value}></input>
        )}
        <button type="button" onClick={addColor}>+</button>
        <button>Submit</button>
      </form>
      {image}
      {originalImage}
    </div>
    
  );
}

export default App;
