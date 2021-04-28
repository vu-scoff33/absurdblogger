//board texture data: 1024*1024 -- 94pxCircle

const app = new PIXI.Application({
    transparent: true,
    antialias: true,
    resolution: 1
});
document.body.appendChild(app.view)
var renderer = app.renderer;

renderer.view.style.position = 'absolute';
renderer.view.style.top = '0px';
renderer.view.style.display = 'block';
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);
const WORLD_WIDTH = window.innerWidth;
const WOLRD_HEIGHT = window.innerHeight;

//re-semanticize
var root = app.stage, 
    Graphics = PIXI.Graphics,
    Loader = app.loader, //@is there a point for a new loader?
    Sprite = PIXI.Sprite,
    Point = PIXI.Point,
    Container = PIXI.Container;
root.sortableChildren = true;
//Classes & ObjectsFactory 

var db_handCards = [];
class HandCard {
    //id, sprite image, type?
    static STD_WIDTH = 70;
    static STD_HEIGHT = 140;
    size = {
        width: HandCard.STD_WIDTH,
        height: HandCard.STD_HEIGHT
    }
    vx = 0; vy = 0;
    constructor(x, y, texture){
        this.oX = x; 
        this.oY = y;
        this.x = x;
        this.y = y;
        this.oTexture = texture; 
        this.CardSprite = this.initSprite(texture);

        this.TOP_BOUND = this.oY - 30;
    }
    initSprite(texture){
        let CardSprite = new Sprite(texture);
        let _this = this;
        CardSprite.x = this.x;
        CardSprite.y = this.y;
        CardSprite.width = this.size.width;
        CardSprite.height = this.size.height;
        CardSprite.interactive = true;
        CardSprite.on("mouseover", function(event){
            _this.onMouseOver(event, this)
        });
        CardSprite.on("mouseout", function(event){
            _this.onMouseOut(event, this)
        })

        return CardSprite;
    }
    updateSprite(){
        this.y = this.y <= this.TOP_BOUND  ? this.TOP_BOUND : this.y += this.vy;
        this.CardSprite.y = this.y;
    }
    onMouseOver(event, _this){
        //first let's just make it move 
        this.vy = -4;

        //view container test
        // CardViewContainer.visible = true;
        // let cardViewSprite = new Sprite(this.oTexture);
        // cardViewSprite.anchor.set(0.5);
        // cardViewSprite.nameID = 'cardview';
        // cardViewSprite.height = WOLRD_HEIGHT - 50;
        // cardViewSprite.x = CardViewContainer.width / 2;
        // cardViewSprite.y = CardViewContainer.height / 2;
        // CardViewContainer.addChild(cardViewSprite)
    }   
    onMouseOut(event, _this){
        this.vy = 0;
        this.y = this.oY;

        // CardViewContainer.visible = false;
        // CardViewContainer.children.forEach(child => {
        //     if(child.nameID === 'cardview')
        //         child.destroy()
        // })
    }
}

var db_coinSprite = []; // do I need this
class Coin { //%what's the benefit of having a class of sprite, instead of just writing directly into spriteObject
            //other than just having to interact w/ Sprite indirectly through self-defined Classes?
            //Sprite === renderRuntime Object, & they are scattered / but can I also group 'em in the same manner? 
    size = 200 * ( WOLRD_HEIGHT / 2048)
    static SIZE = 200 * ( WOLRD_HEIGHT / 2048)
    constructor(x, y, texture){
        //this.value = value
        this.X = x;  
        this.Y = y;
        this.CoinSprite = this.initSprite(texture)
    }
    initSprite(texture){
        let sprite_coin = new Sprite(texture);
        sprite_coin.x = this.X;
        sprite_coin.y = this.Y;
        sprite_coin.width = this.size;
        sprite_coin.height = this.size;
        sprite_coin.zIndex = 3;
        sprite_coin.interactive = true;
        sprite_coin.anchor.set(0.5)
        sprite_coin.on('mousedown', this.onDragstart)
                    .on('mousemove', this.onDragmove)
                    .on('mouseup', this.onDragend)
                   .on('mouseupoutside', this.onDragend)
        //$now I seriously have to refactor this. This piece of shit breaks the whole thing.      
        sprite_coin.OX = this.X;
        sprite_coin.OY = this.Y
        return sprite_coin;
    }
    onDragstart(event){
        this.dragging = true;
        this.alpha = 0.8;
        //console.log(this)
    }
    onDragmove(event){
        if(this.dragging){
            const t = event.data.global;
            this.x = t.x - this.parent.x;
            this.y = t.y - this.parent.y;
            Coin.shareMovingSprite(this)
        }
    }
    onDragend(event){
        this.dragging = false;
        this.alpha = 1;
        let isInboard = Coin.checkGlobalBounds(this)
        if(!isInboard){
            this.x = this.OX; 
            this.y = this.OY;
            CoinsBucket.addChild(this)
        }
        else{
            const t = event.data.global; 
            //drop as to the mouse
            BoardContainer.addChild(this)
            this.x = t.x - this.parent.x;
            this.y = t.y - this.parent.y;
        }
    }
    static checkGlobalBounds(coinSprite){
        let gx = coinSprite.x + coinSprite.parent.x , gy = coinSprite.y + coinSprite.parent.y, radius = coinSprite.width / 2;
        if(gx - radius < BoardProperties.x || gx + radius > BoardProperties.x + BoardProperties.width
            || gy - radius < BoardProperties.y || gy + radius > BoardProperties.y + BoardProperties.height
        )
            return false;
            
        return true;
    }
    static shareMovingSprite(coinSprite){
        
        socket.emit('moving', {
            x: coinSprite.x,
            y: coinSprite.y,
            //index: db_coinSprite.indexOf(coinSprite)
        })
    //@@@@@@@    //this is not about sharing moving sprite, but to share the stateOfObject
        //parent? globalx, globaly, which coin among coins
        //what is the REAl time Architecture here? 
        //
    }
}

const BoardProperties = {
    x: WORLD_WIDTH / 2 - WOLRD_HEIGHT / 2,
    y: 0,
    width: WOLRD_HEIGHT, 
    height: WOLRD_HEIGHT, 
}

var initBoard = function(boardTexture){
    console.log("Powered of Two? ", boardTexture.baseTexture.isPowerOfTwo)
    BoardContainer = new Container();   //%sprite as a container distorts children's dimension
    BoardContainer.nameID = "BoardContainer";

    var BoardSprite = new Sprite(boardTexture);
    BoardSprite.x = 0;
    BoardSprite.y = 0;
    BoardSprite.width = BoardProperties.width;
    BoardSprite.height = BoardProperties.height;

    BoardContainer.x = BoardProperties.x;
    BoardContainer.y = BoardProperties.y;
    BoardContainer.addChild(BoardSprite)

    CoinsBucket = new Container();
    CoinsBucket.nameID = "CoinsBucket";
    CoinsBucket.x = BoardProperties.x + BoardContainer.width + 50;
    CoinsBucket.y = 50;
    CoinsBucket.BUCKET_10 = new Point(0, 0);
    CoinsBucket.BUCKET_20 = new Point(0, Coin.SIZE + 15);
    CoinsBucket.BUCKET_30 = new Point(0, 2 * (Coin.SIZE + 15));
    CoinsBucket.zIndex = 2;
    let coinRing = new Graphics();
    coinRing.lineStyle(3, 0xffffff)
    coinRing.drawCircle(CoinsBucket.BUCKET_10.x, CoinsBucket.BUCKET_10.y, Coin.SIZE / 2);
    coinRing.drawCircle(CoinsBucket.BUCKET_20.x, CoinsBucket.BUCKET_20.y, Coin.SIZE / 2);
    coinRing.drawCircle(CoinsBucket.BUCKET_30.x, CoinsBucket.BUCKET_30.y, Coin.SIZE / 2);

    coinRing.endFill();
    CoinsBucket.addChild(coinRing)

    //return BoardSprite;
}
var initHand = function(textures){
    //$$list of textures
    //inreality this will be pushed as drawingFromDecl
    let sampleTexture = textures;
    HandContainer = new Container();
    for(let i = 0; i < 7; i++){
        let gutter = 5 * i;
        let card = new HandCard(i * HandCard.STD_WIDTH + gutter, 0, sampleTexture);
        HandContainer.addChild(card.CardSprite);
        db_handCards.push(card)
    }
    //$$recalculate
    HandContainer.position.x = WORLD_WIDTH / 2;
    HandContainer.position.y = WOLRD_HEIGHT - HandCard.STD_HEIGHT;
    HandContainer.pivot.x = HandContainer.width /2;
    HandContainer.pivot.y = 0;
    HandContainer.zIndex = 2;
}

const assetsReady = function(){
    //forEach sprite
    let sampleTexture = Loader.resources.sample.texture;
    initHand(sampleTexture)


    //BOARD INIT 
    let boardTexture = Loader.resources.board.texture;
    let board = initBoard(boardTexture);

    //COINS INIT
    for(let i = 0; i < 4; i++){
        let coin10 = new Coin(CoinsBucket.BUCKET_10.x, CoinsBucket.BUCKET_10.y, Loader.resources.coin10.texture).CoinSprite;
        let coin20 = new Coin(CoinsBucket.BUCKET_20.x, CoinsBucket.BUCKET_20.y, Loader.resources.coin20.texture).CoinSprite;
        let coin30 = new Coin(CoinsBucket.BUCKET_30.x, CoinsBucket.BUCKET_30.y, Loader.resources.coin30.texture).CoinSprite;
        db_coinSprite.push(coin10)
        db_coinSprite.push(coin20)
        db_coinSprite.push(coin30)
        CoinsBucket.addChild(coin10);
        CoinsBucket.addChild(coin20);
        CoinsBucket.addChild(coin30);
    }

    let WoodenBackground = new Sprite(Loader.resources.background.texture);
    WoodenBackground.width = WORLD_WIDTH;
    WoodenBackground.height = WOLRD_HEIGHT;
    WoodenBackground.zIndex = 0;

        // CARD VIEW CONTAINER
    CardViewContainer = new Container();
    CardViewContainer.zIndex = 2;
    let backdrop = new Graphics();
    backdrop.beginFill(0x666666);
    backdrop.drawRect(0, 0, WORLD_WIDTH, WOLRD_HEIGHT);
    backdrop.alpha = 0.3;
    backdrop.endFill();
    CardViewContainer.addChild(backdrop);
    CardViewContainer.visible = false;
    
    //ROOT CONTAINER
    root.nameID = "root";
    root.sortableChildren = true;
    let testCoin = new Coin(30, 30, Loader.resources.coin10.texture).CoinSprite;
    testCoin.off('mouseup', testCoin.onDragend)
    testCoin.on('mouseup', function(event){
        this.dragging = false;
        this.alpha = 1;
    })
    testCoin.onBeMoved = function(x, y){
        this.x = x;
        this.y = y;
    }
    root.addChild(testCoin)

    root.addChild(WoodenBackground)
    root.addChild(BoardContainer);
    root.addChild(CoinsBucket);
    //root.addChild(HandContainer);
    root.addChild(CardViewContainer)
    root.sortChildren();


    app.ticker.add(delta => animate(delta))
    socket = io('/modernart');

    socket.on('be-moved', (data) => {
        console.log("coin get moved by another client")
        const {x, y} = data;
        testCoin.onBeMoved(x, y)
    })
}

const animate = function(delta){
    db_handCards.forEach(card => card.updateSprite())
}

let socket;
var HandContainer, BoardContainer, CoinsBucket, CardViewContainer;
//do I need all this to be global?



const routePrefix = '/public/gameassets/';
Loader.add('sample', routePrefix + 'sample.jpg')
        .add('board', routePrefix + 'maboard-high.png')  
        .add('background', routePrefix + 'woodenboard.jpg')  
        .add('coin10', routePrefix + 'coin10.png').add('coin20', routePrefix + 'coin20.png').add('coin30', routePrefix + 'coin30.png')
        .load(assetsReady);




//$$what happen if an object get dragged by two pointer