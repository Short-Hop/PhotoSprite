import React from 'react';
import axios from 'axios';

function GalleryItem(props) {

    console.log(props.conversion);

    function deleteItem() {
        if(window.confirm("Are you sure you want to delete this conversion from your gallery?")) {
            axios.delete("http://localhost:8080/gallery/" + props.conversion.name, { headers: { token: localStorage.getItem('token') } }).then(response => {
                
                props.setsingleItem("");
                window.location.reload();
            })
        }
    }

    return (
        <div className="galleryItem">
            <div className="galleryItem__box">
                <div className="galleryItem__box--delete">
                    <button onClick={deleteItem} className="delete">delete</button>
                    <button onClick={() => props.setsingleItem("")}>x</button>
                </div>
                
                <h1>{props.conversion.name}</h1>
                <div className="galleryItem__box--palette">
                    palette: {props.conversion.palette.map((color, index) => 
                    <input type="color" key={index} value={color} readOnly></input>
                )}
                </div>
                
                <div className="galleryItem__box--images">
                    <img alt="original" src={'http://localhost:8080/gallery/' + props.conversion.original + '/' + localStorage.getItem('token')}></img>
                    <img alt="converted" src={'http://localhost:8080/gallery/' + props.conversion.converted + '/' + localStorage.getItem('token')}></img>
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