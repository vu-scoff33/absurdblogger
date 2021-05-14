const DOODLEme = function(Canvas, options){
    //INIT & Prepare
    const {width, height, colorsList, lineWidth = 4, ceaseControl} = options;
    Canvas.width = width;
    Canvas.height = height;
    Canvas.colorsList = colorsList;
    Canvas.style.cursor = 'crosshair';
    Canvas.states = {
        pen: 'stroke' || 'fill',
        colorIndex: 0
    }
    let Ctx = Canvas.getContext('2d');
    Canvas.Ctx = Ctx
    Ctx.lineWidth = lineWidth;
    Ctx.fillStyle = "white";
    Ctx.fillRect(0, 0, Canvas.width, Canvas.height);

    //Exposed
    Canvas.setStates = function(states){
        const {pen = null, colorIndex = null} = states;
        Canvas.states = {
            pen: pen !== null ? pen : Canvas.states.pen,
            colorIndex: colorIndex !== null ? colorIndex : Canvas.states.colorIndex
        }
        //on user set states
        switch (pen){
            case 'stroke':
                Canvas.style.cursor = 'crosshair';
                break;
            case 'fill': 
                Canvas.style.cursor = "url(bucket.cur), auto";
                break;
        }
    }
    
    Canvas.clear = function(){
        Ctx.fillStyle = "white";
        Ctx.fillRect(0, 0, Canvas.width, Canvas.height)
    }
    document.addEventListener('mouseup', (event) => {
        if(event.target !== Canvas && Canvas.pendown){
            Canvas.dispatchEvent(new Event('mouseupoutside', {bubbles: false}));
        }
    })

    //bind Events
    if(!ceaseControl){
        Canvas.addEventListener('mousedown', function(event){
            switch (Canvas.states.pen){
                case "stroke": 
                    DRAW.begin(Canvas, Ctx, {x: event.offsetX, y: event.offsetY});
                    break;
                case "fill": 
                    ScanFill({x: event.offsetX, y: event.offsetY}, Canvas, Ctx);
                    break;
            }
        })
        Canvas.addEventListener('mousemove', function(event){
            DRAW.drawing(Canvas, Ctx, {x: event.offsetX, y: event.offsetY})
        })
        Canvas.addEventListener('mouseup', function(event){
            DRAW.end(Canvas, Ctx);
        })
        Canvas.addEventListener('mouseupoutside', function(event){
            DRAW.end(Canvas, Ctx)
        })
    }
}

const DRAW = {
    begin: function(canvas, ctx, Point){
        canvas.pendown = true;
        ctx.strokeStyle = toRgba(canvas.colorsList[canvas.states.colorIndex])

        ctx.beginPath();
        ctx.moveTo(Point.x - 1, Point.y);
        ctx.lineTo(Point.x, Point.y);
        ctx.stroke();
    },
    drawing: function(canvas, ctx, Point){
        if(canvas.pendown){
            ctx.lineTo(Point.x, Point.y);
            ctx.stroke();
        }
    },
    end: function(canvas, ctx){
        canvas.pendown = false;
        ctx.closePath();
    }
}



//Point = {x, y}; Color = [r, g, b, a]; 


const ScanFill = function(Point, Canvas, Ctx){
    //$need further optimization
    const fillColor = Canvas.colorsList[Canvas.states.colorIndex]
    let imageData = Ctx.getImageData(0, 0, Canvas.width, Canvas.height);
    let data = imageData.data;
    let seedX = Point.x, seedY = Point.y;
    const targetColor = getPixel(Point, Canvas.width, data).color;
    const W = Canvas.width
    if(isColorEqual(targetColor, fillColor))    return;

    let stack = [];
    stack.push({x: seedX, y: seedY})
    while(stack.length > 0){
        let node = stack.pop();
        let lx = node.x - 1;
        rx = node.x;
        while(lx >= 0 && isColorEqual(targetColor, getPixel({x: lx, y: node.y}, W, data).color)){
            setPixelColor({x: lx, y: node.y}, fillColor, W, data);
            lx--;
        }
        lx++;
        while(rx <= W && isColorEqual(targetColor, getPixel({x: rx, y: node.y}, W, data).color)){
            setPixelColor({x: rx, y: node.y}, fillColor, W, data);
            rx++;
        }
        rx--

        //scanning
        for(let i = lx; i <= rx; i++){
            if(isColorEqual(targetColor, getPixel({x: i, y: node.y - 1}, W, data).color))
                stack.push({x: i, y: node.y - 1});
            if(isColorEqual(targetColor, getPixel({x: i, y: node.y + 1}, W, data).color))
                stack.push({x: i, y: node.y + 1});
        }
    }
    Ctx.putImageData(imageData, 0, 0);
}


//utility functions
const isColorEqual = function(Color_1, Color_2) {
    for(let i = 0; i < 4; i++){
        if(Color_1[i] != Color_2[i])
            return false;
    }
    return true;
}
const getPixel = function(Point, width, Data){
    const {x, y} = Point;
    redIndex = y * width * 4 + x * 4;
    return {
        indexes: [redIndex, redIndex + 1, redIndex + 2, redIndex + 3],
        color: [Data[redIndex], Data[redIndex + 1], Data[redIndex + 2], Data[redIndex + 3]]
    }
}
const setPixelColor = function(Point, Color, width, Data){
    const {indexes} = getPixel(Point, width, Data);
    for(let i = 0; i < 4; i++)
        Data[indexes[i]] = Color[i];
}


function toRgba(color){
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
}