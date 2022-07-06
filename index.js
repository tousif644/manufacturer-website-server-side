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
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.szq7h.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// async function
async function run() {
    await client.connect();

    // database -> collection
    const toolsCollection = client.db("ManufacturerWebsite").collection('tools');
    const bookingCollection = client.db("ManufacturerWebsite").collection('cart');


    // getting all tools api
    app.get('/tools', async (req, res) => {
        const query = {};
        const result = await toolsCollection.find(query).toArray();
        res.send(result);
    })


    // getting a tools by using this api
    app.get('/tools/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await toolsCollection.findOne(query);
        res.send(result);
    })

    // getting cart item for specific email
    app.get('/cart/:email', async (req, res) => {
        const email = req.params.email;
        const query = { userEmail: email };
        const result = await bookingCollection.find(query).toArray();
        res.send(result)
    })

    // posting into cart
    app.post('/cart', async (req, res) => {
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
    })


    // cart item delete
    app.delete('/cart/:email', async (req, res) => {
        const email = req.params.email;
        const query = { userEmail: email };
        const result = await bookingCollection.deleteOne(query);
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

