const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Enable CORS for cross-origin resource sharing
app.use(cors());

// Middleware setup
app.use(morgan('dev'));  // Logging requests for development purposes
app.use('/uploads', express.static('uploads'));  // Serve static files like uploaded images
app.use(bodyParser.urlencoded({ extended: false }));  // Parse URL-encoded data
app.use(bodyParser.json());  // Parse JSON data

// CORS setup and headers configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');  // Allow access from any origin
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the directory where your views are located
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../views/assets')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the route for the homepage
app.get('/', (req, res) => {
    res.render('index');  // Render the 'index.ejs' file
});

// Import routes
const clubRoutes = require('./api/routes/clubs');
const userRoutes = require('./api/routes/user');
const groupRoutes = require('./api/routes/groups');
const playerRoutes = require('./api/routes/players');
const tournamentRoutes = require('./api/routes/tournament');
// const gameRoutes = require('./api/routes/games');
// const rankingRoutes = require('./api/routes/ranking');
//const statRoutes = require('./api/routes/playerstats');

// Use routes
app.use('/clubs', clubRoutes);
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/players', playerRoutes);
// app.use('/games', gameRoutes);
// app.use('/ranks', rankingRoutes);
//app.use('/stats', statRoutes);

// Error handling for not found routes (404)
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Global error handling middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500);  // Default to 500 if no status code is set
    res.json({
        error: {
            message: error.message  // Send the error message as the response
        }
    });
});

// Export the app for use in the server
module.exports = app;
