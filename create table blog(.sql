create table blog(
	email varchar(255)unique not null,
	name varchar(255),
	password varchar(255),
    security_question varchar(255),
    security_answer varchar(255),
	PRIMARY KEY (email)
);
CREATE TABLE posts (
    id serial PRIMARY KEY,
    email VARCHAR(255),
    title TEXT,
    posts TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES blog(email)
);
update posts set title=$1 posts=$2 date=CURRENT_TIMESTAMP where email=$3 and id=$4
