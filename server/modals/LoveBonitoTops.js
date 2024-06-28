const mongoose = require("mongoose")

const LoveBonitoSchema = mongoose.Schema({}, {collection: 'lovebonito_women_tops'});

const LoveBonitoWomenTops = mongoose.model("LoveBonitoWomenTops", LoveBonitoSchema);
module.exports = LoveBonitoWomenTops;