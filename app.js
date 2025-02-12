const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./api/db'); 

// Enable CORS for cross-origin resource sharing
app.use(cors());

// Middleware setup
app.use(morgan('dev'));  // Logging requests for development purposes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static('uploads'));  // Serve static files like uploaded images
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
const programRoutes = require('./api/routes/programs');
const roleRoutes = require('./api/routes/role');
const checkAccess = require('./api/middleware/checkaccess');
const gameRoutes = require('./api/routes/games');
const newsRoutes = require('./api/routes/news');
const accessRightRoutes = require('./api/routes/accessright');
const rankingRoutes = require('./api/routes/ranking');

// Use routes 
app.use('/clubs', clubRoutes);  
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/programs', programRoutes);
app.use('/players', playerRoutes);
app.use('/role', roleRoutes);
app.use('/games', gameRoutes);
app.use('/news', newsRoutes);
app.use('/access', accessRightRoutes);
app.use('/rankings', rankingRoutes);

app.get('/admin', checkAccess('rolesmanagement'), (req, res) => {
    res.send('Welcome to the admin page');
});

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

const Game = require('./api/models/games');
const Player = require('./api/models/player');
const GamePlayer = require('./api/models/gamePlayer');
const { syncDatabase } = require('./api/models/synchro');

// Add database initialization
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established');
        
        await syncDatabase();
        console.log('Database tables created successfully');
        
        const PORT = process.env.PORT || 5500;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
}

// Export the app for use in the server
module.exports = app;
