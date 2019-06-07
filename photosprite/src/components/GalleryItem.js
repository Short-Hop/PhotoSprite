import React, { useState, useEffect } from 'react';
import sample from "../assets/images/city.jpg";
import sample2 from "../assets/images/city-p.png";
import xbutton from "../assets/baseline-close-24px.svg"

let palette=[ "#466546", "#6426F3", "#000000"]

function GalleryItem(props) {

    console.log(props.conversion);

    return (
        <div className="galleryItem">
            <div className="galleryItem__box">
                <button onClick ={props.hideItem}>x</button>
                <h1>{props.conversion.name}</h1>
                <div className="galleryItem__box--palette">
                    palette: {props.conversion.palette.map((color, index) => 
                    <input type="color" key={index} value={color} readOnly></input>
                )}
                </div>
                
                <div className="galleryItem__box--images">
                    <img src={'http://localhost:8080/gallery/' + props.conversion.original + '/' + localStorage.getItem('token')}></img>
                    <img src={'http://localhost:8080/gallery/' + props.conversion.converted + '/' + localStorage.getItem('token')}></img>
                </div>

                <div className="galleryItem__box--download">
                    <a className="link" href={'http://localhost:8080/gallery/' + props.conversion.original + '/' + localStorage.getItem('token')} download>Download</a>
                    <a className="link" href={'http://localhost:8080/gallery/' + props.conversion.converted + '/' + localStorage.getItem('token')} download>Download</a>
                </div>
            </div>
            
            
            
        </div>
    )
}

export default GalleryItem;