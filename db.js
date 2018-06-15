var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mongoTeste');

const point = new mongoose.Schema({
	point :  {
        type: { type: String },
        coordinates: []
    },
    name: String,
    description: String,
}, { collection: 'partys' });

const user = new mongoose.Schema({
     email: {type: String, required: true},
   	 password: {type: String, required: true}
}, { collection: 'users' });

module.exports = { Mongoose: mongoose, Point: point, User: user }