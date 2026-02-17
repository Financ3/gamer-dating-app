import {Switch, Route} from 'react-router-dom';
import React from 'react'

// Import components for the authentication/registration routes
import AuthHome from '../Components/LoginRegisterRoutes/AuthHome';
import Login from '../Components/LoginRegisterRoutes/Login';
import ForgotPassword from '../Components/LoginRegisterRoutes/ForgotPassword';
import ResetPassword from '../Components/LoginRegisterRoutes/ResetPassword';

import Welcome from '../Components/LoginRegisterRoutes/Registration/Welcome';
import Registration from '../Components/LoginRegisterRoutes/Registration/Registration';

export default (
    <Switch>
        <Route exact path="/" component={AuthHome}/>
        <Route path="/login" component={Login}/>
        <Route path="/forgot-password" component={ForgotPassword}/>
        <Route path="/reset-password/:token" component={ResetPassword}/>
        <Route path="/registerpath" component={Registration}/>
        <Route path="/welcome" component={Welcome}/>
    </Switch>
)