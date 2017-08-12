var express = require('express');
var router = express.Router();

var Todo = require('../models/Todos.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;


var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});


router.param('todo', function(req, res, next, id) {
  var query = Todo.findById(id);

  query.exec(function (err, todo){
    if (err) { return next(err); }
    if (!todo) { return next(new Error('can\'t find todo')); }

    req.todo = todo;
    return next();
  });
});


router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password);

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()});
  });

});
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});


router.get('/todos', function(req, res, next) {
  console.log("get/todos");
  Todo.find(function (err, todos) {
    if (err) {console.log("error get todos"); return next(err);}
    console.log(todos);
    res.json(todos);
  });
});


router.post('/todos', auth ,function(req, res, next) {
  var todo = new Todo(req.body);
  todo.author = req.payload.username;
  todo.save(function(err, todo){
    if(err){ return next(err); }

    res.json(todo);
  });
});


router.get('/todos/:id', function(req, res, next) {
  Todo.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

router.put('/todos/:todo', auth, function(req,res,next){
  console.log(JSON.stringify(req.body));
  console.log(req.body.author);
  console.log(req.body.completed);
  console.log(req.body._id);

  Todo.findByIdAndUpdate(req.body._id, req.body, function (err, todo) {
    if (err) return next(err);
    res.json(todo);
  });
 
});


router.delete('/todos/:todo', function(req, res) {
	Todo.remove({
		_id: req.params.todo
	}, function(err, todo) {
		if (err) { return next(err); }
		
		Todo.find(function(err, todos) {
			if (err) { return next(err); }
			
			res.json(todos);
		});
	});
});
