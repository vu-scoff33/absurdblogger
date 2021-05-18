const {nanoid} = require('nanoid')

var lobbies = [];

const baseCanvasWidth = 1600;
const baseCanvasHeight = 900;

class Lobby {
    players = [];
    drawingTime = 45;
    constructor(){
        this.id = nanoid(6);
        this.isStarted = false; // == locked? 
        this.drawerIndex = 0; //
    }

    addPlayer(socket, name){
        let player = new Player(socket, this.id, name)
        if(!this.players.length)
            player.ishost = true;
        this.players.push(player);
    }
    
    listen(IO){
        if(IO.listeners("connection").length){
            console.log("A connection handler already established on this namespace!")
            return;
        }
        IO.on("connection", (socket) => {
            //setting up on initial connection
            let name = socket.handshake.query.playername;
            console.log("new connection hooray ", name)
            socket.emit("initial-connection", {
                playerId: socket.id //utilize socket.io id
            })
            this.addPlayer(socket, name);
            
            this.handlePlayerConnections(IO, socket)
            this.handleDrawingEvents(IO, socket)
            this.handleMessageEvents(IO, socket)

        })
    }

    handlePlayerConnections(IO, socket){
        IO.emit("players-list", {
            players: this.players.map(player => ({
                name: player.name, 
                ishost: player.ishost,
                id: player.socket.id
            }))
            //players-list occur when there is a change in players 
        })

        socket.on('disconnect', () => {
            console.log('player disconnected')
            this.deletePlayer(socket)
            IO.emit("players-list", {
                players: this.players.map(player => ({
                    name: player.name,
                    ishost: player.ishost,
                    id: player.id
                }))
            })
        })
    }

    handleDrawingEvents(IO, socket){
        socket.on("canvas-data", (data) => {
            const {action, actionData} = data;
            socket.broadcast.emit("canvas-data", {
                action: action, 
                actionData: {
                    point: actionData.point,
                    colorIndex: actionData.colorIndex
                }
            })
        })
    }
    handleMessageEvents(IO, socket){
        socket.on("message", (data) => {
            IO.emit("message", { //###
                text: data.text,
                sender: this.getPlayer(socket).name
                //common message
            })
        })
    }
    //startgame
    getPlayer(socket){
        if(!this.players.length)    return false;
        for(let player of this.players)
            if(player.socket === socket)    
                return player;
        return false;
    }
    deletePlayer(socket){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].socket === socket){
                if(this.players.length > 1 && this.players[i].ishost)
                    this.players[i+1].ishost = true;
                this.players.splice(i, 1);
                break;
            }
        }
    }
}


class Player {
    ishost = false;
    constructor(socket, sessionId, name){
        this.socket = socket;
        this.sessionId = sessionId;
        this.name = name;
    }
}


module.exports = {
    Player, lobbies, Lobby
}


const cleaninguplobbies = (function(){
    setInterval(function(){
        console.log("Starting cleaning routine: ", lobbies)
        for(let i = 0; i < lobbies.length; i++){
            const lobby = lobbies[i];
            if(!lobby.players.length)
                lobbies.splice(i, 1);
        }
    }, 20000);
})();