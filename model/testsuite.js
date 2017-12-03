var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var testsuiteSchema = new Schema({
    id: String,
    list: Array
});

module.exports = mongoose.model('testsuite', testsuiteSchema);
