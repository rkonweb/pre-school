const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
    console.time("Total Connection & Query");
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    console.time("Connect");
    await client.connect();
    console.timeEnd("Connect");

    console.time("First Query (Cold)");
    await client.query('SELECT 1');
    console.timeEnd("First Query (Cold)");

    console.time("Count Students Query");
    const res = await client.query('SELECT COUNT(*) FROM "Student"');
    console.timeEnd("Count Students Query");
    
    console.log("Count:", res.rows[0].count);

    await client.end();
    console.timeEnd("Total Connection & Query");
}

testConnection().catch(console.error);
