CREATE TABLE blog (
    email varchar(255) PRIMARY KEY,
    name varchar(50),
    password varchar(255)
);

CREATE TABLE posts (
    id serial PRIMARY KEY,
    email varchar(255),
    title text NOT NULL,
    post_text text NOT NULL,
    post_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES blog (email) ON DELETE CASCADE
);


select blog.email,
 blog.name,
 posts.title ,
 posts.post_text,
 posts.post_date
 from blog join posts on blog.email= posts.email;