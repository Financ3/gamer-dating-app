UPDATE profiles
SET 
first_name = $2,
last_name = $3,
gamer_tag = $4,
location = $5,
about_me = $6,
sexual_orientation = $7,
sex = $8,
preferred_pronoun = $9,
height = $10,
activity_level = $11,
religion = $12,
education = $13,
occupation = $14,
kids = $15,
alcohol = $16,
smoking = $17,
cannabis = $18,
recreational_drugs = $19,
favorite_food = $20,
current_game = $21,
photo_one = $22,
photo_two = $23,
photo_three = $24,
photo_four = $25,
photo_five = $26,
user_id = $27
WHERE profile_id = $1
returning *;