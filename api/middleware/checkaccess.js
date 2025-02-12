// middleware/authorizeAccessRight.js
const jwt = require('jsonwebtoken');

// Middleware function to check if the user has a specific access right
function authorizeAccessRight(requiredRight) {
    return (req, res, next) => {
        // Retrieve token from request header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Auth token missing' });

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_KEY);
            const userAccessRights = decodedToken.accessRights || [];

            // Check if user has the required access right
            if (userAccessRights.includes(requiredRight)) {
                next(); // User has the right, proceed to the route
            } else {
                res.status(403).json({ message: 'Access denied: Insufficient permissions' });
            }
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(403).json({ message: 'Authorization failed' });
        }
    };
}

module.exports = authorizeAccessRight;
