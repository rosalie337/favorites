require ('dotenv').config(); // load enviornment data
const express = require('express');// application dependencies
const cors = require('cors');
const morgan = require('morgan');
const client = require('./lib/client');
client.connect(); // initiate database connection

const ensureAuth = require('./auth/ensure-auth.js');
const createAuthRoutes = require('./auth/create-auth-routes.js');

const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev')); // http logging
app.use(cors());//enable cors request
app.use(express.static('public'));//server files from pubic folder
app.use(express.json());//enable reading incoming json file
app.use(express.urlencoded({ extended:true }));


const authRoutes = createAuthRoutes({
    selectUser(email) {
        return client.query(`
        SELECT id, email, hash, display_name as "displayName" 
        FROM users
        WHERE email = $1;
        `,
        [email]
        ).then(result => result.rows[0]);
    },
    insertUser(user, hash) {
        console.log(user);
        return client.query(`
        INSERT into users (email, hash, display_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, display_name as "displayName";
        `,
        [user.email, hash, user.displayName]
        ).then(result => result.rows[0]);
    }
});

app.use('/api/auth', authRoutes);
app.use('/api', ensureAuth);

app.get('/api/favorites', async(req, res) => {

    try {
        
        const myQuery = await client.query(`
            SELECT * from favorites;
            WHERE user_id=$1
        `);

        const favorites = await client.query(myQuery, [req.userId]
            
        );

        res.json(favorites.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.post('/api/me/favorites', async(req, res) => {

    try {

        console.log('|||||||', req.userId);
        const newFav = await client.query(`
            INSERT into favorites (/* insert values */ user_id)
            VALUES ($1, $2, $3, $4, $5)
            returning *;
        `, [req.body.favs, req.userId],
        
        res.json(newFav.rows[0]));
    }
    catch (err) {
        console.log(err);
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.put('/api/favorites/:id', async(req, res) => {
    
    try {
        const result = await client.query(`
        update favs
        set complete=${req.body.complete}
        where id = ${req.params.id}
        returning *;
        `);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.delete('/favorites/:id', async(req, res) => {

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