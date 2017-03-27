var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var structure = new Schema({
    firstname: { type: String, default: null },
    lastname: { type: String, default: null },
    email: { type: String, default: null },
    phonenumber: { type: String, default: null },
    address1: { type: String, default: null },
    address2: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    zipCode: { type: String, default: null },
    skills: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        },
        name: { type: String, default: null }
    }]
});

var model = mongoose.model('Teacher', structure);

module.exports = model;