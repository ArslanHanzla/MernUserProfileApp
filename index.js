const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
//const db= require('dotenv').config();
const db=require('./config/config1').get(process.env.NODE_ENV); //.get(process.env.NODE_ENV)
const User=require('./models/user');
const {auth} =require('./middlewares/auth');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app=express();
app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(cookieParser());
//const DB = "mongodb+srv://hanzlaarslan18:<sumama1234,>@cluster0.yqzk0it.mongodb.net/test";
// app use
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());

app.use(cookieParser());
// define auth middleware

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true})
.then(() => {
    console.log("database is connected");
})
.catch((err) => {
    console.log("Error connecting to database: ", err);
});
// api profile/dashboard route
app.get('/api/profile', auth, async function(req, res) {
  try {
    const user = req.user;
    const userObj = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email
    };
    res.json({
      isAuth: true,
      user: userObj,
      message: "login successful"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/',function(req,res){
    res.status(200).send(`Welcome to login , sign-up api`);
});

// adding new user (sign-up route)
app.post('/api/register', function(req, res) {
  const newuser = new User(req.body);
  console.log(req.body);
  if (newuser.password != newuser.password2) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  User.findOne({ email: newuser.email })
    .then((user) => {
      if (user) {
        return res.status(400).json({ auth: false, message: "Email already exists" });
      }
      return newuser.save();
    })
    .then((doc) => {
      res.status(200).json({
        success: true,
        user: doc
      });
      console.log("Data saved successfully in db");
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ success: false });
    });
});

//api login route
app.post('/api/login', async (req,res) =>{
  console.log(req.body);
  try {
      const {email , password} = req.body;
      if(!email || !password){
        return res.status(400).json({error: "empty fields"});
      }else{
      console.log("fields are not empty");
      const user = await User.findOne({email:email});
      console.log(user);
      
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
      else{ 
        console.log("pass matched successfully in else block now");
        const token = await user.generateToken();
       // const newtoken = token.token.toString();
        console.log("my token is ->", token.token );
        res.cookie('jwtoken',token.token , {  //jwtoken,token.token 
          //httpOnly: true,
          //secure: true, // set this to true if you're using HTTPS
          //sameSite: 'strict',
          //maxAge: 30 * 24 * 60 * 60 * 1000, // token will expire after 30 days
          //domain: 'localhost',
          //path: '/'
        });
        console.log("test cookies",req.cookies);
        const userObj = {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
         // name :user.firstname + user.lastname,
          email: user.email,
          token: token
        };
        // Return a response with the token
        return res.cookie('jwtoken', token.token).json    ({  //     res.status(200).json
          isAuth: true,
          user :userObj,
          message: "login successful",
          //id: user._id,
          //firstname: user.firstname,
          //lastname: user.lastname,
          //email: user.email,
          token: token
        });
        }
        //});
      }// end of else block
  }catch(err){
    console.log("Error in login api ".err);
 }
});

// Password reset route
app.post('/api/resetpassword',async (req, res) => {
  const { email, password, newpassword } = req.body
  console.log(email);  console.log(password);  console.log(newpassword);
  // Check if email is provided
  if (!email) {
    return res.status(400).json({ message: 'Please provide an email' });
  }
  // Check if user with provided email exists
  await User.findOne({ email })
  .exec()
  .then((user) => {
    console.log(user);
    if (!user) {
      return res.json({ isAuth: false, message: 'Invalid or expired email .' });
    }else{
      console.log("email found");
    }
    // Check if passwford matches
    user.comparePassword(password, function(err, isMatch) {
      if (err) throw err;
      if (!isMatch) {
        return res.json({ isAuth: false, message: 'Wrong password' });
      }else{ console.log("password matches successfully in login check");}
    });
    user.password = newpassword;
    user.password2 = newpassword;
    user.save().then(() => {
      console.log('User saved successfully');
      console.log("saved user object is ");
      res.status(200).json({ message: 'Password reset successfully. Please log in with your new password.' });
      })  
  .catch((err) => {
    console.error('Error saving user:', err);
  });
  });
});   

// Route to handle the forgot password request
app.post('/api/forgot-password', async (req, res) => {
  try {
    // Check if user with the provided email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate a unique reset token for the user
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in an hour

    // Save the user with the new reset token and expiration time
    await user.save();
    // Send password reset email to the user
    let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
    // host: "smtp.ethereal.email",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'hanzlaarslan18@gmail.com',
      pass: 'bvkrdoslqyiekxcv',
    },
    debug: true,
    logger: true,
  });
    const mailOptions = await transporter.sendMail ( {
      from: testAccount.user,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this email because you (or someone else) has requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            ${'localhost:5000'}/api/forgetpassword\n
            Also copy this token and paste in token search box then enter your new password 
            when this token is matched then your new password will save correctly 
            token->> ${resetToken} \n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    });
    res.json(mailOptions);
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error sending email: ', err);
        return res.status(500).json({ message: 'Error sending email' });
      }
      return res.status(200).json({
        message: 'Password reset email sent. Please check your email inbox',
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Route to handle the password reset form submission
app.post('/api/forgetpasswordenter', async (req, res) => {   ///api/forget-password/:token
  try {
    const {token,password} = req.body; 
    console.log("token->", token);
    console.log("new password->", password);
    // Find the user with the reset token and check if it is still valid
    const user = await User.findOne({
      //resetPasswordToken: req.paramstoken,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Password reset token is invalid or has expired' });
    }
    // Update the user's password and reset token fields
    user.password = password; // req.body.password;
    user.password2 = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); //directory where images store
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Initialize multer middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('image');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

//Router to handle Profile Update 
app.post('/api/updateProfile', upload, async (req, res) => { //.single('image')
  console.log("Requested data is ->",req.body);
    console.log("Requested file is -> ", req.file);
  try {
    
    const { email, dateOfBirth, education } = req.body;
  //  const {  imagePath } = req.file;
    //const { filename, path: imagePath } = req.file;
    console.log(email);
    console.log("date of birth",  dateOfBirth);
    console.log("education", education);
  const imagePath = "G:\\my data\\myrealpic.jpg";
    console.log("Image URL", imagePath);
    // Check if all required fields are filled
    if (! dateOfBirth || !education || !imagePath ) { //|| !imagePath
      return res.status(400).json({ message: "Please fill in all required fields" });
    }else{
      fs.readFile(imagePath, function (err, data) {
        //const imagePath = `./uploads/${image.filename}`;
        fs.writeFile(imagePath, data, function (err) {
          if (err) {
            console.log(err);
            res.status(400).send(err);
          } else {
            console.log("file is successfully written in images folder");
          }
        });
      });
      // Store user data in MongoDB
      //const email = "hanzlaarslan18@gmail.com"
    const user = await User.findOneAndUpdate(
 
      { email: req.body.email }, // search for user by email
      { $set: {  dateOfBirth, education, imagePath } }, // update user data
      { new: true } // return updated document
    );    
    console.log("Updated user data is here ->",user);
    res.json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Load model
//const User = require('../models/user'); this line is already written above

// Route to handle form submission
app.post('/api/submit', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      const { dob, education } = req.body;
      const image = req.file;
      console.log("dob->", dob);
      console.log("education->", education);
      console.log("image path->", image);
      // Validate form data
      if (!dob || !education || !image) {
        res.status(400).send('All fields are required');
      } else {
        // Save image to file system
        fs.readFile(image.path, function (err, data) {
          const imagePath = `./uploads/${image.filename}`;

          fs.writeFile(imagePath, data, function (err) {
            if (err) {
              console.log(err);
              res.status(400).send(err);
            } else {
              // Create new user
              const newUser = new User({
                dob, education, imagePath,
              });

              // Save user to database
              newUser.save((err) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err);
                } else {
                  res.send('User created successfully');
                }
              });
            }
          });
        });
      }
    }
  });
});


// get logged in user
/*
app.get('/api/profile', auth, async function(req, res) {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userObj = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    };
    res.json({
      isAuth: true,
      user: userObj,
      message: 'Login successful',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});*/

/*
app.get('/api/profile',auth,function(req,res){
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.firstname + req.user.lastname
        
    })
});*/

//logout user
app.get('/api/logout',auth,function(req,res){
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });

}); 



module.exports = app;


// listening port
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});

//line 79 to 80 code for login api 
 /*const confirmemail = await  User.findOne({ email })
      .exec().then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        });*/
     // console.log("email: ".confirmemail);
       //const passwordMatches =  User.comparePassword(password);
// line 85 to 90 code for login api
/*const passmatch =   User.comparePassword(password,(err,isMatch)=>{
      console.log("wellcome in comp pass method");
        if(!isMatch)
          { 
            return res.json({ isAuth : false, message : "password doesn't match"});
        }*/

//Line 65 Login route code 
// login user
 /*
 app.post('/api/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
    
        else{
            user.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});
            
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id
                        ,email : user.email
                    });
                });    
            });
          });
        }
  });
});
*/


// login route code from 141 line to 159 code 
/*await user.generateToken((err,user)=>{
        if(err) return res.status(400).send(err);
          res.cookie('auth',user.token).json({
            isAuth : true,
            id : user._id,
            email : user.email
          });
        });  */
        // Authentication successful
       // console.log('User logged in successfully');
       // return res.status(200).json({ name: user.name, token: user.token, message: 'login successfully' });
       // return res.status(200).json({ user , message : 'login successfully'});
          //return res.status(200).json({message: ' '});


//line 151 code api route for Login 
/*
app.post('/api/login', (req, res) => {
   let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });*/
      
/*
async function loginUser(req, res) {
  const { email, password } = req.body;
 // console.log(email);
 // console.log(password);
  try {
    const user =  User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const passwordMatches =  user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // generate and return a JWT token
    const token = user.generateAuthToken();
    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = router;
*/
/*
      const { email, password } = req.body;
      console.log(email);
      console.log(password);
       User.findOne({ email })
        .exec().then((user) => {
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
        
          user.comparePassword(password,(err,isMatch)=>{
            if(!isMatch) return res.json({ isAuth : false, message : "password doesn't match"});
        
          user.generateToken((err,user)=>{
            if(err) return res.status(400).send(err);
              res.cookie('auth',user.token).json({
                  isAuth : true,
                  id : user._id,
                  email : user.email
            });
          });  
            // Authentication successful
            console.log('User logged in successfully');
            return res.status(200).json({ user });
          });
      });
    
    });
});*/


/* const transporter = nodemailer.createTransport({ code is at line 281
      service: 'gmail',
      auth: {
       user:'hanzlaarslan19@gmail.com' ,
       pass: 'hanzla1234,',
       //user: process.env.EMAIL_USERNAME,
       //pass: process.env.EMAIL_PASSWORD,
      },
    });*/

