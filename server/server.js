const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

//Uniqlo Modals
const UniqloMenTops = require("./modals/UniqloMenTops");
const UniqloWomenTops = require("./modals/UniqloWomenTops");

//LoveBonito Modals
const LoveBonitoWomenTops = require("./modals/LoveBonitoTops");

//Zara Modals
const ZaraWomenTops = require("./modals/ZaraWomenTops");
const ZaraMenTops = require("./modals/ZaraMenTops");

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

const brandConnection = mongoose.createConnection(uri, 
  {
    dbName: 'brand_data',
  }
); 

const BrandsMen = brandConnection
                  .model('BrandsMen', 
                    new mongoose.Schema({}, 
                      {collection: 'brands_men'}));

//Brands Routes
app.get("/getBrandsMen", (_, res) => {
  
  BrandsMen.find()
    .then(brandsData => res.json(brandsData))
    .catch(err => console.log(err))
})

const BrandsWomen = brandConnection
                  .model('BrandsWomen', 
                    new mongoose.Schema({}, 
                      {collection: 'brands_women'}));

app.get("/getBrandsWomen", (_, res) => {
  BrandsWomen.find()
    .then(brandsData => res.json(brandsData))
    .catch(err => console.log(err))
})

//Clothing Routes Men
app.get("/Men/getUniqloTops", (_, res) => {
  UniqloMenTops.find()
    .then(clothesData => res.json(clothesData))
    .catch(err => console.log(err))
})
app.get("/Men/getZaraTops", (_, res) => {
  ZaraMenTops.find()
    .then(clothesData => res.json(clothesData))
    .catch(err => console.log(err))
})


//Clothing Routes Women
app.get("/Women/getUniqloTops", (_, res) => {
  UniqloWomenTops.find()
    .then(clothesData => res.json(clothesData))
    .catch(err => console.log(err))
})

app.get("/Women/getLoveBonitoTops", (_, res) => {
  LoveBonitoWomenTops.find()
    .then(clothesData => res.json(clothesData))
    .catch(err => console.log(err))
})

app.get("/Women/getZaraTops", (_, res) => {
  ZaraWomenTops.find()
    .then(clothesData => res.json(clothesData))
    .catch(err => console.log(err))
})

//Create Stack Men
app.post('/Men/getStack', async (req, res) => {
  const { brands, seen } = req.body;

  let stack = []; 

  for (let brand of brands) {
    const url = `${req.protocol}://${req.hostname}/Men/get${brand}Tops`;
    //const url = `https://styleswipe.azurewebsites.net/Men/get${brand}Tops`;
    
    const response = await axios.get(url);
    for (let item of response.data[0]['clothes_data']) {
    
      if (item['name'] in seen) {
        //console.log('Item already seen: ' + brand + ' ' + item['name'])
        continue
    
      } else {
        stack.push(item);
      }
    }
    stack.push(...response.data[0]['clothes_data']);
  }

  for (let i = stack.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stack[i], stack[j]] = [stack[j], stack[i]];
  }

  const selectedItems = stack.slice(0, 20);

  res.json({ clothes_data: selectedItems });
});
  
//Create Stack Women 
app.post('/Women/getStack', async (req, res) => {

  const { brands, seen } = req.body;

  let stack = []; 
  
  for (let brand of brands) {
    const url = `${req.protocol}://${req.hostname}/Women/get${brand}Tops`;
    //const url = `https://styleswipe.azurewebsites.net/Women/get${brand}Tops`;
    
    const response = await axios.get(url);
    
    for (let item of response.data[0]['clothes_data']) {
    
      if (item['name'] in seen) {
        //console.log('Item already seen: ' + brand + ' ' + item['name'])
        continue
    
      } else {
        stack.push(item);
      }
    }
    stack.push(...response.data[0]['clothes_data']);
  }

  for (let i = stack.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stack[i], stack[j]] = [stack[j], stack[i]];
  }

  const selectedItems = stack.slice(0, 20);

  res.json({ clothes_data: selectedItems });
});
 
//Stripe Routes
app.post('/payment-sheet', async (req, res) => {
  const { totalPrice, customerEmail, customerName } = req.body;
  console.log(req.body)
  const amt = Math.round(parseFloat(totalPrice.substr(2)) * 100);

  

  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2024-04-10',
  });
  
  const stripeCustomers = await stripe.customers.list();

  var customer = stripeCustomers.data.find(i => i.email === customerEmail);
  
  if (customer === undefined) {
    //console.log('Creating new customer')
    customer = await stripe.customers.create({
      email: customerEmail,
      name: customerName,
    });
  } else {
    //console.log('Customer already exists') 
  }

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

