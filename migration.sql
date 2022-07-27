DROP TABLE IF EXISTS pets;

CREATE TABLE pets(
id SERIAL PRIMARY KEY,
name TEXT,
kind TEXT,
age INTEGER
);

INSERT INTO pets (name, kind, age) VALUES ('fluffy', 'dog', 12);
INSERT INTO pets (name, kind, age) VALUES ('buttons', 'snake', 5);
INSERT INTO pets (name, kind, age) VALUES ('patches', 'dog', 4);