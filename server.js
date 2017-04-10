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

var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ' - ' + file.originalname)
    }
})

var upload = multer({ storage: storage })

//var upload = multer({ dest: 'uploads/' });


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


app.use(expressJwt({ secret: config.secret }).unless({ path: ['/login','/upload/file', new RegExp('/download/*', 'i'), new RegExp('/update/uploaded/file', 'i') ]}));
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

    var username = req.body.username;
    var password = req.body.password;
    console.log(password, username);
    if(!username || !password){
        res.sendStatus(500);
        return;
    }

    Teachers.count({ "email": username, "password": password }, (error, data) => {
        if (error) {
            console.log(error,8980)
        } else {
            if (data > 0) {
                var myToken = jwt.sign({ username: 'alexesca' }, config.secret)
                res.json(myToken);
            }else{
                console.log(data,545345);
                res.sendStatus(500);
            }
        }
    });
});


app.post('/teachers/add/new', (req, res) => {
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

app.get('/get/teacher/information/:id', (req, res) => {
    var id = req.params.id;
    Teachers.findOne({"_id": new mongoose.mongo.ObjectId(id)}, (error, data) => {
        if(error){
            console.log(error)
            res.json(error);
        }else if(data){
            console.log(data)
            res.json(data);
        }else{
            res.sendStatus(500);
        }
    });
});

app.delete('/delete/teacher/:id', (req, res) => {
    var id = req.params.id;
    Teachers.remove({"_id": new mongoose.mongo.ObjectId(id)}, (error, data) => {
        if (error) {
            res.json(error);
        } else if ( data) {
            res.json(data)
        } else {
            res.sendStatus(500);
        }
    });
});


app.put('/update/teacher/:id',(req, res) => {
    var id = req.params.id;
    var document = req.body;
    console.log(document,"document")
    Teachers.updateOne({"_id": new mongoose.mongo.ObjectId(id)},document, (error, data) => {
        if(error){
            res.json(error);
        }else if(data){
            res.json(data);
        }else{
            res.sendStatus(500);
        }
    });
});

app.post('/upload/file', upload.single('file'), function (req, res, next) {
    var body = req.body;
    body.skills = teachersModule.formatSkillArrayToObject(body.skills);
    body.filename = req.file.filename;
    console.log(req.file)
    Teachers.create(
            body
            , (error, data) => {
            if(error){
                res.json({error: "OK"});
            }else{
                res.json({error: "ERROR"});
            }
    });
});


app.post('/update/uploaded/file', upload.single('file'), function (req, res, next) {
    var body = req.body;
    var document = {
        firstname: body.firstname,
        lastname: body.lastname,
        phonenumber: body.phonenumber,
        email: body.email,
        address1: body.address1,
        address2: body.address2,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        skills: body.skills
    };
    body.skills = teachersModule.formatSkillArrayToObject(body.skills);
    body.filename = req.file.filename;
    var id = body.id;
    console.log(req.body);
    Teachers.updateOne({"_id": new mongoose.mongo.ObjectId(id)},
        document
        , (error, data) => {
        if(error){
            //console.log(error);
            res.json({error: "OK"});
        }else{
            console.log(data)
            res.json({error: "ERROR"});
}
});
});

app.get('/download/:filename', function(req, res){
    var filename = req.params.filename;
    var file = __dirname + '/uploads/' + filename;
    res.download(file); // Set disposition and send it.
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


