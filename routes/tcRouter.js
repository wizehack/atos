module.exports = function(app, TestCase) {

    app.get('/get/testcase', function (req, res) {
        TestCase.find(function (err, testsuite) {
            if(err) {
                return res.status(500).send({error: 'database find failure'});
            }

            if(!testsuite) {
                return res.status(404).json({error: 'testcase not found'});
            }

            res.json(testsuite);
        });
    });

    app.get('/get/testcase/:id', function (req, res) {
        TestCase.findOne({id: req.params.id}, function (err, testcase) {
            if(err) {
                return res.status(500).send({error: 'database find failure'});
            }

            if(!testcase) {
                return res.status(404).send({error: 'testcase not found'});
            }

            res.json(testcase);
        });
    });

    app.get('/get/testcase/html/:id', function (req, res) {
        TestCase.findOne({id: req.params.id}, function (err, testcase) {
            if(err) {
                return res.status(500).send({error: 'database find failure'});
            }

            if(!testcase) {
                return res.status(404).send({error: 'testcase not found'});
            }

            var html = getTestCaseHtml(testcase);

            res.send(html);
        });
    });

    app.get('/add/testcase/html/', function (req, res) {
        var html = getTestCaseHtml(null);
        res.send(html);
    });

    app.put('/update/testcase/:id', function(req, res){
        TestCase.update({ id: req.params.id }, { $set: req.body }, function(err, output){
            if(err) {
                res.status(500).json({ error: 'database failure' });
            }

            if(!output) {
                return res.status(404).json({ error: 'not found' });
            }

            res.json( { message: 'updated' } );
        });
    });

    app.get('/delete/testcase/:id', function(req, res){
        TestCase.remove({ id: req.params.id }, function(err, testcase){
            if(err) {
                return res.status(500).json({ error: "database failure" });
            }

            res.json({ message: "deleted" });
            res.status(204).end();
        })
    });    

    app.post('/create/testcase', function(req, res){
        var body = req.body;
        var testcase = new TestCase();
        testcase.id = body.id;
        testcase.name = body.name;
        testcase.tags = body.tags;
        testcase.autoVerification = body.autoVerification;
        testcase.description = body.description;
        testcase.scenario = body.scenario;

        var promise = testcase.save();
        promise.then(function (err) {
            if(err){
                console.log(err);
                res.json({result: false});
                return;
            }
            res.json({result: true});
        });
    });
}

function getTestCaseHtml(testcase) {
    var verificationType = '';
    if(testcase && testcase.autoVerification === true) {
        verificationType = '<h3><select id="VerificationType">' +
            '<option value="Auto" selected> Auto </option>' + 
            '<option value="Manual"> Manual </option>' +
            '</select></h3>';
    }
    else {
        verificationType = '<h3><select id="VerificationType">' +
            '<option value="Auto"> Auto </option>' + 
            '<option value="Manual" selected> Manual </option>' +
            '</select></h3>';
    }

    var head = '<head>\n';
    head += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>\n';
    head += '<script src="/testcase.js"> </script>\n';
    head += '<style>\n';
    head += 'table { border-collapse: collapse; } table, td, th {    padding: 15px; border: 1px solid black; } \n';
    head += 'input[type="text"] { width: 100%; box-sizing: border-box; -webkit-box-sizing:border-box; -moz-box-sizing: border-box;}\n';
    head += '</style>\n</head>\n';

    var body = '<body>\n';
    body += '<h1> Test Case </h1><hr />\n';

    if(testcase) {
        body += '<h3> ID &nbsp <input id="tcid" type="text" value="'+ testcase.id + '"></h3>\n';
        body += '<h3> Name &nbsp <input id="name" type="text" value="'+ testcase.name + '"></h3>\n';
        body += '<h3> Tags &nbsp <input id="tags" type="text" value="' + testcase.tags + '"></h3>\n';
    } else {
        body += '<h3> ID &nbsp <input id="tcid" type="text" value="'+ "input id" + '"></h3>\n';
        body += '<h3> Name &nbsp <input id="name" type="text" value="'+ "input name" + '"></h3>\n';
        body += '<h3> Tags &nbsp <input id="tags" type="text" value="' + "input tags" + '"></h3>\n';
    }

    body += '<h3> Verification Type &nbsp </h3> \n' + verificationType; 

    body += '\n<h3> Description </h3>\n';

    if(testcase)
    {
        body += '<textarea id="description" enabled cols="70" rows="10">' + testcase.description + '</textarea>\n';
        body += getTestScenarioTable(testcase);
    } else {
        body += '<textarea id="description" enabled cols="70" rows="10">' + "describe testcase" + '</textarea>\n';
    }

    body += getScenarioEditorTable();

    body += '\n<h3> Export </h3>\n';

    if(testcase) {
        body += '<textarea id="output" enabled cols="100" rows="10">' + JSON.stringify(testcase.scenario) + '</textarea><hr />\n';
    } else {
        body += '<textarea id="output" enabled cols="100" rows="10">'+ '</textarea><hr />\n';
    }
    body += '<div id="btnitem">\n';

    if(testcase) {
    body += '<button id="create"> Create </button>\n';
    } else {
    body += '<button id="update"> Update </button>\n';
    }
    body += '<button id="cancel"> Cancel </button>\n';
    body += '</div>\n';
    body += '</body>';
    var html = head + body;

    return html;
};

function getTestScenarioTable(testcase) {
    var subhtml = '';
    subhtml += '<h3> Test Scenario </h3>\n';
    subhtml += '<table id="originTable" width="100%" border="1">\n';
    subhtml += '<tr>\n';
    subhtml += '<th> </th>\n';
    subhtml += '<th> Input </th>\n';
    subhtml += '<th> ExpectedOutput </th>\n';
    subhtml += '<th> ExpectedFile </th>\n';
    subhtml += '<th> FileType </th>\n';
    subhtml += '</tr>\n';

    for(var i=0; i<testcase.scenario.length; i++) {
        subhtml += getTableRow(i, testcase.scenario[i])
    }

    subhtml += '</table>\n';
    return subhtml;
}

function getScenarioEditorTable() {
    var subhtml = '';
    subhtml += '<h3> Update Scenario </h3>\n';

    subhtml += '<div id="tblbtns">\n';
    subhtml += '<button id="addRow"> add Row </button>\n';
    subhtml += '<button id="deleteRow"> Delete Row </button>\n';
    subhtml += '<button id="exportTo"> Export </button>\n';
    subhtml += '</div>\n'
    subhtml += '<table id="dataTable" width="100%" border="1">\n';

    subhtml += '<tr>\n';
    subhtml += '<th> </th>\n';
    subhtml += '<th> Input </th>\n';
    subhtml += '<th> ExpectedOutput </th>\n';
    subhtml += '<th> ExpectedFile </th>\n';
    subhtml += '<th> FileType </th>\n';
    subhtml += '</tr>\n';
    subhtml += getScenarioEditorTableRow()

    subhtml += '</table>\n';
    return subhtml;
}

function getTableRow(index, step) {
    var tableHtml = '<tr>';
    index = index+1;
    tableHtml += '<td>' + index + '</td>\n';
    if(step.input) {
        tableHtml += '<td>' + step.input + '</td>\n';
    } else {
        tableHtml += '<td> </td>\n';
    }

    if(step.expectedOutput) {
        tableHtml += '<td>' + step.expectedOutput + '/td>\n';
    } else {
        tableHtml += '<td> </td>\n';
    }

    if(step.expectedFile) {
        tableHtml += '<td>' + step.expectedFile + '</td>';
    } else {
        tableHtml += '<td> </td>\n';
    }

    if(step.fileType) {
        tableHtml += '<td>' + step.fileType + '</td>';
    } else {
        tableHtml += '<td> </td>\n';
    }

    tableHtml += '</tr>';

    return tableHtml;
}

function getScenarioEditorTableRow() {
    var tableHtml = '<tr>';
    tableHtml += '<td><input type="checkbox" name="chk"/></td>\n';
    tableHtml += '<td><input type="text" name="input"/></td>\n';
    tableHtml += '<td><input type="text" name="expectedOutput"/></td>\n';
    tableHtml += '<td><input type="text" name="expectedFile"/></td>\n';
    tableHtml += '<td><select>';
    tableHtml += '<option value="None" selected> None </option>';
    tableHtml += '<option value="Text"> Text </option>';
    tableHtml += '<option value="Image"> Image </option>';
    tableHtml += '</select></td>';
    tableHtml += '</tr>';

    return tableHtml;
};
