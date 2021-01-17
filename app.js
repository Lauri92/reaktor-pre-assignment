'use strict';

const express = require('express');

// Package for providing a middleware that can be used to enable CORS  with various options
const cors = require('cors');

const productRoute = require('./routes/productRoute');

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static('./'));

app.use('/products', productRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`listening on ${PORT}`));