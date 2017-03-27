// Set up
// create our app w/ express
var mongoose = require('mongoose');
//Using bluebird to avoid mongoose promises
mongoose.Promise = require("bluebird");
// mongoose for mongodb

//Changing This order might affect the rendering 
var express = require('express');
var app = express();
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)\
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var cors = require('cors');
var expressValidator = require('express-validator');

//Importing models
var Teachers = require('./models/teachers.model');
var Skills = require('./models/skills.model');


//Modules
var teachersModule = require('./modules/teachers.module');

//JWT
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var config = require('./config'); // get our config file

//var router = express.Router();              // get an instance of the express Router

//Connecting to mongoose 
mongoose.connect(config.database);


//setting the dynamic port
app.set('port', (process.env.PORT || 8080));
app.use(express.static(__dirname + '/public'));


app.use(expressJwt({ secret: config.secret }).unless({ path: ['/login'] }))
app.set('superSecret', config.secret); // secret variable
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(expressValidator());
app.use(methodOverride());
app.use(cors());

//Solves CROSS errors
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Gets all the teachers 
app.get('/get/teachers/all', (req, res) => {
    Teachers.find({}, (error, data) => {
        if (error) {
            consoe.log(error);
            res.json(error);
        } else {
            console.log(data);
            res.json(data);
        }
    });
});

//Gets the teachers by criteria
app.get('/search/teachers/criteria/:criteria', (req, res) => {
    var criteria = req.params.criteria;
    console.log(criteria);
    Teachers.find({
        $or: [
            { "firstname": new RegExp(criteria, "i") },
            { "lastname": new RegExp(criteria, "i") },
            { "emails": new RegExp(criteria, "i") },
            { "phone": new RegExp(criteria, "i") },
        ]
    }, (error, data) => {
        if (error) {
            console.log(error);
            res.json(error);
        } else {
            console.log(data);
            res.json(data);
        }
    });
});


//gets the skills
app.get('/get/skills/all', (req, res) => {
    Skills.find({}, (error, data) => {
        if (error) {
            res.json(error);
        } else {
            res.json(data);
        }
    });
});

//Search by skills
app.get('/get/teachers/by/skills/:array', (req, res) => {
    var skills = teachersModule.formatSkillArray(req.params.array);
    Teachers.find({ "skills.name": { $all: skills } }, (error, data) => {
        if (error) {
            console.log(error);
            res.send(error)
        } else {
            res.send(data)
        }
    });
});

//Search teachers by criteria and skills
app.get('/get/teachers/by/skills/:criteria/:array', (req, res) => {
    var skills = teachersModule.formatSkillArray(req.params.array);
    var criteria = req.params.criteria
    Teachers.find({
        $or: [
            { "firstname": new RegExp(criteria, "i") },
            { "lastname": new RegExp(criteria, "i") },
            { "emails": new RegExp(criteria, "i") },
            { "phone": new RegExp(criteria, "i") },
        ],
        "skills.name": { $all: skills }
    }, (error, data) => {
        if (error) {
            console.log(error);
            res.send(error)
        } else {
            console.log(data, "both")
            res.send(data)
        }
    });
});

app.post('/login', (req, res) => {

    var email = req.body.email;
    var password = req.body.password;
    Teachers.count({ "email": email, "password": password }, (error, data) => {
        if (error) {

        } else {
            if (data > 0) {
                var myToken = jwt.sign({ username: 'alexesca' }, config.secret)
                res.json(myToken);
            }else{
                res.sendStatus(500);
            }
        }
    });
});


app.post('/teachers/add/new', (req, res) => {
    console.log(req.body,null, '\t');
    Teachers.create(
        req.body
    , (error, data) => {
        if(error){
            res.json({error: "OK"});
        }else{
            res.json({error: "ERROR"});
        }
    });
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


