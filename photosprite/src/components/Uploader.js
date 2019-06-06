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
                console.log(response.data);
                let uploadedImage = <img className="originalImage" src={"http://localhost:8080/uploads/" + response.data + "?" + new Date().getTime()} alt="Invalid URL"></img>
                setimage(uploadedImage);
                props.setoriginalImage(uploadedImage);
            })
        })

        
    }
    return (
        <div className="uploader">
            <div className="uploader__box">
                <form id="uploadForm" onSubmit={handleForm}>
                    <h1>Upload a File</h1>
                    <input className="inputButton" name="fileInput" type="file" accept=".png,.jpg" onChange={handleForm}></input>

                    <h1>or choose a file URL</h1>
                    <div className="uploader__box--url">
                        <input name="fileInput2" type="url" accept=".png,.jpg"></input>
                        <button>Submit</button>
                    </div>
                    
                </form>
                <div className="uploader__box--image">
                    {image}
                </div>
                
                <button>Begin</button>
            </div>
        </div>
    )
}

export default Uploader;