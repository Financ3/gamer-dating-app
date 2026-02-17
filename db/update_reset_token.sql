UPDATE users
SET reset_token = $2, reset_token_expiry = $3
WHERE email = $1
RETURNING user_id, email;
