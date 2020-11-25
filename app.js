var express = require('express');
var app = express();
app.set('port', process.env.PORT || 3000);

//set view engines + basic rendering 
app.set('view engine', 'pug');

var blockquotes = [
    "quote 1", 
    "quote 2", 
    "quote 3"
]
app.get('/', (req, res) => {
    var rand = Math.floor(Math.random() * blockquotes.length)
    res.render('index', {title: 'sample title', message: 'feed data dynamically into template', blockquote: blockquotes[rand]})
})

//navigate static resources, 
app.use(express.static(__dirname + '/public'));

//catch-all handlers
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
})
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
})

app.listen(app.get('port'));