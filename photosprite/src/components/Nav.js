import React, { useState, useEffect } from 'react';
import GoogleLogin from 'react-google-login';
import { GoogleLogout } from 'react-google-login';
import logo from "../assets/logo.png";
import googleButton from "../assets/btn_google_signin_dark_pressed_web@2x.png"
import axios from "axios"

function Nav() {
    const [loggedIn, setloggedIn] = useState(0);
    const [profilepic, setprofilepic] = useState("");


    const responseGoogle = (GoogleResponse) => {
        console.log(GoogleResponse);
        if (GoogleResponse.profileObj.imageUrl) {
            setprofilepic(GoogleResponse.profileObj.imageUrl)
        }

        axios.post("http://localhost:8080/signin", GoogleResponse).then(response => {

            if (response.data === parseInt(GoogleResponse.googleId)) {
                console.log("will set state")
                setloggedIn(1);
            }
        })
    }

    let loginButton;

    if (loggedIn) {
        loginButton = <GoogleLogout
        render={renderProps => (
            <button className="logoutButton" onClick={renderProps.onClick} disabled={renderProps.disabled}>Logout<img className="profilepic" src={profilepic} /></button>
        )}
        buttonText="Logout" onLogoutSuccess={() => setloggedIn(0)}
        ></GoogleLogout>
    } else {
        loginButton = <GoogleLogin
            render={renderProps => (
                <button onClick={renderProps.onClick} disabled={renderProps.disabled}><img className="googleButton" src={googleButton}/></button>
            )}
            clientId="417105554681-9dhq2bb9o7cfa864nv2nnk75f2jfbtvi.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={'single_host_origin'}
        />
    }

    return(
        <div className="nav">
            <img src={logo}></img>
            <div className="nav__links">
                
                <h3>Convert</h3>
                <h3>Gallery</h3>
                { loginButton }
            </div>
            
            
        </div>
        
    )
}

export default Nav;