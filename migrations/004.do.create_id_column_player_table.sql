ALTER TABLE even_teams_players
DROP COLUMN IF EXISTS user_id;

ALTER TABLE even_teams_players
ADD user_id integer;