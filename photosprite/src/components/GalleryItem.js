import React, { useState, useEffect } from 'react';
import sample from "../assets/images/city.jpg";
import sample2 from "../assets/images/city-p.png";
import xbutton from "../assets/baseline-close-24px.svg"

let palette=[ "#466546", "#6426F3", "#000000"]

function GalleryItem(props) {

    return (
        <div className="galleryItem">
            <div className="galleryItem__box">
                <button>x</button>
                <h1>My Sprite</h1>
                <div className="galleryItem__box--palette">
                    palette: {palette.map((color, index) => 
                    <input type="color" key={index} value={color} readOnly></input>
                )}
                </div>
                
                <div className="galleryItem__box--images">
                    <img src={sample}></img>
                    <img src={sample2}></img>
                </div>

                <div className="galleryItem__box--download">
                    <a>Download</a>
                    <a>Download</a>
                </div>
            </div>
            
            
            
        </div>
    )
}

export default GalleryItem;