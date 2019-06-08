import React, { useState, useEffect } from 'react';
import axios from "axios";

function Uploader(props) {
    const [image, setimage] = useState("")
    

    const handleForm = (event) => {
        event.preventDefault()

        let form = document.getElementById("uploadForm");

        const data = new FormData();

        if (form.fileInput.files[0]) {
            data.append("fileInput", form.fileInput.files[0]);
        } else {
            data.append("fileInput", form.fileInput2.value)
        }

        let idData = {
            tempID: localStorage.getItem("tempID")
        }

        axios.post("http://localhost:8080/tempID", idData).then(respones => {
            axios.post("http://localhost:8080/upload", data).then(response => {
                let uploadedImage = <img className="originalImage" src={"http://localhost:8080/uploads/" + response.data + "?" + new Date().getTime()} alt="Invalid URL"></img>


                let img = new Image();
                img.onload = function () {
                    let height = img.height;
                    let width = img.width;
                    let newDimensions = {
                        width: width,
                        height: height,
                        ratio: width / height
                    }

                    props.setdimensions(newDimensions);
                }
                img.src = "http://localhost:8080/uploads/" + response.data + "?" + new Date().getTime();
                setform("")
                setimage(uploadedImage);
                props.setoriginalImage(uploadedImage);
            })
        })

        
    }
    const [form, setform] = useState(
        <form id="uploadForm" onSubmit={handleForm}>
            <h1>Upload a File</h1>
            <input className="inputButton" name="fileInput" type="file" accept=".png,.jpg" onChange={handleForm}></input>

            <h1>or choose a file URL</h1>
            <div className="uploader__box--url">
                <input name="fileInput2" type="url" accept=".png,.jpg"></input>
                <button>Submit</button>
            </div>
            <h1>or take a picture</h1>
            <div className="uploader__box--url">
                <button className="cameraButton" onClick={props.showtakePhoto}>Camera</button>
            </div>
        </form>
    )
    return (
        <div className="uploader">
            <div className="uploader__box">
                {form}
                {image}
                <div className="uploader__box--image">
                    
                </div>
                
                <button onClick={() => props.setuploader("")}>Begin</button>
            </div>
        </div>
    )
}

export default Uploader;