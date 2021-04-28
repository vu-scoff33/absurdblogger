const jwt = require('jsonwebtoken');
const Cookie = require('cookie');

const punGen = require('./punGen/index')

module.exports = function(io){
    //all apps use a same channel
    var chatappNamespace = io.of('/wordsofwisdom');
    var maGameNamespace = io.of('/modernart');
    require('./modernart/index')(maGameNamespace);

    var isAdminOnline = null;
    chatappNamespace.use(socketIdentifier);
    chatappNamespace.on("connection", (abitrarySocket) => {
        if(abitrarySocket.role == "wisdomgiver"){
            isAdminOnline = abitrarySocket.id;
            console.log("We got our Savior connected");
            var _adminSocket = abitrarySocket;
            _adminSocket.on("new-admin-message", (data) => {
                const {from_to, message} = data;
                console.log(data);
                _adminSocket.to(from_to).emit('new-admin-message', {admin: 'codename', message: message})
                //i also need to know if the user is still online to receive it
            })
        }
        else{
            var _clientSocket = abitrarySocket;
            _clientSocket.on("new-message", (data, fn) => {
                console.log(data);
                const {user, message} = data;
                if(isAdminOnline === null){
                    //chatbot
                    fn("Admin is not yet online. In the meantime, you can toy around with his clone, of which wisdom is not any less inferior");
                    
                    //prompt user to the chatbot UI, what is the appropriate UI? It will be awkward to stick 
                    //to the 'generic' one
                    //random 2 algo
                    let query = punGen(message);
                    console.log(query)
                    if(!query.isValid)    
                        chatappNamespace.to(_clientSocket.id).emit('new-admin-message', {admin: 'chatbot', message: query.reason})
                    else{
                        const results = query.results;
                        let ret = results[Math.floor(Math.random() * results.length)];
                        chatappNamespace.to(_clientSocket.id).emit('new-admin-message', {admin: 'chatbot', message: ret})
                    }
                }
                
                else {
                    _clientSocket.to(isAdminOnline).emit("new-message", {
                        chatter: user,
                        from: _clientSocket.id,
                        message: message
                    })
                }
                
            })
        }
    })
}


var socketIdentifier = function(socket, next){
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

var socketAuth = function(socket, next){
    if(socket.handshake.headers.cookie){ //check if exists first or else resulting in syntax error
        var cookies = Cookie.parse(socket.handshake.headers.cookie)
        const authToken = cookies.ACCESS_TOKEN;
        jwt.verify(authToken, process.env.JWT_secret, (err, decoded) => {
            if(err) next(new Error("Unauthorized"))
            else {
                next()
            }
        })
    }
    else next(new Error("No Header Credentials."))
}

//this is still implementing the chat application
//modularize by namespace
