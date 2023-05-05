const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const confiq=require('../config/config1').get(process.env.NODE_ENV);
const salt=10;
require('dotenv').config();

var mongoose=require('mongoose');
const { config } = require('dotenv');

const userSchema=mongoose.Schema({
    firstname:{
        type: String,
        required: true,
        maxlength: 100
    },
    lastname:{
        type: String,
        required: true,
        maxlength: 100
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: 1,
        maxlength:50
    },
    password:{
        type:String,
        required: true,
        minlength:8
    },
    password2:{
        type:String,
        required: true,
        minlength:8

    },
    dateOfBirth: {
        type: Date
    },
    education: {
        type: String,
        maxlength: 100
    },
    imagePath: {
        data: Buffer,
        contentType: String,
    },
    token:{
        type: String,
    },
    resetPasswordToken:{
        type: String
    },
    resetPasswordExpires:{
        type: Date
  }

});

userSchema.pre('save',function(next){
    console.log("Hi how r u ");
    var user=this;
    if(user.isModified('password')){
        console.log("u r in ismodified if");
       // this.password = bcrypt.hash(this.password,12);
       // this.password2 = bcrypt.hash(this.password2,12);
        bcrypt.genSalt(salt,function(err,salt){
            if(err)return next(err);
            console.log("u r in bcrypt if");
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password=hash;
                user.password2=hash;
                next();
               // console.log("next() function crossed".next());
            })
        })
    }
    else{
        next();
    }
});

//compare password method
userSchema.methods.comparePassword = function(password,cb){
    console.log("in compare pass method");
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch);
    });

}
   
// generate token
userSchema.methods.generateToken=  function(){ //cb
    var user =this;
    var token=jwt.sign(user._id.toHexString(),confiq.SECRET); //confiq.SECRET
   //var token=jwt.sign(user._id, config.get( 'default.SECRET')); //'config.SECRET   .toHexString() 
    console.log("Secret key from .env file: ", process.env.SECRET);
    var newtoken = token.toString();
    user.token=newtoken;
    return user.save().then((savedUser) => {
        return savedUser;
      }).catch((error) => {
        throw error;
      });
   /* user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })*/
}

// find by token
userSchema.statics.findByToken = function (token) {
    const User = this;
    let decoded;
  
    try {
      decoded = jwt.verify(token, config.SECRET);
    } catch (e) {
      return Promise.reject(e);
    }
  
    return User.findOne({
      _id: decoded,
      token: token
    }).exec();
  };
  
  
/*
userSchema.statics.findByToken=function(token,cb){
    var user=this;
    jwt.verify(token,confiq.SECRET,function(err,decode){
        user.findOne({"_id": decode, "token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
};*/

//delete token
userSchema.methods.deleteToken=function(token,cb){
    var user=this;

    user.update({$unset : {token :1}},function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}


module.exports=mongoose.model('User',userSchema);
