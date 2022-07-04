// required modules
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json())

// port
const port = process.env.PORT || 5000;

// apis

// Mongo->DB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.szq7h.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// async function
async function run() {
    await client.connect();

    // database -> collection
    const toolsCollection = client.db("ManufacturerWebsite").collection('tools');


    // getting all tools api
    app.get('/tools', async (req, res) => {
        const query = {};
        const result = await toolsCollection.find(query).toArray();
        res.send(result);
    })

}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('manufacturer website server running...')
})
app.listen(port, () => {
    console.log('listening to port....');
})

