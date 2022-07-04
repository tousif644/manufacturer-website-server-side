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
app.get('/', (req, res) => {
    res.send('manufacturer website server running...')
})
app.listen(port, () => {
    console.log('listening to port....');
})

