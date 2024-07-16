const mongoose = require("mongoose")

const ZaraSchema = mongoose.Schema({}, {collection: 'zara_men_tops'});

const ZaraMenTops = mongoose.model("ZaraMenTops", ZaraSchema);
module.exports = ZaraMenTops;