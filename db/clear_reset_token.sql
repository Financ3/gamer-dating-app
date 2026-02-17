UPDATE users
SET reset_token = NULL, reset_token_expiry = NULL
WHERE user_id = $1
RETURNING user_id, email;
