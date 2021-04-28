//$refactor url pattern by primaryPurpose 1)get & display to me /realm/sub-realm  (init GET)
//                              2) interact with db & api /realm/{model}/action, (mostly ajax)

var express = require('express');
const mongoose = require('mongoose')
var auth = require('../middlewares/auth');
var ruminationController = require("../controllers/ruminationController");


var router = express.Router();

router.use('/public', express.static('public'))
//serving all of tinymce
router.use('/tinymce', express.static('node_modules/tinymce'))
router.use('/pixijs', express.static('node_modules/pixi.js/dist/browser'))

//hompage or homepage controller?  $$refactor controllers
//router.get('/', ruminationController.Homepage)
router.get('/', (req, res) => res.send("hello there, faster innit"))
router.get('/ajax/ruminations', ruminationController.ajax_get)
router.post('/ajax/ruminations/comment', ruminationController.ajax_post_comment)

router.get('/anidlelife', (req, res) => {
    res.render('anidlelife.hbs', {
        layout: null
    })
})

router.get('/anidlelife/talk', (req, res) => {
    res.render('front_talk.hbs', {
        layout: null,
        helpers: {
            section: function(name, options){
                if(!this._sections)  this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    })
})

router.get('/anidlelife/modernart', (req, res) => {
    res.render('modernart.hbs', {
        layout: null,
    })
})

router.get('/covers/:id', ruminationController.get_cover);


//loggin
var loginController = require('../controllers/loginController')
router.get('/login', loginController.login_landingPage);
router.get('/logout', loginController.logout)

router.post('/authenticate', loginController.authenticate);

//admin-panel or backend
router.use('/admin', auth, express.static('admin'))
var randomInspirationController = require('../controllers/randomInspirationController');
router.use('/admin-panel', auth);

    //randomInspiration
router.get('/admin-panel', randomInspirationController.generate_inspiration);
router.post('/admin-panel/quote/add', randomInspirationController.add_quote); 
router.post('/admin-panel/quote/delete', randomInspirationController.delete_quote);
router.post('/admin-panel/quote/update', randomInspirationController.update_quote)

    //Rumination
router.get('/admin-panel/write', ruminationController.writing_panel);
router.get('/admin-panel/write/:id', ruminationController.editing_panel);

router.post('/admin-panel/rumination/write', ruminationController.dumb_ajax_create);
router.post('/admin-panel/rumination/delete', ruminationController.dumb_ajax_delete);
router.post('/admin-panel/rumination/update', ruminationController.dumb_ajax_update);

    //get collections 
router.get('/admin-panel/reflections', (req, res) => {
    //what other things to show? 
    res.redirect('/admin-panel/reflections/1')
    //page counts at one since Im not a robot
})
router.get('/admin-panel/reflections/:page', ruminationController.pagination);

var chatController = require('../controllers/chatController');
const { updateOne } = require('../models/Rumination');
router.get('/admin-panel/talks', chatController.get_chatbox);


module.exports = router;