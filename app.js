require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
var cors = require('cors');

const app = express();

// Allow CORS from any origin
// Change this for security!
app.use(cors());
app.use(express.json());

const port = 8080;

// Reverse proxy
// https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const authKey = process.env.REACT_APP_AZURE;
const location = 'japaneast';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 1 second
  max: 5, // limit each IP to 1 requests per windowMs
});

app.use(limiter);

// Routes

// Test route
app.get('/', (req, res) => {
  console.log('Root url / accessed.');
  res.send('Hello World!');
});

app.get('/test', (req, res) => {
  console.log('Test get called');
  res.sendStatus(200);
});

app.post('/api/translatetest', (req, res) => {
  console.log('api/translate called without Azure');
  console.log(req.body);
  res.sendStatus(200);
});

app.post('/api/translate', async (req, res) => {
  console.log('api/translate/ called');
  try {
    console.log('Translate try started');
    console.log('Fetch String:' + req.body.fetchInfo);
    console.log(req.body.fetchBody);

    const response = await fetch(req.body.fetchInfo, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': authKey,
        'Ocp-Apim-Subscription-Region': location,
        'Content-type': 'application/json',
      },
      body: JSON.stringify(req.body.fetchBody),
    });
    const parsedResponse = await response.json();
    console.log(parsedResponse);
    return res.json(parsedResponse);
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

// Starts server
app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
