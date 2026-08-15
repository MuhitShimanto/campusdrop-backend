ALTER TABLE users
ADD CONSTRAINT users_auth_user_fk
FOREIGN KEY (user_id)
REFERENCES "auth_user"(id)
ON DELETE CASCADE;