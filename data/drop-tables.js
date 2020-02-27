const client = require('../lib/client');// <---- what is this component?

// async/await needs to run in a function
run();

async function run() {

    try {
        await client.connect();

        await client.query(`     
            DROP TABLES IF EXIST favorites;
            DROP TABLES IF EXIST users;
            DROP TABLES IF EXIST list;      
        `);
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
}