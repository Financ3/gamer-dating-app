//authController
const bcrypt = require('bcryptjs')

module.exports = {
    register:async (req, res) => {
        const {email, password} = req.body;
        const db = req.app.get('db');
        try{
            const [existingUser] = await db.get_user(email)
            if (existingUser){
                res.status(409).send("User already registered!")
            } else {
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(password, salt);
                let [newUser] = await db.create_user(email, hash);

                res.status(200).send(newUser)
            }

        } catch (err) {
            res.sendStatus(500)
        }
    },
    
    login: async (req, res) => {
        const db = req.app.get("db")
        const {email, password} =req.body
       try{
           const [verifiedUser] = await db.get_user(email)
            if(!verifiedUser){
                res.status(403).send('There is no account matched with that email, maybe you need to register?')
            } else{
            const isAuthenticated = bcrypt.compareSync(password, verifiedUser.hash)

            if(!isAuthenticated){
              res.status(403).send('Email or password does not match ')
            } else{
            
            delete verifiedUser.hash
            

            //add the viewable profiles to the verified user
            verifiedUser.viewableProfiles = await db.get_viewable_profiles(verifiedUser.profile_id)
            req.session.user = verifiedUser
            res.status(200).send(req.session.user)

            }}
            
       } catch(err) {
           console.log(err)
            res.sendStatus(500)
       }
    },


    logOut: (req,res) => {
        req.session.destroy()
        res.status(200).send(req.session)
    },

    updateUser: async (req,res) => {
        const db = req.app.get("db");
        const {id} = req.params;
        const { email, password } = req.body;
// This will require users to complete both EMAIL and PASSWORD!!
// To get old hash, must set up through DB, not in controller/session
// get_user
// just kidding
        
        const [verifiedUser] = await db.get_user(req.session.user.email)

        if (verifiedUser){
            res.status(409).send("Email is already in our system!")
        } else {
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password, salt);

// did they type in the password input ? yes, then hash it regardless : if no input, then revert to old password
        db.edit_user([id, (email || req.session.user.email), ( password !== "" ? hash : verifiedUser.hash )])
        .then(([updatedUser]) => {
            
            delete updatedUser.hash
            req.session.user = updatedUser
            
            res.status(200).send(req.session.user)
            
            }).catch(err => console.log(err))
        }
    }
}