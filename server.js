require ('dotenv').config(); // load enviornment data
const express = require('express');// application dependencies
const cors = require('cors');
const morgan = require('morgan');
const client = require('./lib/client');
client.connect(); // initiate database connection

const ensureAuth = require('./lib/auth/ensure-auth');
const createAuthRoutes = require('./lib/auth/create-auth-routes');


const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev')); // http logging
app.use(cors());//enable cors request
app.use(express.static('public'));//server files from pubic folder
app.use(express.json());//enable reading incoming json file
app.use(express.urlencoded({ extended:true}));



const authRoutes = createAuthRoutes({
    selectUser(username) {
        return client.query(`
            SELECT id, username, hash, display_name as "displayName" 
            FROM users
            WHERE username = $1;
        `,
            [username]
        ).then(result => result.rows[0]);
    },
    insertUser(user, hash) {
        console.log(user);
        return client.query(`
            INSERT into users (username, hash, display_name)
            VALUES ($1, $2, $3)
            RETURNING id, username, display_name as "displayName";
        `,
            [user.username, hash, user.displayName]
        ).then(result => result.rows[0]);
    }
});

app.get('/api/favorites', async(req, res) => {

    try {
        
        const result = await client.query(`
            SELECT * from list;
        `);
        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.post('/api/favorites', async(req, res) => {

    try {

        console.log('|||||||', req.userId)
        const result = await client.query(`
            INSERT into list (task, complete, user_id)
            VALUES ($1, false, $2)
            returning *;
        `, [req.body.task, req.userId],
        
        res.json(result.rows[0]));
    }
    catch (err) {
        console.log(err);
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.put('/api/favorites/:id', async (req, res) => {
    
    try {
        const result = await client.query(`
        update todos
        set complete=${req.body.complete}
        where id = ${req.params.id}
        returning *;
        `),

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.delete('/list/:id', async (req, res) => {

    try {
        const result = await client.query(`
            delete from favorites where id=${req.params.id}
            returning *;
        `,);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('lets start the show!', PORT);
});