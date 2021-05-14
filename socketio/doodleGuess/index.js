function main(IO){
    var GameroomsController = [
        //room[12123]: {clients, gamedata}
    ]
    IO.on('connection', (socket) => {
        console.log("socket connected");
        socket.on('join', (data) => {
            const {roomId, name} = data;
            socket.roomId = roomId; //one room only
            socket.join(roomId);
            socket.name = name;
            if(!GameroomsController[roomId])
                GameroomsController[roomId] = {clients: []}
            GameroomsController[roomId].clients.push(socket);
            IO.to(roomId).emit('user-joined', {
                //$$here is a great chance to ruminate about the why. Should I send in parts or whole / can clients assemble on their own
                //-are they all in sync to receive all necessary data to be able to construct the whole on their own? 
                users_list: GameroomsController[roomId].clients.map(socket => socket.name)
            })
        })
        socket.on('text', (data) => {
            let {text, sender = socket.name} = data; //$do clients each need to know themselves?
            IO.to(socket.roomId).emit('text', {
                text: text,
                sender: sender
            })
        })
        socket.on('canvas-data', (data) => {
            let {base64} = data; 
            socket.to(socket.roomId).emit('canvas-data', {
                base64: base64
            })
        })
        socket.on('disconnect', () => {
            console.log("Socket disconnect")
            IO.to(socket.roomId).emit("user-left", {name: socket.name});
            if(!GameroomsController[socket.roomId])  
            {
                console.log("Falsy pushing step or application memory reset")
                return;
            }
            GameroomsController[socket.roomId].clients.forEach((client, index) => {
                if(client === socket)
                    GameroomsController[socket.roomId].clients.splice(index, 1);
            });
            if(GameroomsController[socket.roomId].clients.length == 0)  console.log("No one in room " + socket.roomId + ", logical handler later.")
        })
    })
}



module.exports = main;