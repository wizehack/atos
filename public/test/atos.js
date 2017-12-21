var http = require('http');
var exec = require('child_process').exec;
var run = true;
var testsuiteId = null;
var testsuiteAPI = '/get/testsuite/';
var reportAPI = '/update/testsuite/'
var uploadResultAPI = '/uploadResult/'
var testsuiteURL = null;
var serverURL = null;
var cmd = null;
var testsuite = null;
var resultURL = null;
var runList = [];

var serverIP = null;
var port = null;

var cmd = 'nodejs atos.js --server url --id id';
process.argv.forEach(function (val, index, array) {
    if(run) {
        if(array.length < 6) {
            console.log(cmd);
            run = false;
            return;
        }

        if((index === 2) && (val !== '--server')) {
            console.log(cmd);
            run = false;
            return;
        }

        if(index === 3) {
            serverURL = val;
            var startPoint = serverURL.indexOf('http://');
            var endPoint = serverURL.lastIndexOf(':');

            if(startPoint === -1) {
                startPoint = serverURL.indexOf('https://');
            }

            if(startPoint === -1) {
                console.log(cmd);
            }

            serverIP = serverURL.substring(startPoint+7, endPoint);
            port = serverURL.substr(endPoint + 1);

            console.log('IP: ' + serverIP);
            console.log('PORT: ' + port);
        }

        if((index === 4) && (val !== '--id')) {
            console.log(cmd);
            run = false;
            return;
        }

        if(index === 5) {
            testsuiteId = val;
            testsuiteURL = serverURL + testsuiteAPI + testsuiteId;
        }
    }
});

console.log('GET TESTSUITE');

if(run) {
    var options = {
        host: serverIP,
        path: testsuiteAPI + testsuiteId,
        port: port,
        method: 'GET',
    };

    var callback = function(response) {
        var str = '';

        response.on('data', function(chunk) {
            str += chunk;
        });

        response.on('end', function() {
            console.log(str);
            testsuite = JSON.parse(str);

            if(testsuite) {
                var id = testsuite.id;
                var startPoint = 0;
                var endPoint = testsuiteURL.indexOf(id);
                var url = testsuiteURL.substr(startPoint, endPoint);
                resultURL = url + 'html/' + id;
                delete testsuite._id;
                for(var i=0; i<testsuite.list.length; i++) {
                    var testcase = testsuite.list[i];
                    var scenario = testcase.scenario;
                    delete testcase._id;
                    for(var j=0; j<scenario.length; j++) {
                        var step = scenario[j];
                        runList.push(step);
                    } //for j
                } // for i

                runAllStep();
            }
        });
    };

    var req = http.request(options, callback);
    req.end();
}

function runAllStep() {
    if(runList.length) {
        var step = runList[0];
        var uploadCMD = null;

        if(step.expectedFile) {
            //console.log('expectedFile: ' + step.expectedFile);
            var fileName = getFileName(step.expectedFile);
            var url = '';

            if(step.fileType === 'Text') {
                url = serverURL + uploadResultAPI + testsuiteId + '/' + fileName;
                uploadCMD = 'curl -X POST ' + url + ' -T ' + '"' + step.expectedFile + '"';
            }
            else if(step.fileType === 'Image') {
                url = serverURL + uploadResultAPI + 'image/' + testsuiteId + '/' + fileName;
                uploadCMD = 'curl -X POST -H ' + '"' + 'Content-Type: application/octet-stream' +
                    '"' + ' --data-binary ' + '"' + '@' + step.expectedFile + '" ' + url;
            }

            if(step.fileType !== 'None') {
                step.outputFile = serverURL + '/data/' + testsuiteId + '/' + fileName;
            }
        } else {
            step.expectedFile = null;
        }

        exec(step.input, function(error, stdout, stderr) {
            console.log(step.input);

            if(step.expectedOutput && stdout) {
                console.log(stdout);
                step.output = stdout;
            } else if (error){
                console.log(error);
                step.output = error;
            }

            if(testsuite.autoVerification) {
                console.log('expectedOutput: ' + step.expectedOutput);
                if(step.expectedOutput === step.output) {
                    step.success = true;
                } else {
                    step.success = false;
                }
            } else {
                step.expectedOutput = null;
            }

            if(uploadCMD) {
                exec(uploadCMD, function(error, stdout, stderr) {
                    console.log(uploadCMD);
                    if(stdout) {
                        console.log(stdout);
                        step.output = stdout;
                    } else if (error){
                        console.log('ERROR: ' + error);
                        step.output = error;
                    }

                    runList.shift();
                    runAllStep();
                });
            } else {
                runList.shift();
                runAllStep();
            }
        });
    } else {
        report(testsuite);
    }
}

function report(result) {
    var body = JSON.stringify(result);

    var header = {
        'Content-Type': 'application/json',
    };

    var options = {
        host: serverIP,
        path: reportAPI + testsuiteId,
        port: port,
        method: 'PUT',
        headers: header
    };

    var callback = function(response) {
        var str = '';

        response.on('data', function(chunk) {
            str += chunk;
        });

        response.on('end', function() {
            console.log(str);
        });
    };

    var req = http.request(options, callback);
    console.log(body);
    req.write(body);
    console.log('sending...');
    req.end();
};

function getFileName(filePath) {
    if(filePath) {
        var sepr = filePath.lastIndexOf("/");
        return filePath.substr(sepr+1);
    }

    return filePath;
};
