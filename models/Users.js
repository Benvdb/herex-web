var mongoose = require('mongoose');
var crypto = require('crypto');
//jasonwebtoken, geinstalleerd via npm install jasonwebtoken --save
var jwt = require('jsonwebtoken');
//schema voor mongoDB voor een gebruiker: username, pw en salt
var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
  hash: String,
  salt: String
});
//encrypteerd het paswoord met salt en pbkdf2
UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64,'sha1').toString('hex');
};

//haalt het pw op en vergelijkt het met de gehaste opgeslagen pw
UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64,'sha1').toString('hex');

  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {

  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, 'SECRET');
};
mongoose.model('User', UserSchema);
