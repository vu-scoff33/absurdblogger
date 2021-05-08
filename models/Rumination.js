var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RuminationSchema = new Schema({
    title: String, 
    content: String,  //html 
    description: String, 
    meta: {
        author: String, //ref
        createdAt: Date,
    },
    comments: [{
        signature: String,
        comment: String, 
    }],
    tags: [String], //ref
    cover: {
        id: Schema.Types.ObjectId,
        name: String
    }
})

RuminationSchema.statics.clearAll = function(){
    this.deleteMany({}, (err) => {
        console.log("Rumination Database Purified");
    });
}
RuminationSchema.virtual('tags_stringified').get(function(){
    var buildupString = "";
    buildupString += this.tags[0];
    for(let i = 1; i < this.tags.length; i++)
        buildupString +=   `, ${this.tags[i]}`
    return buildupString;
})
RuminationSchema.virtual('localeDate').get(function(){
    return this.meta.createdAt.toLocaleDateString('en-US', {timeZone: "Asia/Jakarta", year: 'numeric', month: 'short', weekday: 'short', day: '2-digit'})
})
RuminationSchema.statics.checkValidReferenceCover = function(refId){
    return new Promise( (resolve, reject) => {
        let isRefExisted = mongoose.connection.db.collection('covers.files').findOne({_id: refId})
                        .then(file => {
                            if(!file)   resolve(false);
                            else resolve(true)
                        }).catch(err => reject(err))
    })
}
RuminationSchema.statics.randomize = function(volume, cb){
    Rumination.countDocuments().exec((err, count) => {
        if(!err){
            //MAX VOL = 5;
            if (volume > count){
                let err = new Error("Query's Volumes larger than Pool");
                cb(err);
                //$refactor return all docs 
                return;
            }
            let rands = [], docs = [];
            let _vol = volume;
            while(_vol > 0){
                let rand = Math.floor(Math.random() * count);
                if(rands.indexOf(rand) == -1){
                    rands.push(rand);
                    _vol--;
                }
            }
            rands.forEach(r => {
                Rumination.findOne().skip(r).exec((err, doc) => {
                    docs.push(doc);
                    if(docs.length == volume)
                        return cb(null, docs)
                })
            })
        }
    })
}

var Rumination = mongoose.model("Rumination", RuminationSchema);

module.exports = Rumination; 