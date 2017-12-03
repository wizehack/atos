var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var testResultsSchema = new Schema({
    execGrpId: String,
    id: String,
    name: String,
    tags: String,
    autoVerification: Boolean,
    description: String,
    scenario: Array,
    passed: Boolean
});

//scenario: [{input: String, expectedOutput: String, output: String, outputType: String}, ]

module.exports = mongoose.model('result', userSchema);
