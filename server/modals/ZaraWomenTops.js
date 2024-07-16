const mongoose = require("mongoose")

const ZaraSchema = mongoose.Schema({}, {collection: 'zara_women_tops'});

const ZaraWomenTops = mongoose.model("ZaraWomenTops", ZaraSchema);
module.exports = ZaraWomenTops;