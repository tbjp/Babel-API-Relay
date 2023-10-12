//These import necessary modules and set some initial variables
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

// Rate limiting - Goodreads limits to 1/sec, so we should too

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);
const authKey = process.env.REACT_APP_AZURE;
const location = 'japaneast';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 1 second
  max: 5, // limit each IP to 1 requests per windowMs
});

//  apply to all requests
app.use(limiter);

//app.options('*', cors());

// Routes

// Test route, visit localhost:3000 to confirm it's working
// should show 'Hello World!' in the browser
app.get('/', (req, res) => {
  console.log('Naked / accessed.');
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

// This spins up our sever and generates logs for us to use.
// Any console.log statements you use in node for debugging will show up in your
// terminal, not in the browser console!
app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
