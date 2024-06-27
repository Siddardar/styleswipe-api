const express = require('express');
const mongoose = require('mongoose');

const Uniqlo = require("./modals/Uniqlo");
const UniqloMenTops = require("./modals/UniqloMenTops");
const UniqloWomenTops = require("./modals/UniqloWomenTops");

const Stripe = require('stripe');

const app = express();
app.use(express.json());

require('dotenv').config();
const databaseUrl = process.env.ATLAS_URL;
const stripeSecret = process.env.STRIPE_SECRET_KEY;

app.use((_, res, next) => {
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

//Clothing Routes Men
app.get("/getUniqlo", (_, res) => {
  Uniqlo.find()
    .then(clothesData => res.json(clothesData))
    .catch(err => console.log(err))
})

app.get("/Men/getUniqloTops", (_, res) => {
  UniqloMenTops.find()
    .then(clothesData => res.json(clothesData))
    .catch(err => console.log(err))
})


//Clothing Routes Women
app.get("/Women/getUniqloTops", (_, res) => {
  UniqloWomenTops.find()
    .then(clothesData => res.json(clothesData))
    .catch(err => console.log(err))
})



//Stripe Routes
app.post('/payment-sheet', async (req, res) => {
  const { totalPrice } = req.body;
  const amt = Math.round(parseFloat(totalPrice.substr(2)) * 100);

  

  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2024-04-10',
  });
  
  const customers = await stripe.customers.list();

  const customer = customers.data[0];
  //console.log(customer)

  if (!customer) {
    return res.send({
      error: 'No customer found',
    
    })
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2024-04-10'}
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amt,
    currency: 'sgd',
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  });
});




//Run Server
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

