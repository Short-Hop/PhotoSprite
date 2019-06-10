import React, { useState, useEffect } from 'react';
import axios from "axios";
import Uploader from "./Uploader";
import Nav from "./Nav"
import ImageCapture from "./TakePhoto";

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
    const [hexpalette, sethexpalette] = useState("");
    const [presets, setpresets] = useState([]);
    const [deleteButton, setdeleteButton] = useState("")

    

    useEffect(() => {
        if (localStorage.getItem("palette") && JSON.stringify(localStorage.getItem("palette")) !== colors) {
        
            setcolors(JSON.parse(localStorage.getItem("palette")))
            console.log("Using remembered palette")
        }

        axios.get("http://localhost:8080/palette", { headers: { token: localStorage.getItem('token') } }).then(response => {
            setpresets(response.data)
        })

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

        if(originalImage !== "") {
            axios.post("http://localhost:8080/convertImage", data).then(response => {

                if (response.data) {
                    let newImage = <img className="newImage" src={"http://localhost:8080/uploads/" + response.data[1] + "?" + new Date().getTime()} alt="converted"></img>;
                    let original = <img className="originalImage" src={"http://localhost:8080/uploads/" + response.data[0] + "?" + new Date().getTime()} alt="original"></img>;

                    setimage(newImage);
                    sethexpalette(newHexPalette)
                } else {
                    window.alert("An error has occurred, please try again")
                }
            })
        }
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

            axios.post("http://localhost:8080/gallery", savedata, { headers: { token: localStorage.getItem('token') } }).then(response => {
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

        let selector = document.getElementById("paletteList");

        if (selector.selectedIndex !== 0) {
            setdeleteButton(<button className="delete" onClick={deletePalette}>delete</button>)
        } else {
            setdeleteButton("")
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
                axios.post("http://localhost:8080/palette", data, { headers: { token: localStorage.getItem('token') } }).then(response => {
                    window.alert(response.data)

                    axios.get("http://localhost:8080/palette", { headers: { token: localStorage.getItem('token') } }).then(response => {
                        setpresets(response.data)
                    })
                })
            }
        } else {
            window.alert("You must be logged in to save a palette")
        }
    }

    function deletePalette() {
        let selector = document.getElementById("paletteList");
        
        if (window.confirm("Are you sure you want to delete this palette?")) {

            axios.delete("http://localhost:8080/palette/" + presets[selector.selectedIndex - 1].name, { headers: { token: localStorage.getItem('token') } }).then(response => {

                axios.get("http://localhost:8080/palette", { headers: { token: localStorage.getItem('token') } }).then(response => {
                    setpresets(response.data)
                })
            })
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

                        <select onChange={loadpalette} id="paletteList">
                            <option value={localStorage.getItem("palette")}>Custom</option>
                            {presets.map(palette => {
                                return <option value={JSON.stringify(palette.palette)} key={palette.name}>{palette.name}</option>
                            })}
                        </select>
                         
                        <div className="converter__options--palette">
                            {colors.map((value, index) =>
                                <input className="color" type="color" value={value} key={index} onChange={handleForm}></input>
                            )}
                            <button type="button" onClick={addColor}>+</button>
                            <button type="button" onClick={removeColor}>–</button>
                            <button onClick={savePalette}>save</button>
                            {deleteButton}

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