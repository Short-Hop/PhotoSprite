import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GalleryItem from './GalleryItem';
import Nav from "./Nav";

function Gallery(props) {
    const [conversions, setconversions] = useState([]);
    const [singleItem, setsingleItem] = useState(false)
    const [loginMessage, setloginMessage] = useState("")
    
    useEffect(() => {
        if (localStorage.getItem('token')) {
            axios.get("http://photospriteback-env.yufd8zphzk.us-east-2.elasticbeanstalk.com/api/gallery/", { headers: { token: localStorage.getItem('token') } }).then(response => {
                setconversions(response.data.conversions)
            })
        } else {
            setloginMessage(<h3>Sign in with Google to see Gallery</h3>)
        }
    }, [])
        
    function setItem(conversion) {
        setsingleItem(<GalleryItem conversion={conversion} setsingleItem={setsingleItem}/>)
    }

    return (
        <>
        <Nav match={props.match} />
        {singleItem}
        <div className="gallery">
            <h1>Gallery</h1>
            <div className="gallery__container">
                {loginMessage}
                {conversions.map((conversion, index) => {
                    return (
                        <div key={index} className="gallery__container--item" onClick={() => setItem(conversion)}>
                            <img src={'http://photospriteback-env.yufd8zphzk.us-east-2.elasticbeanstalk.com/api/gallery/' + conversion.converted + '/' + localStorage.getItem('token')} alt="thumbnail" ></img>
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