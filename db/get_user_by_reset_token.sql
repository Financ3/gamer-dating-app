SELECT user_id, email, reset_token_expiry
FROM users
WHERE reset_token = $1;
