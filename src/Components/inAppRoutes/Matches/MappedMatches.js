import { connect } from "react-redux";
import { Link } from "react-router-dom";

const MappedMatches = (props) => {
  const { match } = props;

  
  return props.userReducer.user.profile_id === match.profile1 ? (
    <div className="mappedMatches">
      <div className="mappedMatchesContainer">
        <Link to={`/chats/${match.profile1}`}>
          <div className="matches-picture-div">
            <img id='mappedMatchesPicture' src={match.photo2} alt={"p"}></img>
          </div>
        </Link>
        <h3 >{match.gamertag2}</h3>
      </div>
    </div>
  ) : (
    <div className='mappedMatches'>
      <Link to={`/chats/${match.profile2}`}>
      <div className="matches-picture-div">
        <img className="mappedMatchesPicture" src={match.photo1} alt={"p"}></img>
     </div>
     </Link>
      <h3><strong></strong>{match.gamertag1}</h3>
    </div>
  );
};

const mapStateToProps = (reduxState) => {
  return reduxState;
};
export default connect(mapStateToProps)(MappedMatches);
