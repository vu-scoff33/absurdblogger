//TYPEDef: color = [r, g, b, a]  Point = {x, y}

const cursorstyleMappers = {
    'disabled': 'auto',
    'stroke': 'crosshair',
    'fill': 'url(bucket.cur), auto'
}

const DOODLEme = function(canvas, options){
    if(!canvas || !(canvas instanceof HTMLCanvasElement))
        canvas = document.createElement('canvas');
    const requireOptions = (function(){
        ['width', 'height', 'colorsList'].forEach(parameter => {
            if(!options[parameter])
                throw new Error("Error: " + parameter + " is required.")
        })
    })();
    let {width, height, colorsList, lineWidth = 2, interactive = true} = options;
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    //init state
    const UIstates = {
        pen: interactive ? 'stroke' : 'disabled',
        colorIndex: 0,
        //$@@should canvas store penstate?
    }
    function setUIStates(newstates){
        //update UI with as to the canvas' changing states
        const {pen = UIstates.pen, colorIndex = UIstates.colorIndex} = newstates;
        //validate
        if(Object.keys(cursorstyleMappers).indexOf(pen) === -1)  
            throw new Error("Available states consist only of 'stroke', 'fill', 'disabled'")
        if(colorIndex > colorsList.length)
            colorIndex = colorsList.length;
        
        UIstates.pen = pen;
        UIstates.colorIndex = colorIndex;
        UTILS.setCursor(UIstates.pen);
    }
    const UTILS = {
        isColorEqual: function(color_1, color_2){
            for(let i = 0; i < 4; i++){
                if(color_1[i] != color_2[i])
                    return false;
            }
            return true;
        },
        getPixel: function(Point, Data){
            const w = canvas.width;
            const {x, y} = Point;
            redIndex = y * w * 4 + x * 4;
            return {
                indexes: [redIndex, redIndex + 1, redIndex + 2, redIndex + 3],
                color: [Data[redIndex], Data[redIndex + 1], Data[redIndex + 2], Data[redIndex + 3]]
            }
        }, 
        setPixelColor: function(Point, Color, Data){
            let {indexes} = UTILS.getPixel(Point, Data);
            for(i = 0; i < 4; i++){
                Data[indexes[i]] = Color[i];
            }
        },
        setCursor: function(penstate){
            canvas.style.cursor = cursorstyleMappers[penstate];
        }
    }
    const DRAW = {
        penEvents: {
            'tip': new Event('tip', {bubbles: false}),
            'line': new Event('line', {bubbles: false}),
            'fill': new Event('fill', {bubbles: false})
        },
        tip: function(Point, captureEvents){
            const {x, y} = Point;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.fillStyle = toRgba(colorsList[UIstates.colorIndex]);
            ctx.fillRect(x - Math.floor(lineWidth / 2), y - Math.floor(lineWidth / 2), lineWidth, lineWidth)

            if(captureEvents){
                this.penEvents['tip'].colorIndex = UIstates.colorIndex;
                this.penEvents['tip'].point = Point;
                canvas.dispatchEvent(this.penEvents['tip'])
            }
        },
        line: function(Point, captureEvents){
            const {x, y} = Point;
            ctx.strokeStyle = toRgba(colorsList[UIstates.colorIndex])
            ctx.lineTo(x, y);
            ctx.stroke();

            if(captureEvents){
                this.penEvents['line'].colorIndex = UIstates.colorIndex;
                this.penEvents['line'].point = Point;
                canvas.dispatchEvent(this.penEvents['line'])
            }
        },
        scanfill: function(Point, captureEvents){
            const fillColor = colorsList[UIstates.colorIndex];
            let imageData = ctx.getImageData(0, 0, width, height);
            let data = imageData.data;
            let seedX = Math.round(Point.x), seedY = Math.round(Point.y); //rounding is important for multi-scale canvas
            let targetColor = UTILS.getPixel({x: seedX, y: seedY}, data).color;
            if(UTILS.isColorEqual(fillColor, targetColor)) 
                return;
            
            let stack = [];
            let parentLx = -1, parentRx = width + 1, parentY = -10;
            stack.push({x: seedX, y: seedY});
            while(stack.length > 0){
                let node = stack.pop();
                let lx = node.x - 1;
                rx = node.x;
                while(lx >= 0 && UTILS.isColorEqual(targetColor, UTILS.getPixel({x: lx, y: node.y}, data).color)){
                    UTILS.setPixelColor({x: lx, y: node.y}, fillColor, data);
                    lx--;
                }
                lx++; //inclusive
                while(rx < width && UTILS.isColorEqual(targetColor, UTILS.getPixel({x: rx, y: node.y}, data).color)){
                    UTILS.setPixelColor({x: rx, y: node.y}, fillColor, data);
                    rx++;
                }
                rx--;

                //optimized scanning using parentRef
                if(parentY == node.y + 1 && lx >= parentLx && rx <= parentRx){
                    //parent referenced from below
                    let above = node.y - 1;
                    if(above >= 0){
                        for(let i = lx; i <= rx; i++){
                            if(UTILS.isColorEqual(targetColor, UTILS.getPixel({x: i, y: above}, data).color))
                                stack.push({x: i, y: above})
                        }
                    }
                }
                else if(parentY == node.y - 1 && lx >= parentLx && rx <= parentRx){
                    let below = node.y + 1;
                    if(below < height){
                        for(let i = lx; i <= rx; i++){
                            if(UTILS.isColorEqual(targetColor, UTILS.getPixel({x: i, y: below}, data).color))
                                stack.push({x: i, y: below});
                        }
                    }
                }
                else{
                    let below = node.y + 1, above = node.y - 1;
                    if(below < height && above >= 0){
                        for(let i = lx; i <= rx; i++){
                            if(UTILS.isColorEqual(targetColor, UTILS.getPixel({x: i, y: below}, data).color))
                                 stack.push({x: i, y: below})
                        }
                        
                        for(let i = lx; i <= rx; i++){
                            if(UTILS.isColorEqual(targetColor, UTILS.getPixel({x: i, y: above}, data).color))
                                stack.push({x: i, y: above});
                        }
                    }
                }
                parentLx = lx; 
                parentRx = rx;
                parentY = node.y;
            }

            ctx.putImageData(imageData, 0, 0);
            //##only emit events after synchronous expensive operation
            if(captureEvents){
                this.penEvents['fill'].colorIndex = UIstates.colorIndex;
                this.penEvents['fill'].point = Point;
                canvas.dispatchEvent(this.penEvents['fill'])
            }
        }, 
        clear: function(captureEvents){
            if(captureEvents)
                canvas.dispatchEvent(new Event("clear", {bubbles: false}))
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height)
        }
    }
    function enableInteractivity(){
        interactive = true;
        setUIStates({
            pen: "stroke"
        })
    }
    function disableInteractivity(){
        interactive = false;
        setUIStates({
            pen: "disabled"
        });
        removeEvents();
    }
    
    //CREATE & BIND EVENTS
    document.addEventListener('mouseup', (event) => {
        if(event.target !== canvas && canvas.isdrawing)
            canvas.dispatchEvent(new Event('mouseupoutside', {bubbles: false}));
    })
    const EVENTS_HANDLERS = {
        'mousedown': (event) => {},
        'mousemove': (event) => {},
        'mouseup': (event) => {},
        'mouseupoutside': (event) => {}
    }
    function registerEvents(){
        EVENTS_HANDLERS['mousedown'] = function(event){
            switch (UIstates.pen){
                case 'stroke': 
                    canvas.isdrawing = true;
                    DRAW.tip({x: event.offsetX, y: event.offsetY}, true);
                    break;
                case 'fill': 
                    DRAW.scanfill({x: event.offsetX, y: event.offsetY}, true);
                    break;
            }
        }
        EVENTS_HANDLERS['mousemove'] = function(event){
            if(canvas.isdrawing){
                DRAW.line({x: event.offsetX, y: event.offsetY}, true);
            }
        }
        EVENTS_HANDLERS['mouseup'] = EVENTS_HANDLERS['mouseupoutside'] = function(event){
            canvas.isdrawing = false;
        }
        
        for(const [event, handler] of Object.entries(EVENTS_HANDLERS)){
            canvas.addEventListener(event, handler);
        }
    }
    function removeEvents(){
        for(const [event, handler] of Object.entries(EVENTS_HANDLERS)){
            canvas.removeEventListener('event', handler);
        }
    }
    const wrappingupInit = (function(){
        if(interactive) 
            registerEvents();
        UTILS.setCursor(UIstates.pen)
    })()

    return{
        context: ctx,
        canvas: canvas,
        DRAW: DRAW,
        states: UIstates,
        setStates: setUIStates,
        disableInteractivity: disableInteractivity, 
        enableInteractivity: enableInteractivity
    }
}

function toRgba(color){
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
}