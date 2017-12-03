var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var testcaseSchema = new Schema({
    id: String,
    name: String,
    tags: String,
    autoVerification: Boolean,
    description: String,
    scenario: Array,
});

module.exports = mongoose.model('testcase', testcaseSchema);
