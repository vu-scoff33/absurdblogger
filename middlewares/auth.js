const jwt = require('jsonwebtoken');

function auth(req, res, next){
    if(req.cookies.ACCESS_TOKEN){
        console.log("Authentication Middleware in Action! ", req.path);
        const clientToken = req.cookies.ACCESS_TOKEN
        jwt.verify(clientToken, process.env.JWT_secret, (err, decoded) => {
            if (err)    res.status(401).redirect('/login')
            //console.log(decoded)
            req.user = decoded; //adding user info into the request object for next middleware
            next();
        })
    }
    else res.status(401).redirect('/login')
}

module.exports = auth;
