function main(maGameNamespace){
    maGameNamespace.on('connection', (socket) => {
        //here modularize by events handlers
        console.log("Another socket connected: ", socket.id);
        
        socket.on('moving', data => {
            const {x, y, index} = data;
            console.log("Coin gets dragged: ", x + " " + y + " " + index)
            maGameNamespace.emit('be-moved', {
                x: x,
                y: y, 
                index: index
            })
        })
    })
}
//am I gonna grant all these resources the whole namespace? 
//a Database storing all players


//identify admin? 


module.exports = main;