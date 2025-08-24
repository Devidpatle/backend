require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connect = require('./db');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));

connect().then(() => {
  app.listen(process.env.PORT || 4000, () => console.log('API running'));
});
