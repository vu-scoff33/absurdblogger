var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MastermindSchema = new Schema({
    username: String,
    hashedPassword: String,
    role: String
})

const Mastermind = mongoose.model("Mastermind", MastermindSchema);

module.exports = Mastermind;

