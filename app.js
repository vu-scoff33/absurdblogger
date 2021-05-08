var express = require('express');
var Handlebars = require('express-handlebars');
var mongoose = require('mongoose')
require('dotenv').config();


//testingFeatures for console //console testing
//require('./socketio/punGen/index');

var app = express();
app.set('port', process.env.PORT || 3000);
// //middlewares
var cookieParser = require('cookie-parser');
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser())

//set view engines + basic rendering 
app.set('views', './views');
var hbs = Handlebars.create({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'frontend',
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

//set database, mongoose
mongoose.connect(
    process.env.DBurl, 
    {useNewUrlParser: true, useUnifiedTopology: true}
    //mongoose Models are buffered til database connected, no need to await. 
)
const connection = mongoose.connection;
connection.on('connected', () => {
    console.log('Database Connection Successful!');
    require('./models/dataInit');
    //require('./models/Test.js');
})
connection.on('error', () => {
    console.log('Database Connection Error.')
})


//applications routes
var routes = require('./routes/configs.js');
app.use('/', routes);



const httpServer = app.listen(app.get('port'), () => {
    console.log(`Server starts on port ${app.get('port')}`);
}); 

var io = require('socket.io')(httpServer);
require('./socketio/index')(io);

