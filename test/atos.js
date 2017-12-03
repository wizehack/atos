var exec = exec = require('child_process').exec;
var run = true;
var testsuiteURL = null;
var cmd = null;
var testsuite = null;
var resultURL = null;

var cmd = 'nodejs atos.js --server url';
process.argv.forEach(function (val, index, array) {
    if(run) {
        if(array.length < 4) {
            console.log(cmd);
            run = false;
            return;
        }

        if( (index === 2) && (val !== '--server')) {
            console.log(cmd);
            run = false;
            return;
        }

        if(index === 3) {
            testsuiteURL = val;
        }
    }
});

cmd = 'curl ' + testsuiteURL;

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

        if(testsuite){
            var id = testsuite.id;
            var startPoint = 0;
            var endPoint = testsuiteURL.indexOf(id);
            var url = testsuiteURL.substr(startPoint, endPoint);
            resultURL = url + 'html/' + id;
            console.log(resultURL);

            var tcList = testsuite.list;
            for(var i=0; i<tcList.length; i++) {
                var testcase = tcList[i];
                var scenario = testcase.scenario;

                console.log('----------------------');
                console.log('TCID: ' + testcase.id);
                console.log('----------------------');
                for(var j=0; j<scenario.length; j++) {
                    var step = scenario[j];
                    runStep(step);
                } //for j
            } // for i
        }

    });
}

function runStep(step) {
    if(step.input) {
        console.log(step.input);
    }

    if(step.expectedOutput) {
        console.log(step.expectedOutput);
    }

    if(step.outputType === 'txt') {
        console.log(step.outputType);
    }
    else if(step.outputType === 'file') {
        console.log(step.outputType);

        if(step.fileType === 'img') {
        }
        else if(step.fileType === 'txt') {
        }
    }
}

//console.log(server);
