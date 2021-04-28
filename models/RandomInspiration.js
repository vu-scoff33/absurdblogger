var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RandomInspirationSchema = new Schema({
    content: String,
    dateAdded: Date,
    author: String, 
})

//cb, ay man what do you want me to do with the async result, you have got yourself into the async holes
RandomInspirationSchema.statics.randomize = function(cb){
    this.countDocuments().exec((err, cnt) => {
        if (cnt !== 0)  {
            let random = Math.floor(Math.random() * cnt);
            this.findOne().skip(random).exec((err, randomDoc) => {
                cb(err, cnt, randomDoc) //get back to the outer world
            })
        }
        else
            cb(err, cnt, null)
        
    })
}

//randomize, either no counts or return 

const RandomInspiration = mongoose.model("RandomInspiration", RandomInspirationSchema)

module.exports = RandomInspiration;


