import './App.css';
import React from 'react'
import {connect} from 'react-redux';
//import the routes for the auth/registration views
import authRoutes from './routes/authRoutes';

//import components for the main app routes
import mainRoutes from './routes/mainRoutes';

// users table or own table : have a login bool, identifies a user id

function App(props) {

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
export default connect(mapStateToProps)(App)