import React, { useState, useEffect } from 'react';
import landscape from "../assets/images/landscape.jpg"
import landscapegb from "../assets/images/landscape-gb.png"
import arch from "../assets/images/arch.jpg";
import archp from "../assets/images/arch-p.png";
import city from "../assets/images/city.jpg";
import cityp from "../assets/images/city-p.png";
import rocks from "../assets/images/rocks.jpg";
import rocksp from "../assets/images/rocks-p.png";
import { CSSTransition } from 'react-transition-group';



function Hero() {
    const [counter, setcounter] = useState(0);
    const [overlay, setoverlay] = useState(<div className="hero__overlay--hidden"></div>)
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

    useEffect(() => {
        

        setTimeout(()=> {
            if (overlay === <div className="hero__overlay--shown"></div>) {
                setoverlay(<div className="hero__overlay--hidden"></div>) 
            } else {
                setoverlay(<div className="hero__overlay--shown"></div>)
            }
            
            setcounter(counter + 1);
        }, 5000)
    })

    let imageObject = imageArray[counter % 4]

    return (
        <>
        <div className ="hero">
            <div className="hero__images">

                {overlay}
                {/* {imageArray.map((object, index) => {
                    if (index !== counter % 4) {
                        return (
                            <>
                                <img src={object.before} className="hidden"/>
                                <img src={object.after} className="hidden"/>
                            </>
                        )
                    } else {
                        return (
                            <>
                                <img src={object.before} className="shown"/>
                                <img src={object.after} className="shown"/>
                            </>
                        )
                    }
                })} */}

                <img src={imageObject.before}></img>
                <img src={imageObject.after}></img>
            </div>
            <div className="hero__title">
                <h1>Get Started</h1>
            </div>
            
        </div>

        </>
    )
}

export default Hero