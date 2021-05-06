const jwt = require('jsonwebtoken');
const Cookie = require('cookie');
const Mastermind = require('../models/Mastermind.js')

const punGen = require('./punGen/index')

//DECLARATION
var SOCKETAPP_Chat, socketIdentifier, activateChatBot;


//<MAIN>
module.exports = function(io){
    //all apps use the same channel
    var chatappNamespace = io.of('/wordsofwisdom');
    var maGameNamespace = io.of('/modernart');
    require('./modernart/index')(maGameNamespace);

    SOCKETAPP_Chat(chatappNamespace)
}
//</MAIN>


socketIdentifier = function(socket, next){
    //socket: having cookie? having access - token cookie?  else nought
    if(socket.handshake.headers.cookie){
        var cookies = Cookie.parse(socket.handshake.headers.cookie);
        if(cookies.ACCESS_TOKEN){
            const abitraryToken = cookies.ACCESS_TOKEN;
            //socket have cookie token --> move to authorization gate
            jwt.verify(abitraryToken, process.env.JWT_secret, (err, decoced) => {
                if(err) next(); // role = wisdomseeker
                else {
                    socket.role = "wisdomgiver"; //the one and only, unscalable yet
                    next();
                }
            })
        }
        else 
            next();
    }
    else
        next();
}


SOCKETAPP_Chat = async function(chatappNamespace){
    let adminId =  (await Mastermind.findOne({}).exec())._id;
    let adminConnections = 0;
    let interval;
    chatappNamespace.use(socketIdentifier);
    chatappNamespace.on("connection", (abitrarySocket) => {
        if(abitrarySocket.role == "wisdomgiver"){
            adminConnections++;
            var _adminSocket = abitrarySocket;
            _adminSocket.join(adminId)

            _adminSocket.on("new-admin-message", (data) => {
                const {from_to, message} = data;
                console.log(data);
                _adminSocket.to(from_to).emit('new-admin-message', {admin: 'codename', message: message})
                //$detect online initiator
            })

            if(adminConnections == 1)
                interval = setInterval(() => chatappNamespace.emit("admin-online"), 5000);
            _adminSocket.on('disconnect', (reason) => {
                console.log("Admin get disconnected: ", reason);
                adminConnections--;
                if(adminConnections == 0){
                    clearInterval(interval);
                    console.log("Admin offline")
                    chatappNamespace.emit('admin-offline');
                }
            })
        }
        else{
            var _clientSocket = abitrarySocket;
            _clientSocket.on("new-message", (data) => {
                console.log(data);
                const {user, message} = data;
                _clientSocket.to(adminId).emit('new-message', {
                    chatter: user,
                    from: _clientSocket.id,
                    message: message
                })
                //if(toggleBot?) $$$
                activateChatBot(message, _clientSocket.id, adminId, chatappNamespace)
            })
        }
    })
}


activateChatBot = function(message, clientId, adminId, IO){
    let query = punGen(message);
    let response = query.isValid ? query.results[Math.floor(Math.random() * query.results.length)] : query.reason;
    IO.to(clientId).emit('new-admin-message', {message: response});
    IO.to(adminId).emit('new-message', {from: clientId, message: response})
}