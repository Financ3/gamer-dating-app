import React, { useEffect,useState } from "react";
import { connect } from "react-redux";
import MappedMatchChat from './MappedMatchChat'
import axios from "axios";
import Header from '../../Header'
import ExistingChats from './ExistingChats'
import MappedMatches from './MappedMatches'
import { getMatches,getMatchedChat } from "../../../ducks/profileReducer";
import {useHistory} from 'react-router-dom'
import "./matches.css";

const Matches = (props) => {
  let history = useHistory()
  const [allMatches,setAllMatches]= useState([])
  const [toggle,setToggle]= useState(false)

  const {profile_id}= props.userReducer.user
const {getMatches} =props
const {isLoggedIn}=props.userReducer
useEffect(()=>{
 !isLoggedIn ?  history.push('/login'): console.log(profile_id)
})
  useEffect(() => {
    getMatches(profile_id);
    axios.get(`/api/allmatches/${profile_id}`)
    .then(res=>{
      setAllMatches(res.data)
    })
    .catch(err=>console.log(err))
  
  },[profile_id,getMatches]);


  let mappedPhotos = allMatches.map((match, i) => {
    return (
     <MappedMatches key={i} match={match}/>
      )
  });
  
  let mappedMatches = props.profileReducer.matches.map((match, i) => {
    return (
        <ExistingChats key={i} match={match} />
    );
  });

  return (
    <div className="main-display">
      <Header/> 
      <div className="matches-title-pictures-container">
        <div className="matches-title">
          <h1>Matches</h1>
        </div>
        <div className="matches-picture-view">{mappedPhotos}</div>
      </div>
      

      <div className='match1'>  
        <div className="match1-title">
          <h1>Chats</h1>
        </div>  
        <div id="mapped-matches-container">
          {mappedMatches}
        </div> 
      </div>
    </div>
  );
};
const mapStateToProps = (reduxState) => {
  return reduxState;
};
export default connect(mapStateToProps, { getMatches,getMatchedChat })(Matches);