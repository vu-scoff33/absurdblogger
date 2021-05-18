function enterLobby(name){
    let lobbyId = window.location.pathname.replace(/\/anidlelife\/doodleguess\//, "")
    const socket = io(`/doodleguess/${lobbyId}`, {query: {playername: name}})

    const BASE_W = 1600;
    const BASE_H = 900;
    const RATIO = BASE_W / BASE_H;
    let playersBox = document.getElementById('players-box');
    let chatBox = document.getElementById('chat-box');
    let messages = chatBox.querySelector('.messages')
    let toolsBox = document.getElementById('tools-box');
    let canvasWrapper = document.getElementById('canvas-wrapper');
    let canvas = canvasWrapper.querySelector('canvas');
    let doodle = DOODLEme(canvas, {
        width: canvasWrapper.clientHeight * RATIO,
        height: canvasWrapper.clientHeight,
        colorsList: COLORS
    })
    const SCALE = canvas.width / BASE_W;
    let myId, ishost;

    COLORS.forEach((color, index) => {
        let colorButton = document.createElement('button');
        colorButton.style.backgroundColor = toRgba(color);
        colorButton.classList.add('color-button');
        colorButton.setAttribute("id", index)
        if(index === 0) colorButton.classList.add("picked")
        toolsBox.append(colorButton)
    })
    var clearButton = document.createElement('button');
    var bucketButton = document.createElement('button');
    clearButton.classList.add('pen-button');
    clearButton.textContent = "Clear";
    bucketButton.classList.add('pen-button');
    bucketButton.textContent = "Bucket";
    toolsBox.append(bucketButton);
    toolsBox.append(clearButton)
    
    toolsBox.onclick = function(event){
        if(event.target.classList.contains("color-button")){
            this.querySelectorAll(".color-button").forEach(button => button.classList.remove('picked'));
            event.target.classList.add('picked');
            let colorIndex = event.target.getAttribute("id");
            doodle.setStates({
                colorIndex: colorIndex
            })
        }
    }
    clearButton.onclick = function(event){
        doodle.DRAW.clear(true);
    }
    bucketButton.onclick = function(event){
        doodle.setStates({
            pen: doodle.states.pen === "fill" ? "stroke" : "fill"
        })
        this.classList.toggle("picked")
    }

    chatBox.querySelector('input').onkeydown = function(event){
        if(event.code === "Enter"){
            socket.emit('message', {
                text: this.value.trim()
            })
            this.value = ""
        }
    }

    canvas.addEventListener('tip', (event) => {
        socket.emit('canvas-data', {
            action: 'tip',
            actionData: {
                colorIndex: event.colorIndex,
                point: translateToBase(event.point)
            }
        })
    })
    canvas.addEventListener('line', (event) => {
        socket.emit('canvas-data', {
            action: 'line',
            actionData: {
                colorIndex: event.colorIndex,
                point: translateToBase(event.point)
            }
        })
    })
    canvas.addEventListener('fill', (event) => {
        socket.emit('canvas-data', {
            action: 'fill',
            actionData: {
                colorIndex: event.colorIndex,
                point: translateToBase({
                    x: event.point.x,
                    y: event.point.y
                })
            }
        })
    })
    canvas.addEventListener('clear', (event) => {
        socket.emit('canvas-data', {
            action: 'clear',
            actionData: {
                colorIndex: null,
                point: null
            }
        })
    })
    socket.on("initial-connection", (data) => myId = data.playerId) //$$to-do: store on cookies
    socket.on('players-list', (data) => {
        const {players} = data;
        playersBox.innerHTML = "";
        players.forEach(player => {
            let playerBox = document.createElement('div');
            playerBox.textContent = player.name;
            playerBox.classList.add('player-box');
            if(player.ishost){
                playerBox.textContent = player.name + " (host)"
                if(myId === player.id)   
                    ishost = true;
            }
            playersBox.append(playerBox)
        });
    })
    socket.on("message", (data) => {
        let {sender, text} = data;
        appendText(sender, text)
    })
    socket.on("canvas-data", (data) => {
        console.log("am i listening")
        let {action, actionData} = data;
        switch (action){
            case "tip": 
                doodle.setStates({colorIndex: actionData.colorIndex});
                doodle.DRAW.tip(translateFromBase(actionData.point), false);
                break;
            case "line":
                doodle.setStates({colorIndex: actionData.colorIndex});
                doodle.DRAW.line(translateFromBase(actionData.point), false);
                break;
            case "fill": 
                doodle.setStates({colorIndex: actionData.colorIndex});
                doodle.DRAW.scanfill(translateFromBase(actionData.point), false);
                break;
            case "clear": 
                doodle.DRAW.clear(false);
                break;
        }
    })
    



    function appendText(sender, text){
        let div = document.createElement('div');
        div.innerHTML = `<b>${sender}:</b> ${text}`;
        messages.append(div)
    }
    function translateToBase(point){
        //scale to standard ratio 
        let {x, y} = point;
        return {
            x: Math.round(x / SCALE),
            y: Math.round(y / SCALE) 
        }
        //$@@@ why is transmitting floats to server so damn slow
        //to-read   http://buildnewgames.com/optimizing-websockets-bandwidth/
        //note: firefox is also incredibly faster than chrome even in case of float-data
    }
    function translateFromBase(point){
        let {x, y} = point;
        return {
            x: x * SCALE, 
            y: y * SCALE
        }
    }
}

