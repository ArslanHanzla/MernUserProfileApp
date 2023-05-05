const User=require('./../models/user');
const jwt = require('jsonwebtoken');
const config=require('./../config/config1');
const cookieParser = require('cookie-parser');
//const ResetPassword=require('./../models/ResetPassword');
//const cors = require('cors');
/*app.use(cors({
    origin: 'http://localhost:3000'
  }));*/
const express = require('express');
//const app = require('./../models/user');
require('dotenv').config();
const router = express.Router();
const app = express();
app.use(cookieParser());

function auth(req, res, next) {
  console.log("cookie is-> ",req.cookies.jwtoken);
  const token = req.cookies.jwtoken;
  console.log("this is token->  ", token);
 
 // const newtoken = token.toString();
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    console.log("Secret key from config: ", config.get('confiq.SECRET'));
    const decoded = jwt.verify(token,config.get('confiq.SECRET') );   // confiq.SECRET   jwtSecret config.get('config.SECRET')
    req.user = decoded;
    next();
  } catch (ex) {
    console.log("error is this ->",ex);
    res.status(400).json({ message: 'Invalid token.' });
  }
}


router.post('/api/register')
router.post('/api/login')
router.post('/api/forgot-password')
router.get('api/profile')
router.post('/api/register', (req, res) => {
    // Handle the registration request
  });
  
  router.post('/api/login', (req, res) => {
    // Handle the login request
  });
  
  router.post('/api/forgot-password', (req, res) => {
    // Handle the forgot password request
  });
  
  /*router.get('/api/profile', auth, async function(req, res) {
    // Handle the profile request
    console.log("hellow i am in profile router");
  });*/
  
  router.post('/api/resetpassword', (req, res) => {
    // Handle the reset password request
  });
  
//router.post('/api/resetpassword')
module.exports={auth,router};
