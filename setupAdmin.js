// setupAdmin.js
require('dotenv').config();
const fs = require('fs');
const bcrypt = require('bcrypt');
const sequelize = require('./api/db');
const User = require('./api/models/users');
const Role = require('./api/models/roles');

async function setupEnvironment() {
    // Check if .env exists
    if (!fs.existsSync('.env')) {
        console.log('Creating .env file');
        fs.writeFileSync('.env', 'JWT_KEY=your_secret_jwt_key_for_token_signing\n');
    } else {
        // Check if JWT_KEY exists in .env
        const envContent = fs.readFileSync('.env', 'utf8');
        if (!envContent.includes('JWT_KEY=')) {
            console.log('Adding JWT_KEY to .env file');
            fs.appendFileSync('.env', '\nJWT_KEY=your_secret_jwt_key_for_token_signing\n');
        }
    }

    console.log('Environment variables configured');
    process.env.JWT_KEY = process.env.JWT_KEY || 'your_secret_jwt_key_for_token_signing';
}

async function createAdminAndSuperUser() {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('Database connection established');

        // Create Administrator role if it doesn't exist
        let adminRole = await Role.findOne({
            where: { role: 'Administrator' }
        });

        if (!adminRole) {
            console.log('Creating Administrator role...');
            adminRole = await Role.create({
                role: 'Administrator',
                description: 'Super administrator with all privileges'
            });
            console.log('Administrator role created with ID:', adminRole.roleId);
        } else {
            console.log('Administrator role exists with ID:', adminRole.roleId);
        }

        // Check if super admin already exists
        const existingUser = await User.findOne({
            where: { useremail: 'super@tta.com' }
        });

        if (existingUser) {
            console.log('Super admin already exists');
            return;
        }

        // Hash the password
        const saltRounds = 11; // Same as in your controller
        const hashedPassword = await bcrypt.hash('TTAtest00', saltRounds);

        // Create the super admin user
        const newUser = await User.create({
            username: 'super',
            useremail: 'super@tta.com',
            password: hashedPassword,
            roleId: adminRole.roleId
        });

        console.log('Super admin created successfully:', newUser.username);
    } catch (error) {
        console.error('Error in setup:', error);
    } finally {
        process.exit();
    }
}

// Run setup
async function setup() {
    await setupEnvironment();
    await createAdminAndSuperUser();
}

setup();