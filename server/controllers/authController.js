//authController
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

module.exports = {
    register: async (req, res) => {
        const {profile, user} = req.body;
        const db = req.app.get('db');
        try{
            //check if  the user already exists in the db
            const [existingUser] = await db.get_new_user(user.email.toLowerCase())

            //if the user already exists, then respond to the front end.
            if (existingUser){
                res.status(409).send("User already registered!")
            } else {
                //if the user doesn't exist. Create a new user object
                let salt = bcrypt.genSaltSync(10);
                console.log("salt", salt)
                let hash = bcrypt.hashSync(user.password, salt);
                console.log("hash", hash)
                let [newUser] = await db.create_user(user.email.toLowerCase(), hash);

                //remove the hash from the newUser object, then send it back to the front end.
                delete newUser.hash;
                //create the new profile using the new user ID
                const [newProfile] = await db.create_profile(
                    profile.first_name,
                    profile.last_name,
                    profile.gamer_tag,
                    profile.location,
                    profile.about_me,
                    profile.sexual_orientation,
                    profile.sex,
                    profile.preferred_pronoun,
                    profile.height,
                    profile.activity_level,
                    profile.religion,
                    profile.education,
                    profile.occupation,
                    profile.kids,
                    profile.alcohol,
                    profile.smoking,
                    profile.cannabis,
                    profile.recreational_drugs,
                    profile.favorite_food,
                    profile.current_game,
                    profile.photo_one,
                    profile.photo_two,
                    profile.photo_three,
                    profile.photo_four,
                    profile.photo_five,
                    newUser.user_id
                );
                res.sendStatus(200);
            }

        } catch (err) {
            console.log("Error creating the new user and profile - " + err)
            res.status(500).send("Error creating the new user and profile - " + err)
        }
    },
    
    login: async (req, res) => {
        const db = req.app.get("db")
        const {email, password} =req.body
       try{
           const [verifiedUser] = await db.get_user(email.toLowerCase())
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

            res.sendStatus(500)
       }
    },


    logOut: (req,res) => {
        req.session.destroy(() => {
            res.sendStatus(200)
        })
    },

    
    updateUser: async (req,res) => {
        const db = req.app.get("db");
        const {id} = req.params;
        const { email, password } = req.body;
// This will require users to complete both EMAIL and PASSWORD!!
// To get old hash, must set up through DB, not in controller/session
// get_user
// just kidding

        const [verifiedUser] = await db.get_user(req.session.user.email.toLowerCase())

        if (verifiedUser){
            res.status(409).send("Email is already in our system!")
        } else {
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password, salt);

// did they type in the password input ? yes, then hash it regardless : if no input, then revert to old password
        db.edit_user([id, (email ? email.toLowerCase() : req.session.user.email.toLowerCase()), ( password !== "" ? hash : verifiedUser.hash )])
        .then(([updatedUser]) => {
            
            delete updatedUser.hash
            req.session.user = updatedUser
            
            res.status(200).send(req.session.user)
            
            }).catch(err => console.log(err))
        }
    },
    updateCredentials: async (req,res) => {
        const db = req.app.get("db");
        const {id} = req.params;
        const { oldEmail, newEmail, oldPassword, newPassword } = req.body;

        //first check the old email and password, only make the updates if the old credentials are correct.
        try{
            const [verifiedUser] = await db.get_user(oldEmail.toLowerCase())
            if(!verifiedUser){
                res.status(403).send('The provided credentials were incorrect - cannot update credentials without the correct old credentials.(Username)')
            } else{
            
            const isAuthenticated = bcrypt.compareSync(oldPassword, verifiedUser.hash)

            if(!isAuthenticated){
            res.status(403).send('The provided credentials were incorrect - cannot update credentials without the correct old credentials.(Password)')
            } else{
            //now that we know the old credentials are correct, update the user with the new credentials.
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(newPassword, salt);

            const [updatedUser] = await db.edit_user(id, newEmail.toLowerCase(), hash);

            delete updatedUser.hash;
           
            res.status(200).send(updatedUser);
            }}
             
        } catch(err) {
             res.sendStatus(500)
        }



    },
    duplicate: async (req, res) => {
        const db = req.app.get("db");
        const { email } = req.query;
        //check the DB to see if the email already exists.
        const [checkedEmail] = await db.check_duplicate_email(email.toLowerCase());
        console.log(checkedEmail)
        if (checkedEmail) {
            res.status(200).send(true);
        } else {
            res.status(200).send(false);
        }
    },

    /**
     * Request password reset - generates token and sends email
     */
    requestPasswordReset: async (req, res) => {
        const db = req.app.get("db");
        const { email } = req.body;

        try {
            // Check if user exists
            const [user] = await db.get_user(email.toLowerCase());
            console.log("User requesting password reset: ", user);

            // For security, always return success even if email doesn't exist
            // This prevents email enumeration attacks
            if (!user) {
                return res.status(200).send({
                    message: 'If an account with that email exists, a password reset link has been sent.'
                });
            }

            // Generate secure random token
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Set expiration to 1 hour from now
            const resetTokenExpiry = Date.now() + 3600000; // 1 hour in milliseconds

            // Save token and expiry to database
            await db.update_reset_token(email.toLowerCase(), resetToken, resetTokenExpiry);
            console.log("sending password reset email to: ", email, " with token: ", resetToken);
            // Send password reset email
            await sendPasswordResetEmail(email.toLowerCase(), resetToken);

            res.status(200).send({
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        } catch (err) {
            console.log("Error requesting password reset - " + err);
            res.status(500).send("Error processing password reset request");
        }
    },

    /**
     * Validate reset token - checks if token exists and hasn't expired
     */
    validateResetToken: async (req, res) => {
        const db = req.app.get("db");
        const { token } = req.params;

        try {
            const [user] = await db.get_user_by_reset_token(token);

            if (!user) {
                return res.status(400).send({ valid: false, message: 'Invalid or expired reset token' });
            }

            // Check if token has expired
            if (Date.now() > user.reset_token_expiry) {
                return res.status(400).send({ valid: false, message: 'Reset token has expired' });
            }

            res.status(200).send({ valid: true, message: 'Token is valid' });
        } catch (err) {
            console.log("Error validating reset token - " + err);
            res.status(500).send({ valid: false, message: 'Error validating reset token' });
        }
    },

    /**
     * Reset password - validates token and updates password
     */
    resetPassword: async (req, res) => {
        const db = req.app.get("db");
        const { token, newPassword } = req.body;

        try {
            // Validate token and get user
            const [user] = await db.get_user_by_reset_token(token);

            if (!user) {
                return res.status(400).send('Invalid or expired reset token');
            }

            // Check if token has expired
            if (Date.now() > user.reset_token_expiry) {
                return res.status(400).send('Reset token has expired');
            }

            // Hash new password
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(newPassword, salt);

            // Update password in database
            await db.edit_user(user.user_id, user.email, hash);

            // Clear reset token and expiry
            await db.clear_reset_token(user.user_id);

            res.status(200).send({ message: 'Password has been successfully reset' });
        } catch (err) {
            console.log("Error resetting password - " + err);
            res.status(500).send("Error resetting password");
        }
    }
}