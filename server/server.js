const express = require('express');
const mongoose = require('mongoose');
const UniqloModel = require("./modals/UniqloMenTops");
require('dotenv').config();
const databaseUrl = process.env.ATLAS_URL;

if (!databaseUrl) {
  console.error('Database URL is not defined. Please set ATLAS_URL in your .env file.');
  process.exit(1);
}

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

const uri = databaseUrl;
mongoose.connect(uri, {
    dbName: 'my_data',
});

//Routes
app.get("/getUniqloMenTops", (req, res) => {
    UniqloModel.find()
    .then(clothesData => res.json(clothesData))
    .catch(err => console.log(err))
})

const port = process.env.PORT || 5051;

app.listen(port, () => {
  console.log(`Server running`);
});

