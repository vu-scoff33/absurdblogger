const express = require('express');
const path = require('path')
let {lobbies, Lobby} = require('./GameData')

module.exports = function(IO){
    var router = express.Router();

    router.use(express.static(path.join(__dirname, 'frontend')))
    router.get('/', function(req, res){
        res.sendFile('index.html', {root: path.join(__dirname, 'frontend')})
    })
    router.post('/create', function(req, res){
        let lobby = new Lobby();
        lobbies.push(lobby);
        console.log(lobbies)
        res.redirect(`/anidlelife/doodleguess/${lobby.id}`);
    })

    router.get('/:lobbyId', (req, res) => {
        const lobbyId = req.params.lobbyId;
        let lobby = findLobby(lobbyId);
        if(!lobby){
            res.json({success: false})
        }
        else{
            res.sendFile('lobby.html', {root: path.join(__dirname, "frontend")})
            //separate page, //redirect
            lobby.listen(IO.of(`/doodleguess/${lobbyId}`))
        }
    })
    return router;
}

function findLobby(id){
    for(let lobby of lobbies){
        if(lobby.id === id)
            return lobby;
    }
    return false;
}