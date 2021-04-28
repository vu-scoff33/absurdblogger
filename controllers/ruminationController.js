const Rumination = require('../models/Rumination.js');
var mongoose = require('mongoose'); 
const GridFsStorage = require('multer-gridfs-storage');
const path = require('path');
const gridStorage = new GridFsStorage({
    db: mongoose.connection,
    file: function(req, file){
        const title = req.body.title;
        return {
            filename: title + "-" + file.fieldname + path.extname(file.originalname), //fieldname === cover
            bucketName: "covers"
        }
    }
})
const multer = require('multer');
const uploadCover = multer({
    storage: gridStorage,
    fileFilter: function(req, file, cb){
        let isValid = file.mimetype.startsWith('image/');
        if(!isValid){
            //handle errors;
            cb(null, false)
        }
        cb(null, true)
    }
}).single('cover');
var Bucket;
mongoose.connection.on('connected', () => {
    Bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'covers'
    })
})

exports.writing_panel = function(req, res){
    const context = {
        postButton: "Publish"
    }
    res.render('writing_new.hbs', {
        layout: 'writing_panel.hbs',
        ...context,
        helpers: {
            section: function(name, options){
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this); 
                return null;
            }
        } 
    })
}
exports.editing_panel = function(req, res){
    const rumination_id = mongoose.Types.ObjectId(req.params.id);
    
    Rumination.findById(rumination_id).exec(async (err, doc) => {
        var context = {
            postButton: "Update",

            content: doc.content,
            title: doc.title,
            id: rumination_id,
            tags: doc.tags_stringified, 
            description: doc.description, 
        }
        if(doc.cover.id){
            //check valid valid refId
            let isRefExisted =  await Rumination.checkValidReferenceCover(doc.cover.id);
            if(!isRefExisted) //purify
            {
                console.log("Invalid refkey, initiating purification...")
                doc.cover = null;
                doc.save()
            }
            else{
                context.cover = {
                    id: doc.cover.id,
                    name: doc.cover.name
                }
            }
        }
        res.render('writing_edit.hbs', {
            layout: 'writing_panel.hbs', 
            ...context,
            helpers: {
                section: function(name, options){
                    if(!this._sections) this._sections = {}; //init
                    this._sections[name] = options.fn(this); //passing context to script, or more of embedd data into doc
                    //does options.fn() work? yes
                    //does handlebars simply a combination of file, after all this is just string
                    //dynammic page is the staticFront(html, css, js), which is no different from a bulks of string
            
                    return null;
                }
            }
        })
    })
}

exports.dumb_ajax_create = [
    uploadCover, 
    function(req, res){
        if(!req.file)    console.log("no files uploaded")
        var {title, content, description, tags, date} = req.body;
        //$data massaging on creating document
        var newRumination = new Rumination({
            title: title,
            content: content,
            description: description,
            meta: {
                createdAt: date, 
                author: "Unimplemented",
            },
            tags: tags.split(',').map(tag => tag.trim()), 
        })
        if(req.file){
            newRumination.cover = {
                id: req.file.id,
                name: req.file.filename
            }
        }
        newRumination.save((err) => {
            if(err) {
                console.log("Error occurred in saving rumination: ", err)
                res.status(500).end();
            }
            else{
                console.log("New document created & saved: ", newRumination);
                res.redirect('/admin-panel/reflections');
                //geez is redirect the only way to handle this crud operation. nevermind i am now out of brain juice
            }
        });
    
    }
]


exports.dumb_ajax_delete = function(req, res){
    const rumination_id = mongoose.Types.ObjectId(req.body.id);
    Rumination.findByIdAndDelete(rumination_id).exec((err) => {
        if(err) console.log(err);
        else{
            res.redirect('/admin-panel/reflections');
        }
    })
}

exports.dumb_ajax_update = [
    uploadCover, 
    function(req, res){
        console.log("logging out ajax update", req.body, req.file);
        if(req.file)   console.log("There is a change in the state of file") //$$refactor: adding remove files, 
        const rumination_id = mongoose.Types.ObjectId(req.body.id);
        const {title, content, description, tags, date} = req.body;
        //return;
        Rumination.findById(rumination_id).exec((err, doc) => {
            if(err) {
                console.log(err);
            }
            else{
                doc.title = title;
                doc.content = content;
                doc.description = description;
                doc.meta = {
                    createdAt: date,
                    author: "Still unimplemented"
                };
                doc.tags = tags.split(',').map(tag => tag.trim());
                if(req.file){
                    if(doc.cover.id){
                        console.log("Replacing rumination's featured image");
                        mongoose.connection.db.collection('covers.files').deleteOne({_id: doc.cover.id});
                        //$$refactor: clearing all images that no longer gets referred to by docs. Exception of
                        //INCOMPLETE TRANSACTION
                    }
                    doc.cover = {
                        id: req.file.id, 
                        name: req.file.filename
                    }
                }
    
                doc.save((err) => {
                    if(err){
                        console.log("Err during saving Update: ", err);
                        res.status(500).end();
                    }
                    else{
                        res.redirect('/admin-panel/reflections');
                    }
                })
            }
        })
    }
]

exports.pagination = async (req, res) => {
    const page = parseInt(req.params.page, 10); //current page
    const SHOWN_PER_PAGE = 5;
    const ruminations_counter = await Rumination.countDocuments({}); //no filter
    Rumination.find({}).sort('-meta.createdAt').skip(SHOWN_PER_PAGE * (page - 1)).limit(SHOWN_PER_PAGE)
    .select('title meta tags')
    .exec((err, docs) => {
        if(err) console.log(err);
        //manually build a ready-to-use context object from docs, avoid passing the whole damn doc into handlebars

        const MAX_PAGING = Math.ceil(ruminations_counter / SHOWN_PER_PAGE);
        const context = {
            ruminations: docs.map(doc => ({
                title: doc.title, meta: doc.meta, id: doc._id.toString()
            })), //lean returning plain objects to enhance security
                        //handlebars won't retrieve data coming from a prototype
            isFirstPaging: (page == 1),
            isLastPaging: (page == MAX_PAGING), 
            prevHref: (page > 1) ? (page - 1) : 1,
            nextHref: (page < MAX_PAGING) ? (page + 1) : MAX_PAGING
        }
        //console.log(context)
        res.render('reflections_panel.hbs', {
            layout: 'admin_panel.hbs',
            ...context,
            helpers: {
                section: function(name, options){
                    if(!this._sections) this._sections = {}; //init
                    this._sections[name] = options.fn(this);
                    return null; // helpers don't do anything, doesn't transform anything
                },
                paging: function(){
                    var htmlReturn = "";
                    for(let i = 0; i < MAX_PAGING; i++){
                        htmlReturn += `<li class="page-item"><a class="page-link" href="/admin-panel/reflections/${i+1}">${i+1}</a></li>`
                    }
                    return htmlReturn;
                }
            }
        })
    })
}

exports.get_cover = function(req, res){
    try {
        var coverId = mongoose.Types.ObjectId(req.params.id);
    } catch(err){
        res.send("Wrong ID Format cheeky fuckass!")
    }
    mongoose.connection.db.collection('covers.files').findOne({_id: coverId})
        .then(file => {
        if(!file)   res.send("File Not Found");
        Bucket.openDownloadStream(coverId).pipe(res).on('error', (err) => {
            console.log("error during piping");
            res.send("Error retrieving file")
        })
    })
        .catch(err => res.send(err))
}

//Front-backend
exports.ajax_get = function(req, res){
    const FETCH_VOLUME = 4;
    let returnedDocs = []
    Rumination.randomize(FETCH_VOLUME, function(err, docs){
        docs.forEach((doc) => {
            var ret = {
                id: doc._id,
                title: doc.title,
                content: doc.content,
                comments: doc.comments,
                cover_id: doc.cover.id || null
            };
            returnedDocs.push(ret)
        })
        res.json(returnedDocs)
    })
}
exports.ajax_post_comment = function(req, res){
    console.log("user posts comment", req.body);
    const rumination_id = mongoose.Types.ObjectId(req.body.id);
    Rumination.findById(rumination_id).exec((err, doc) => {
        if(!err){
            doc.comments.push({
                comment: req.body.comment, 
                signature: req.body.signature
            })
            doc.save((err, result) => {
                if(!err){
                    console.log("Saved successfully ", result);
                    res.end();
                }
            })
        }
    })
}

exports.Homepage = function(req, res){
    const BATCH = 2;
    Rumination.randomize(BATCH, function(err, docs){
        let ruminations = [];
        docs.forEach((doc) => {
            var rum = {
                id: doc._id,
                title: doc.title,
                content: doc.content, 
                comments: doc.comments, 
                cover_id: doc.cover.id || null,
            }
            ruminations.push(rum)
        })
        let initColor_1 = genColorScheme(), initColor_2 = genColorScheme();
        res.render('homepage.hbs', {
            ruminations, initColor_1, initColor_2,
            helpers: {
                section: function(name, options){
                    if(!this._sections) this._sections = {};
                    this._sections[name] = options.fn(this);
                    return null
                }
            }
        })
    })
}


//$refactor to helpers? should I delegate this task to client? 
const genColorScheme = function(volume){
    //Possibilities should always be > volume (<= 4)
    const POSSIBILITIES = [
        "rgb(93, 201, 122)", "rgb(207, 219, 92)", "rgb(116, 120, 237)", "rgb(141, 99, 212)", "rgb(187, 89, 207)",
        "rgb(235, 56, 95)", "rgb(219, 146, 77)", "rgb(86, 81, 232)"
    ];
    let r = Math.floor(Math.random() * POSSIBILITIES.length);
    return POSSIBILITIES[r];
}