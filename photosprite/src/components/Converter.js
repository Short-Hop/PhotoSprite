import React, { useState, useEffect } from 'react';
import axios from "axios";
import Uploader from "./Uploader";

function convertHex(hex, opacity) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    let result = { r: r, g: g, b: b };
    return result;
}



function Converter() {
    const [imageURL, setimageURL] = useState("");
    const [image, setimage] = useState("")
    const [originalImage, setoriginalImage] = useState("")
    const [colors, setcolors] = useState(["color1"])


    const handleForm = (event) => {
        event.preventDefault()

        let paletteArray = [];

        let form = document.getElementById("converterForm");

        colors.forEach((item, index) => {
            paletteArray.push(convertHex(form.childNodes[0].childNodes[index].value));
        })

        const data = {
            width: form.width.value,
            height: form.height.value,
            paletteArray: paletteArray
        }

        axios.post("http://localhost:8080/convertImage", data).then(response => {

            if (response.data) {
                let newImage = <img className="newImage" src={"http://localhost:8080/" + response.data[1] + "?" + new Date().getTime()} alt="converted image"></img>;
                let original = <img className="originalImage" src={"http://localhost:8080/" + response.data[0] + "?" + new Date().getTime()} alt="original image"></img>;
                setimage(newImage);
                setoriginalImage(original)
                setimageURL("http://localhost:8080/" + response.data[1])
                console.log(image)
            } else {
                window.alert("An error has occurred, please try again")
            }
        })

    }

    function addColor() {
        let current = []
        colors.forEach(item => {
            current.push(item);
        })

        current.push("color" + (colors.length + 1))
        setcolors(current);
    }

    function removeColor() {

        if (colors.length > 1) {
            let current = [];
            colors.forEach(item => {
                current.push(item);
            })

            current.pop();

            setcolors(current);
        }
    }
    return (
        <>
        <Uploader setoriginalImage={setoriginalImage}/>
        <div className="converter">
            <div className="converter__options">
                <h1>Convert Image</h1>
                {originalImage}
                <form id="converterForm" onSubmit={handleForm}>
                    
                    <div className="converter__options--palette">
                        {colors.map(value =>
                            <input className="color" name={value} type="color"  key={value} onChange={handleForm}></input>
                        )}
                        <button type="button" onClick={addColor}>+</button>
                        <button type="button" onClick={removeColor}>–</button>
                    </div>
                    <div className="converter__options--size">
                        Width:<input className="numberInput" name="width" type="number" min="1" defaultValue="1"></input>
                        Height:<input className="numberInput" name="height" type="number" min="1" defaultValue="1"></input>
                    </div>
                    <button type="submit">Submit</button>
                   
                </form>
                
            </div>
            <form className="converter__results">
                <h1>Result</h1>
                Name:<input type="text"></input>
                {image}

                <button>Save to Gallery</button>
            </form>
        </div>
        </>
    )
}

export default Converter;