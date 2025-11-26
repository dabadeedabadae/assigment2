const { Pool } = require("pg");
const pool = new Pool({
    host: "localhost",
    post: 5432,
    user: "postgres",
    password: "root",
    database: "nirvana"
});

module.exports = pool;