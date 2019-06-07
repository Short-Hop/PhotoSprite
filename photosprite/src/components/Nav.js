import React, { useState, useEffect } from 'react';
import GoogleLogin from 'react-google-login';
import { GoogleLogout } from 'react-google-login';
import logo from "../assets/logo.png";
import googleButton from "../assets/btn_google_signin_dark_pressed_web@2x.png"
import axios from "axios"
import { Link } from "react-router-dom"

function Nav() {
    const [loggedIn, setloggedIn] = useState(0);
    const [profilepic, setprofilepic] = useState("");

    useEffect(()=> {
        if (localStorage.getItem('token') && localStorage.getItem('profilepic')) {
            setloggedIn(1);
            setprofilepic(localStorage.getItem('profilepic'));
        }
    })

    const responseGoogle = (GoogleResponse) => {
        console.log(GoogleResponse);
        if (GoogleResponse.profileObj.imageUrl) {
            setprofilepic(GoogleResponse.profileObj.imageUrl)
        }

        axios.post("http://localhost:8080/signin", GoogleResponse).then(response => {
            console.log(response.data);

            if (response.data.googleId === GoogleResponse.googleId) {
                console.log(response.data.token)
                console.log("will set localstorage")
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('profilepic', GoogleResponse.profileObj.imageUrl)
                setloggedIn(1);

                // axios.get("http://localhost:8080/verify", { headers: { token: localStorage.getItem('token')}}).then( response=> {
                //     console.log(response)
                // })
            }
        })
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("profilepic");
        setloggedIn(0);
    }

    let loginButton;

    if (loggedIn) {
        loginButton = <GoogleLogout
        render={renderProps => (
                <button className="logoutButton" onClick={renderProps.onClick} disabled={renderProps.disabled}>Logout<img className="profilepic" src={profilepic} alt="logout button" /></button>
        )}
        buttonText="Logout" onLogoutSuccess={handleLogout}
        ></GoogleLogout>
    } else {
        loginButton = <GoogleLogin
            render={renderProps => (
                <button onClick={renderProps.onClick} disabled={renderProps.disabled}><img className="googleButton" src={googleButton} alt="login button"/></button>
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
            <Link className="link" to="/home">
                <img src={logo}></img>
            </Link>
            
            <div className="nav__links">
                <Link className="link" to="/convert">
                    <h3>Convert</h3>
                </Link>
                <Link className="link" to="/gallery">
                    <h3>Gallery</h3>
                </Link>
                { loginButton }
            </div>
            
            
        </div>
        
    )
}

export default Nav;