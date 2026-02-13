import './App.css';
import {connect} from 'react-redux';
import React, {useEffect} from 'react';
//import the routes for the auth/registration views
import authRoutes from './routes/authRoutes';

//import components for the main app routes
import mainRoutes from './routes/mainRoutes';

import {loginUser} from './ducks/userReducer';


function App(props) {


  useEffect(() => {
    console.log("checking local storage for logged in user: ", JSON.parse(localStorage.getItem('loggedInUser')))
    if(JSON.parse(localStorage.getItem('isLoggedIn'))) {
      //set the user on redux and the logged in status
      props.loginUser(JSON.parse(localStorage.getItem('loggedInUser')));
    }

  },[props])

    return (
        <div className="App">
          {/* Only display the main app views if the user is logged in */}
          {props.isLoggedIn?mainRoutes:authRoutes}
        </div>
    );
}
const mapStateToProps = reduxState => {
  return reduxState.userReducer
}

export default connect(mapStateToProps, {loginUser})(App)