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
    if(testcase.autoVerification === true) {
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

    var head = '<head>' + 
        '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>' +
        '<script src="/testcase.js"> </script></head>';

    var body = '<body>' +
        '<h1> Test Case </h1><hr />' +
        '<h3> ID &nbsp' + 
        '<input id="tcid" type="text" value="'+ testcase.id + '">' +
        '</h3>' +

        '<h3> Name &nbsp' +
        '<input id="name" type="text" value="'+ testcase.name + '">' +
        '</h3>' +

        '<h3> Tags &nbsp' + 
        '<input id="tags" type="text" value="' + testcase.tags + '">' +
        '</h3>' + 

        verificationType +

        '<h3> Description </h3>' + 
        '<textarea id="description" enabled cols="70" rows="10">' + 
        testcase.description + 
        '</textarea>' +

        '<h3> Test Scenario </h3>' + 

        '<textarea id="scenario" enabled cols="100" rows="10">' +
        JSON.stringify(testcase.scenario) + 
        '</textarea><hr />' +
        '<div id="btnitem">' +
        '<button id="save"> Save </button>' + 
        '<button id="cancel"> Cancel </button>' +
        '</div>' +
        '</body>';
    var html = head + body;

    return html;
};
