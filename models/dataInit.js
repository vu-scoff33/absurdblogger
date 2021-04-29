var RandomInspiration = require('./RandomInspiration.js');
var Rumination = require('./Rumination')
var Mastermind = require('./Mastermind');
const bcrypt = require('bcrypt');
const saltrounds = 10; //wtf 

//the purpose of this is to avoid empty database exception

RandomInspiration.find(function(err, results){
    if(results.length)  return;
    //dig deeper to the heart/philosophy of this syntax
    //of (mongoose), or (nodejs), or (js), or (oop)
    
    new RandomInspiration ({
        content: "The unexamined life is not worth living.",
        author: "Socrates"
    }).save();
    new RandomInspiration({
        content: "The life of a man (in a state of nature) is solitary, poor, nasty, brutish, and short",
        author: "Thomas Hobbes"
    }).save();
    new RandomInspiration({
        content: "I think therefore I am.",
        author: "Rene Descartes"
    }).save();
    new RandomInspiration({
        content: "He who thinks great thoughts, often makes great errors.",
        author: "Martin Heidegger"
    }).save();
    new RandomInspiration({
        content: "To be is to be perceived.",
        author: "Bishop George Berkeley"
    }).save();
})


Mastermind.find((err, results) => {
    if(results.length) {
       return;
    }
    
    const admin_username = "lnvulture";
    const admin_password = "iamworthy";
    //this is my secret only, unless you're my inteviewer, you got a pass. (though this is extremely unprofessional)
    const admin_role = "Mastermind"
    bcrypt.hash(admin_password, saltrounds, (err, hash) => {
        new Mastermind({
            username: admin_username,
            hashedPassword: hash,
            role: admin_role
        }).save((err) => {
            if(err) console.log(err)
        });
    })
})

Rumination.find( (err, results) => {
    if(results.length)
        return;
    
    new Rumination({
        title: "Seed Data 1",
        content: "Seed data 1 body"
    }).save();
    new Rumination({
        title: "Seed data 2",
        content: "Seed data 2 body"
    }).save();
    new Rumination({
        title: "Seed data 3",
        content: "Seed data 3 body"
    }).save();
    new Rumination({
        title: "Seed data 4",
        content: "Seed data 4 body"
    }).save();
    new Rumination({
        title: "Seed data 5",
        content: "Seed data 5 body"
    }).save()
})


