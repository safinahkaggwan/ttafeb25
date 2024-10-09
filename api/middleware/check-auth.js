const jwt = require('jsonwebtoken');    

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];// Extract token from "Bearer <token>"
        const decoded = jwt.verify(token, process.env.JWT_KEY);// Verify the token
        req.userData = decoded;// Add decoded token data to the request
        next();
    }
    catch(error){
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
}