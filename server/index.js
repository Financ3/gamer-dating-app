//root server file
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const massive = require("massive");
const session = require("express-session");
const express = require("express");
// const FileStore = require('session-file-store')(session);
const profileController = require("./controllers/profileController");
const matchesController = require("./controllers/matchesController");
const chatsController = require("./controllers/chatsController");
const authCtrl = require("./controllers/authController");

const { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env;

const app = express();
app.use(express.json());

app.use(
  session({
    // store: new FileStore({
    //   path:'./session-store'
    // }),
    // name:'_one_up_demo',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {

      maxAge: 1000 * 60 * 525600,

    },

  }));

// app.get('/session', function (req, res) {
//   // simple count for the session
//   if (!req.session.count) {
//       req.session.count = 0;
//   }
//   req.session.count += 1;
//   // respond with the session object
//   res.json(req.session);
// });

// app.use(require('cookie-parser')());

// app.get('/auth/reload',function(req,res){
//   if(!req.session){
//     req.session= req.cookies
//   }
//   res.status(200).send(req.session)

//   console.log(req.session.user._one_up_demo)
// })
//Controller endpoints here

//PROFILE ENDPOINTS
    //update profile: receives a profile object and sends it to the DB to update that profile object in the DB. 

    app.get('/api/viewableprofiles/:profile_id', profileController.getViewableProfiles);
//update profile: receives a profile object and sends it to the DB to update that profile object in the DB.
app.get("/api/getprofile/:profile_id", profileController.getProfile);
app.put("/api/updateprofile/:profile_id", profileController.updateProfile);
app.post("/api/createprofile", profileController.createProfile);
app.delete("/api/deleteprofile/:profile_id", profileController.deleteProfile);

//MATCHES ENDPOINTS
//LIKE: add to the like table, check for match on like table, if matched, add match in the match table.
//The front end should send the liking users ID as a parameter in the URL. The liked users profile ID will be in the query string variables ?profile_id=X.

//endpoint will return the match ID if there was a match, a boolean "false" if there was no match. Either way the like will be logged in the database.
app.post("/api/like/:profile_id_1/liked/:profile_id_2", matchesController.like);

//DISLIKE: Create a bogus update for the unliked profile on the profile table*
//The front end should send the id for the unliked profile in the URL parameters
app.put("/api/dislike/:profile_id", matchesController.dislike);

//UNMATCH: *Remove match from matches table, remove like from likes table, Create a bogus update for the unmatch profile on the profile table**
//front end should send the match ID in the url params. The unmatching user_id in the query string, and the unmatched profile_id in the query string.
//?user_id=X&profile_id=Y
app.delete("/api/unmatch/:match_id", matchesController.unmatch);

app.get(`/api/allmatches/:profile_id`, chatsController.getAllChats);
app.get(`/api/matches/:profile_id`, chatsController.getChats);
app.get(`/api/matchedchat/:match_id`, chatsController.getMatchedChat);
app.get(`/api/message/:match_id`, chatsController.getMessage);
app.post(`/api/chat`, chatsController.addChatReply);
app.put("/api/chat/:chat_id", chatsController.updateChatReply);
app.delete("/api/chat/:chat_id", chatsController.deleteChatReply);

// app.post(`/auth/register`, authController.login);

// Authentication Controller Endpoints
app.post("/auth/signup", authCtrl.register);
app.post("/auth/login", authCtrl.login);
app.delete("/auth/logout", authCtrl.logOut);
app.put("/auth/updateuser/:id", authCtrl.updateUser);

//establish the database connection and start the server
massive(
  {
    connectionString: CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  { scripts: path.join(__dirname, "../db") }
)
  .then((dbInstance) => {
    app.set("db", dbInstance);
    app.listen(SERVER_PORT, () => {
      console.log(`Server running on port ${SERVER_PORT}`);
    });
  })
  .catch((err) => console.log(err));
