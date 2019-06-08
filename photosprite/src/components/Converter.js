import React, { useState, useEffect } from 'react';
import axios from "axios";
import Uploader from "./Uploader";
import Nav from "./Nav"
import ImageCapture from "./TakePhoto";

let gameboy = JSON.stringify(["#0f380f", "#306230", "#8bac0f", "#9bbc0f"])
let NES = JSON.stringify(["#7C7C7C", "#0000FC", "#0000BC", "#4428BC", "#940084", "#A80020", "#A81000", "#881400", "#503000", "#007800", "#006800", "#005800", 
"#004058", "#000000", "#000000", "#000000", "#BCBCBC", "#0078F8", "#0058F8", "#6844FC", "#D800CC", "#E40058", "#F83800", "#E45C10", "#AC7C00", 
"#00B800", "#00A800", "#00A844", "#008888", "#000000", "#000000", "#000000", "#F8F8F8", "#3CBCFC", "#6888FC", "#9878F8", "#F878F8", "#F85898", 
"#F87858", "#FCA044", "#F8B800", "#B8F818", "#58D854", "#58F898", "#00E8D8", "#787878", "#000000", "#000000", "#FCFCFC", "#A4E4FC", "#B8B8F8", 
"#D8B8F8", "#F8B8F8", "#F8A4C0", "#F0D0B0", "#F8D878", "#D8F878", "#B8F8B8", "#B8F8D8", "#00FCFC", "#F8D8F8", "#000000", "#000000"])

function convertHex(hex, opacity) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    let result = { r: r, g: g, b: b };
    return result;
}

function Converter(props) {
    const [image, setimage] = useState("")
    const [originalImage, setoriginalImage] = useState("")
    const [colors, setcolors] = useState(["#000000"])
    const [uploader, setuploader] = useState("");
    const [dimensions, setdimensions] = useState({height: 1, width: 1, ratio: 1})
    const [useRatio, setuseRatio] = useState(true);
    const [hexpalette, sethexpalette] = useState("")

    

    useEffect(() => {
        if (localStorage.getItem("palette") && JSON.stringify(localStorage.getItem("palette")) !== colors) {
        
            setcolors(JSON.parse(localStorage.getItem("palette")))
            console.log("Using remembered palette")
        }
    }, [])

    const handleForm = (event) => {
        event.preventDefault()

        let paletteArray = [];

        let newHexPalette = []

        let form = document.getElementById("converterForm");

        colors.forEach((item, index) => {
            newHexPalette.push(form.childNodes[1].childNodes[index].value);
            paletteArray.push(convertHex(form.childNodes[1].childNodes[index].value));
        })
        
        setcolors(newHexPalette);
        localStorage.setItem("palette", JSON.stringify(newHexPalette));

        newHexPalette = newHexPalette.join(" ")
        

        const data = {
            width: form.width.value,
            height: form.height.value,
            paletteArray: paletteArray,
            tempID: localStorage.getItem("tempID")
        }

        axios.post("http://localhost:8080/convertImage", data).then(response => {

            if (response.data) {
                let newImage = <img className="newImage" src={"http://localhost:8080/uploads/" + response.data[1] + "?" + new Date().getTime()} alt="converted"></img>;
                let original = <img className="originalImage" src={"http://localhost:8080/uploads/" + response.data[0] + "?" + new Date().getTime()} alt="original"></img>;
                
                setimage(newImage);
                setoriginalImage(original)
                sethexpalette(newHexPalette)
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

        current.push("#000000")
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

    function saveToGallery(event) {
        event.preventDefault();

        if (localStorage.getItem('token')) {

            let form = document.getElementById("converterForm");
            let paletteArray = [];

            colors.forEach((item, index) => {
                paletteArray.push(form.childNodes[1].childNodes[index].value);
            })

            let savedata = {
                tempID: localStorage.getItem("tempID"),
                name: event.target.fileName.value,
                palette: paletteArray
            }

            axios.post("http://localhost:8080/saveToGallery", savedata, { headers: { token: localStorage.getItem('token') } }).then(response => {
                window.alert(response.data);
            })

        } else {
            window.alert("You must be logged in to save to gallery")
        }
    }

    function showUploader() {
        setuploader(<Uploader setoriginalImage={setoriginalImage} setuploader={setuploader} setdimensions={setdimensions} showtakePhoto={showtakePhoto} />)
    }

    function showtakePhoto() {
        setuploader(<ImageCapture setoriginalImage={setoriginalImage} setdimensions={setdimensions} setuploader={setuploader} />)
    }

    function setWidth(event) {
        let newdimensions = {}

        if (useRatio) {
            if (event.target.value !== "") {

                newdimensions = {
                    width: event.target.value,
                    height: Math.ceil(event.target.value / dimensions.ratio),
                    ratio: dimensions.ratio
                }
            } else {
                newdimensions = {
                    width: "",
                    height: 1,
                    ratio: dimensions.ratio
                }
            }
        } else {
            newdimensions = {
                width: event.target.value,
                height: dimensions.height,
                ratio: dimensions.ratio
            }
        }
        setdimensions(newdimensions);
    }

    function setHeight(event) {
        let newdimensions = {}

        if (useRatio) {
            if (event.target.value !== "") {

                newdimensions = {
                    width: Math.ceil(event.target.value * dimensions.ratio),
                    height: event.target.value,
                    ratio: dimensions.ratio
                }
            } else {

                newdimensions = {
                    width: 1,
                    height: "",
                    ratio: dimensions.ratio
                }
            }
        }
        setdimensions(newdimensions);
    }

    function useAspectRatio(event) {
        setuseRatio(event.target.checked);
    }

    function updatePalette(event) {

        let hexArray = event.target.value.split(" ")

        hexArray = hexArray.filter(item => {

            return /^#[0-9A-F]{6}$/i.test(item);
        })
        
        sethexpalette(event.target.value);
        setcolors(hexArray);
    }

    function loadpalette(event) {
        if(event.target.value) {
            setcolors(JSON.parse(event.target.value));
        } else {
            setcolors(["#000000"]);
        }
    }

    function savePalette() {
        if(localStorage.getItem("token")) {
            let name = window.prompt("Enter a name for this palette:")
            if (name) {
                let data = {
                    name: name,
                    palette: colors
                }
                axios.post("http://localhost:8080/savePalette/", data, { headers: { token: localStorage.getItem('token') } }).then(response => {
                    window.alert(response.data)
                })
            }
        } else {
            window.alert("You must be logged in to save a palette")
        }
    }

    return (
        <>
            <Nav match = {props.match}/>
            {uploader}
            <div className="converter">
                <div className="converter__options">
                    <h1>Convert Image</h1>
                    <button onClick={showUploader}>Select Image</button>
                    {originalImage}
                    <form id="converterForm" onSubmit={handleForm}>

                        <select onChange={loadpalette}>
                            <option value={localStorage.getItem("palette")}>Custom</option>
                            <option value={gameboy}>Game Boy</option>
                            <option value={NES}>NES</option>
                        </select>
                        
                        
                        <div className="converter__options--palette">
                            {colors.map((value, index) =>
                                <input className="color" type="color" value={value} key={index} onChange={handleForm}></input>
                            )}
                            <button type="button" onClick={addColor}>+</button>
                            <button type="button" onClick={removeColor}>–</button>
                            <button onClick={savePalette}>save</button>

                        </div>
                        <div className="converter__options--size">
                            
                            Width:<input className="numberInput" name="width" type="number" min="1" value={dimensions.width} onChange={setWidth}></input>
                            Height:<input className="numberInput" name="height" type="number" min="1" value={dimensions.height} onChange={setHeight}></input>
                        </div>
                        <div className="converter__options--ratio">
                            Maintain Aspect Ratio:<input className="checkbox" type="checkbox" checked={useRatio} onChange={useAspectRatio}></input>
                        </div>
                        <div className="converter__options--hex">
                            Hex codes:<textarea type="text" value={hexpalette} onChange={updatePalette}></textarea>
                        </div>
                        <button type="submit">Submit</button>
                    
                    </form>
                    
                </div>
                <form className="converter__results" onSubmit={saveToGallery}>
                    <h1>Result</h1>
                    Name:<input name="fileName" type="text" defaultValue='My Sprite'></input>
                    {image}

                    <button>Save to Gallery</button>
                </form>
            </div>
        </>
    )
}

export default Converter;