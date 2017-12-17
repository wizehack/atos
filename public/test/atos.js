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
            console.log(stdout);
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

            if(stdout) {
                console.log(stdout);
                step.output = stdout;
            } else if (error){
                console.log(error);
                step.output = error;
            }

            if(step.expectedOutput) {
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
    var url = serverURL + reportAPI + testsuiteId;
    var data = JSON.stringify(result);
    console.log('#####################################');
    console.log(data);
    console.log('#####################################');
    data = data.replace(/"/g, '\\"');
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

function getFileName(filePath) {
    if(filePath) {
        var sepr = filePath.lastIndexOf("/");
        return filePath.substr(sepr+1);
    }

    return filePath;
};
