var express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Mastermind = require('../models/Mastermind.js')

exports.login_landingPage = function(req, res){
    res.render('admin_login', {layout: null})
}

exports.authenticate = function(req, res){
    var userCredentials = req.body;
    console.log("Route Authenticate Handler: to see the sent credentials", userCredentials);
    Mastermind.findOne({username: userCredentials.username}, (err, foundUsername) => {
        if (!err && foundUsername){
            bcrypt.compare(userCredentials.password, foundUsername.hashedPassword, (err, isMatched) => {
                if(!err && isMatched)  {
                    const token = jwt.sign({username: foundUsername.username}, process.env.JWT_secret);
                    console.log(token)
                    res.status(201).cookie('ACCESS_TOKEN', token, {httpOnly: true, expiresIn: '1h'})
                        .redirect(302, '/admin-panel');
                }
                else 
                    {
                        console.log("wrong password");
                        res.status(401).send("Unauthenticated");
                    }
            })
        }
        else res.status(401).send();
        //redirect & client-handler for status
    })
}

exports.logout = function (req, res){
    console.log("Logging out...")
    res.clearCookie('ACCESS_TOKEN').redirect("/login");
}
 