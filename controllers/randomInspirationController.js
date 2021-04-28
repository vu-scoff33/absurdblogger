var express = require('express');
var mongoose = require('mongoose');

var RandomInspiration = require('../models/RandomInspiration');

exports.generate_inspiration = function(req, res){
    RandomInspiration.randomize((err, count, doc) => {
        if(err) console.log("Error occured in inspirationcontroller_generator: ", err);
        //console.log("randomizedDoc: ", doc)
        const context = {
            id: doc._id,
            content: doc.content,
            author: doc.author
        }
        res.render('landing_panel', {
            ...context,
            layout: 'admin_panel',
            helpers: {
                section: function(name, options){
                    if(!this._sections) this._sections = {}
                    this._sections[name] = options.fn(this);
                    return null;
                    
                }
                //configure instance-level helper later, or how to export this as _helpers/utilities
            }
        });
    });
}

exports.add_quote = function(req, res){
    console.log("Client added blockquote request: ", req.body);
    //data format + data validation/sanitization to be added. 
    
    RandomInspiration.exists({content: req.body.quoteField}, (err, isExisted) => {
        if (isExisted){
            console.log("User added a quote already existing in database");
            res.send("Quote already existed");
        }
        else {
            new RandomInspiration({content: req.body.quoteField, author: req.body.authorField}).save((err) => {
                if (err)    console.log("Error occured during saving quote: ", err)
                else {
                    console.log("Saved")
                    res.redirect('/admin-panel'); //what a brainless move
                }

            })
        }
    })
}
exports.delete_quote = function(req, res){
    const quote_id = mongoose.Types.ObjectId(req.body.id);
    RandomInspiration.findByIdAndDelete(quote_id).exec((err) => {
        if(err){
            console.log(err);
            res.status(500).end();
        }
        else{
            console.log("Quote deleted. Gone for good");
            res.redirect('/admin-panel');
        }
    })
}

exports.update_quote = function(req, res){

}




//exec() as my customizable function?