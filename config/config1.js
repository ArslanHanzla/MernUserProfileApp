const generateSecretKey = require('./generateKey');
//const dotenv = require('dotenv');
require('dotenv').config();
const config={
    production :{
        SECRET: process.env.SECRET,  
        DATABASE: process.env.MONGODB_URI || config.default.DATABASE
    },
    default : {
        //SECRET: , // use the generated key here
        SECRET: process.env.SECRET || generateSecretKey() , // mysecretkey process.env.SECRET 'mysecretkey'  generateSecretKey()
        DATABASE: 'mongodb://localhost:27017/Mernstack'
    }
}

exports.get = function get(env){
    return config[env] || config.default
}