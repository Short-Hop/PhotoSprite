import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GalleryItem from './GalleryItem';

function Gallery() {
    const [conversions, setconversions] = useState([]);

    
    useEffect(() => {
        if (localStorage.getItem('token')) {
            console.log("call axios")
            axios.get("http://localhost:8080/gallery/" + localStorage.getItem('token')).then(response => {
                console.log(response.data);
                setconversions(response.data.conversions)
            })
        }
    }, [])
    
        
    

    return (
        <>
        <GalleryItem conversion={conversions[0]}/>
        <div className="gallery">
            <h1>Gallery</h1>
            <div className="gallery__container">
                {conversions.map((conversion, index) => {
                    return (
                        <div key={index} className="gallery__container--item">
                            <img src={'http://localhost:8080/gallery/' + conversion.converted + '/' + localStorage.getItem('token')}  ></img>
                            <h3>{conversion.name}</h3>
                            
                        </div>
                    )
                })}
            </div>
            
        </div>
        </>
    )
}

export default Gallery;