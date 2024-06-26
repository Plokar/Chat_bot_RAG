CREATE SCHEMA IF NOT EXISTS oltp;

CREATE TABLE oltp.pdf(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    data BYTEA NOT NULL
);
CREATE TABLE oltp.vector(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    data BYTEA NOT NULL,
    paragraphs JSONB,
    vectorizer BYTEA NOT NULL
);

CREATE TABLE oltp.season (
    id SERIAL PRIMARY KEY,
    content_summary VARCHAR(255) NOT NULL
);

CREATE TABLE oltp.message (
    id SERIAL PRIMARY KEY,
    prompt VARCHAR(255) NOT NULL,
    response VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    season_id INTEGER,
    FOREIGN KEY (season_id) REFERENCES oltp.seasons(id)
);