// required modules
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

// Verifying jwt token 
function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Unauthorized Access")
    }
    const splitedToken = authHeader.split(" ")[1];
    console.log("Token is :", splitedToken);

    jwt.verify(splitedToken, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" })
        }
        req.decoded = decoded
        next();
    })
}

// async function
async function run() {
    await client.connect();

    // database -> collection
    const toolsCollection = client.db("ManufacturerWebsite").collection('tools');
    const bookingCollection = client.db("ManufacturerWebsite").collection('cart');
    const userCollection = client.db("ManufacturerWebsite").collection("users");

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
    app.get('/cart/:email', verifyJwt, async (req, res) => {
        const email = req.params.email;
        const decodedEmail = req.decoded.userEmail;
        console.log(decodedEmail);
        if (email === decodedEmail) {
            const query = { userEmail: email };
            const result = await bookingCollection.find(query).toArray();
            res.send(result)
        } else {
            return res.status(403).send({ message: "Forbidden Access" })
        }

    })

    // posting into cart
    app.post('/cart', verifyJwt, async (req, res) => {
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
    })

    //getting items on the cart of all users
    app.get('/cart', verifyJwt, async (req, res) => {
        const cartItems = {};
        const result = await bookingCollection.find(cartItems).toArray();
        res.send(result)
    })


    // cart item delete
    app.delete('/cart/:email', async (req, res) => {
        const email = req.params.email;
        const query = { userEmail: email };
        const result = await bookingCollection.deleteOne(query);
        res.send(result);
    })

    // getting all user whoever create an account and giving them jwt token
    app.put("/users/:email", async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { userEmail: email };
        const options = { upsert: true };

        const updateDoc = {
            $set: user
        }

        const result = await userCollection.updateOne(filter, updateDoc, options)

        //jwt signing
        const token = jwt.sign({ userEmail: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 * 60 * 60 })
        res.send({ result, token })
    })

    // Making admin
    app.put("/users/admin/:email", verifyJwt, async (req, res) => {
        const email = req.params.email;
        const initiator = req.decoded.userEmail;
        const initiatorAccount = await userCollection.findOne({ userEmail: initiator });
        console.log(initiatorAccount);
        if (initiatorAccount.role === 'admin') {
            const filter = { userEmail: email };
            const updateDoc = {
                $set: { role: "admin" }
            }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.send(result)
        }
        else {
            return res.status(403).send({ message: "Forbidden Access" })
        }
    })



    // getting all users information
    app.get('/users', verifyJwt, async (req, res) => {
        const query = {};
        const result = await userCollection.find(query).toArray();
        res.send(result)
    })
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('manufacturer website server running...')
})
app.listen(port, () => {
    console.log('listening to port....');
})
