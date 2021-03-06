import "./CSS/Credentials.css"
import React, {useState} from 'react'
import {registerUser} from '../../../ducks/userReducer'
import {connect} from 'react-redux'
import BackButton2 from '../BackButton2'
import axios from 'axios'

//Credentials component
const Credentials = (props) => {
    const [email, setEmail] = useState(props.actualUser.email)
    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")
    

    const nextView = async () => {
        //check to make sure they have filled out all forms
        if (email=== "" || password === "" || password2 === "") {
            alert("You must fill out all form fields.");
            return;
        }

        //check to make sure that the password and confirm password are correct
        if(password !== password2) {
            alert("Passwords do NOT match!")
            return;
        }

        //create the new user object now that we know the forms are correctly filled out
        let newUser = {
            email: email,
            password: password
        }

        let res;
        try {
            res = await axios.post('/auth/signup',{profile: props.actualProfile, user: newUser});
        } catch (err) {
            console.log("Duplicate email - " + err);
            alert("Email already exists. Please login, or use a different email.");
            return;
        }  

        //move to the next view    
        props.setIndexTracker(4);
    }

    return (
        <div className="credentials-view-wrapper-container">
            

            <div className="credentials-title-container">
                <h1>Login Credentials:</h1>
            </div>

            <div className="credentials-view-wrapper">
                <p>This is the email and password you will use to login to your account.</p>
                <div id="credentials-view-container-email" className="credentials-view-container">
                    <div className="credentials-view-text">Email:</div>
                    <input placeholder="Email" type="email" defaultValue={props.actualUser.email} onChange={(e) => setEmail(e.target.value)}></input>
                </div>

                <div className="credentials-view-container">
                    <div className="credentials-view-text">Password:</div>
                    <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)}></input>
                </div>

                <div className="credentials-view-container">
                    <div className="credentials-view-text">Confirm Password:</div>
                    <input placeholder="Password" type="password" onChange={(e) => setPassword2(e.target.value)}></input>
                </div>
            </div>
            <div className="credentials-view-save-button">
                <div onClick={() => nextView()}>Save and Continue</div>
            </div>
            <BackButton2 setIndexTracker={props.setIndexTracker} indexTracker={props.indexTracker}/>
            <div className="credentials-view-spacer"></div>
        </div>
    )
}

const mapStateToProps = reduxState => {
    return reduxState
}

export default connect (mapStateToProps,{registerUser})(Credentials);
