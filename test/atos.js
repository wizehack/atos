var exec = exec = require('child_process').exec;
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
var uploadFiles = [];
var runCnt = 0;
var maxCnt = 0;

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

cmd = 'curl ' + testsuiteURL;

console.log('GET TESTSUITE');
console.log(cmd);

if(run) {
    exec(cmd, function(error, stdout, stderr) {

        if(stdout) {
            testsuite = JSON.parse(stdout);
        }
        else {
           console.log('stderr: ' + stderr);
           console.log(error);
           return;
        }

        if(testsuite) {
            var id = testsuite.id;
            var startPoint = 0;
            var endPoint = testsuiteURL.indexOf(id);
            var url = testsuiteURL.substr(startPoint, endPoint);
            resultURL = url + 'html/' + id;

            var tcList = testsuite.list;
            delete testsuite._id;
            for(var i=0; i<tcList.length; i++) {
                var testcase = tcList[i];
                var scenario = testcase.scenario;
                delete testcase._id;
                maxCnt = maxCnt + scenario.length;

                console.log('MAX: ' + maxCnt);
                console.log('step: ' + scenario.length);

                console.log('----------------------');
                console.log('TCID: ' + testcase.id);
                console.log('----------------------');
                for(var j=0; j<scenario.length; j++) {
                    var step = scenario[j];
                    console.log('execute testInput');
                    runStep(step);
                } //for j
            } // for i
        }

    });
}

function runStep(step) {
    step.output = null;
    step.performed = false;

    if(step.input) {
        console.log(step.input);
        exec(step.input, function(error, stdout, stderr) {
            runCnt++;
            step.performed = true;
            if(stdout) {
                console.log(stdout);
                step.output = stdout;
            } else if (stderr){
                console.log(stderr);
                step.output = stderr;
            }

            if(step.expectedOutput) {
                if(step.expectedOutput === step.output) {
                    step.success = true;
                } else {
                    step.success = false;
                }
            }

            if(step.expectedFile) {
                uploadFiles.push(step.fileName);
                var fileName = getFileName(step.fileName);
                step.fileName = '<a href="' + serverURL + '/data/' +
                    testsuiteId + '/' + fileName+ '"> review</a>'
            }

            console.log('runcnt: ' + runCnt + ' maxCnt: ' + maxCnt);
            if(runCnt === maxCnt) {
                report(testsuite);
            }
        });
    }
    else {
        console.log('error: testinput is NOT found');
    }
};

function report(result) {
    var url = serverURL + reportAPI + testsuiteId;
    var data = JSON.stringify(result);
    data = data.replace(/"/g, '\\"');
    console.log(data);
    var putCMD = 'curl -X PUT -H "Content-Type:application/json" ' + url + ' -d ' + '"' + data + '"';
    console.log(putCMD);

    exec(putCMD, function(error, stdout, stderr) {
        if(stdout) {
            console.log(stdout);
        } else if (stderr){
            console.log(stderr);
        }
    });
};

function upload(filePath) {
    var fileName = getFileName(filePath);
    var url = serverURL + uploadResultAPI + testsuiteId + '/' + fileName;
    var putCMD = 'curl -X POST ' + url + ' -T ' + '"' + filePath + '"';
    console.log(putCMD);

    exec(putCMD, function(error, stdout, stderr) {
        if(stdout) {
            console.log(stdout);
        } else if (stderr){
            console.log(stderr);
        }
    });
};

function getFileName(filePath) {
    var sepr = filePath.lastIndexOf("/");
    return filePath.substr(sept+1);
};

//console.log(server);
