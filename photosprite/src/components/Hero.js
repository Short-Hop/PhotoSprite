import React, { useState, useEffect } from 'react';
import landscape from "../assets/images/landscape.jpg"
import landscapegb from "../assets/images/landscape-gb.png"
import arch from "../assets/images/arch.jpg";
import archp from "../assets/images/arch-p.png";
import city from "../assets/images/city.jpg";
import cityp from "../assets/images/city-p.png";
import rocks from "../assets/images/rocks.jpg";
import rocksp from "../assets/images/rocks-p.png";



function Hero() {
    const [counter, setcounter] = useState(0);
    const [overlay, setoverlay] = useState(false);

    let imageArray = [
        {
            before: landscape,
            after: landscapegb
        },
        {
            before: arch,
            after: archp
        },
        {
            before: city,
            after: cityp
        },
        {
            before: rocks,
            after: rocksp
        },
    ]
    
    let imageObject
    imageObject = imageArray[counter % 4]

    let blackOverlay;

    if (overlay) {
        blackOverlay = <div id="blackOverlay" className="hero__overlay--shown"></div>
    } else {
        blackOverlay = <div id="blackOverlay" className="hero__overlay--hidden"></div>
    }
    
    if (overlay) {
        setTimeout(()=> {
            
            setoverlay(false);
            
        }, 2000)
    } else {
        setTimeout(()=> {
            setoverlay(true);
        }, 8000)
    }

    
        
        
    setTimeout(()=> {
        setcounter(counter + 1)
    }, 10000)    
        

    return (
        <>
        <div className ="hero">
            <div className="hero__images">
                
                <div className="hero__images--container">
                    {blackOverlay}
                    
                    <img src={imageObject.before}></img>
                    <img src={imageObject.after}></img>
                    
                </div>
                <div className="hero__title">
                    <h1>Convert images<br /> into  pixel art</h1>
                </div>
            </div>
            <button>Get Started</button>
            
        </div>

        </>
    )
}

export default Hero