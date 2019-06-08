import React, { useState, useEffect } from 'react';
import axios from "axios";

function TakePhoto(props) {

    
    let photo;

    useEffect(() => {
        let video = document.querySelector("#camera");
        navigator.mediaDevices.getUserMedia({ video: true })
        .then(mediaStream => {
            
            video.srcObject = mediaStream;
            let track = mediaStream.getVideoTracks()[0];
            photo = new ImageCapture(track)
        })
    });

    function takePhoto(event) {
        photo.takePhoto().then(image => {
            const data = new FormData();

            data.append("fileInput", image);

            let idData = {
                tempID: localStorage.getItem("tempID")
            }

            axios.post("http://localhost:8080/tempID", idData).then(response => {
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


                        // setimage(uploadedImage);
                        props.setdimensions(newDimensions);
                    }
                    img.src = "http://localhost:8080/uploads/" + response.data + "?" + new Date().getTime();
                    props.setoriginalImage(uploadedImage);
                    
                    navigator.mediaDevices.getUserMedia({ video: true })
                        .then(mediaStream => {
                            mediaStream.getVideoTracks()[0].stop();
                        })


                    props.setuploader("")
                })
            })
        });
    }
    
    return(
        <div className="takephoto">
            <div className="takephoto__box">
                <video autoPlay={true} id="camera"></video>
                <button onClick={takePhoto}>Take Photo</button>
                {/* {image} */}
            </div>
            
        </div>
    )
    
}

export default TakePhoto;