module.exports = function(app, TestSuite) {
    app.post('/create/testsuite', function (req, res) {
        var body = req.body;
        var testsuite = new TestSuite();

        testsuite.id = body.id;
        testsuite.list = body.list;

        var promise = testsuite.save();
        promise.then(function (err) {
            if(err){
                console.log(err);
                res.json({result: false});
                return;
            }
            res.json({result: true});
        });
    });

    app.get('/get/testsuite/:id', function (req, res) {
        TestSuite.findOne({id: req.params.id}, function (err, testsuite) {
            if(err) {
                return res.status(500).send({error: 'database find failure'});
            }

            if(!testsuite) {
                return res.status(404).send({error: 'testcase not found'});
            }

            res.json(testsuite);
        });
    });

    app.get('/get/testsuite/html/:id', function (req, res) {
        TestSuite.findOne({id: req.params.id}, function (err, testsuite) {
            if(err) {
                return res.status(500).send({error: 'database find failure'});
            }

            if(!testsuite) {
                return res.status(404).send({error: 'testsuite not found'});
            }

            var html = getTestSuiteHtml(testsuite);

            res.send(html);
        });
    });

    app.put('/update/testsuite/:id', function(req, res){
        TestSuite.update({ id: req.params.id }, { $set: req.body }, function(err, output){
            if(err) {
                res.status(500).json({ error: 'database failure' });
            }

            if(!output) {
                return res.status(404).json({ error: 'not found' });
            }

            res.json( { message: 'updated' } );
        });
    });

    app.get('/delete/testsuite/:id', function (req, res) {
        TestSuite.remove({id: req.params.id}, function (err, testcase) {
            if(err) {
                return res.status(500).send({error: 'database find failure'});
            }

            if(!testcase) {
                return res.status(404).send({error: 'testcase not found'});
            }

            res.json(testcase);
        });
    });
};

function getTestSuiteHtml(testsuite) {
    var head = '<head><script src="/testsuite.js"> </script></head>';
    var body = "<body>";

    body += '<h2> TestSuite ID: ' + testsuite.id + '</h2>';
    body += '<h2> Test List </h2> <hr />';

    for(var i=0; i<testsuite.list.length; i++) {
        var testcase = testsuite.list[i];
        body += getSubHtml(testcase);
        body += '<hr />';
    }

    body += '</body>';
    var html = head + body;
    return html;
};

function getSubHtml(testcase) {
    var subhtml = '';
    var verificationType = '';
    if(testcase.autoVerification === true) {
        verificationType = '<h3>testType : Auto</h3>';
    }
    else {
        verificationType = '<h3>testType : Menual</h3>';
    }

    subhtml = '<h3> TestCase ID: ' + testcase.id + '</h3>' +
        '<h3>TestCase Name: ' + testcase.name + '</h3>' +
        verificationType +
        '<h3>Result: ' + testcase.result + '</h3>' +
        '<h3>' + 'Step' + '</h3>';

    for(var i=0; i<testcase.scenario.length; i++) {
        subhtml += '<h3>' + JSON.stringify(testcase.scenario[i]) + '</h3>';
    }

    return subhtml;
};
