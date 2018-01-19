var xhr = new XMLHttpRequest();
var testcases = null;
var testcaseList = null;
var table = null;
var tcIdGroup = null;
var testsuite = null;

/*
function ajaxAddHandler() {
    if(xhr.readyState === 4 && xhr.status === 200) {
        document.write(xhr.responseText);
    }
};
*/

function ajaxShowHandler() {
    if(xhr.readyState === 4 && xhr.status === 200) {
        testcaseList = JSON.parse(xhr.responseText);
        tcIdGroup = [];

        table.innerHTML += '<tr>';
        for(var i=0; i<testcaseList.length; i++) {
            var num = i+1;
            var id = testcaseList[i].id;
            var name = testcaseList[i].name;
            var tags = testcaseList[i].tags;
            var auto = testcaseList[i].autoVerification;
            var output = '<td>' + num + '</td>' + 
                '<td>' + '<input type="checkbox" id="' + id + '">' + '</td>' + 
                '<td>' + id + '</td>' + 
                '<td>' + name + '</td>' + 
                '<td>' + tags + '</td>' + 
                '<td>' + auto + '</td>' + 
                '<td>' +
                '<a href="/get/testcase/html/' + id + '">' +
                'edit' + '</a>' + '&nbsp' + 
                '<a href="/delete/testcase/' + id + '">' +
                'delete' + '</a>' +
                '</td>';
            tcIdGroup.push(id);
            table.innerHTML += output;
        }

        table.innerHTML += '</tr>';
    }
};

function ajaxJSONHandler() {
    if(xhr.readyState === 4) {
        if(xhr.status !== 200) {
            alert('Error: ' + xhr.status);
        } else {
            var html = '<html><head></head><body>';
            html += '<h1> User Guide </h1>';
            html += '<h2> wget ' + location.host + '/test/atos.js </h2>';
            html += '<h2> nodejs atos.js --server http://' + location.host + ' --id ' + testsuite.id + '</h2><br></ hr>';
            html += '<h2> Result </h2>';
            html += '<h2> URL: http://' + location.host + '/get/testsuite/html/' + testsuite.id + '</h2>';
            html += '<h2> Delete Result: http://' + location.host + '/delete/testsuite/' + testsuite.id + '</h2>';
            html += '<h2> Show Json Result: http://' + location.host + '/get/testsuite/' + testsuite.id + '</h2>';
            html += '</body></html>'; 
            document.write(html);
        }
    }
};

function getTestCaseHandler() {
    if(xhr.readyState === 4) {
        if(xhr.status === 200) {
            var testcase = JSON.parse(xhr.responseText); 

            if(testcase) {
                testsuite.list.push(testcase);
            }
            else {
                bAllRequestSuccess = false;
            }

            callNumber++;
            getTestCase(callNumber);
        }
        else {
            bAllRequestSuccess = false;
        }
    }
};

function showHandler() {
    xhr.onreadystatechange = ajaxShowHandler;
    xhr.open('GET', '/get/testcase', true);
    xhr.send();
};

function addHandler() {
    /*
    xhr.onreadystatechange = ajaxAddHandler;
    xhr.open('GET', '/add/testcase/html', true);
    xhr.send();
    */

    var url = '/add/testcase/html';
    location.href = url;
};

var callNumber = 0;
var bAllRequestSuccess = true;

function getTestCase() {
    console.log('callNumber: ' + callNumber);
    if(callNumber < tcIdGroup.length) {
        var checkBox = table.querySelector('#' + tcIdGroup[callNumber]);
        console.log('tcid: ' + tcIdGroup[callNumber]);
        console.log('checked: ' + checkBox.checked);
        if(checkBox.checked === true) {
            xhr.onreadystatechange = getTestCaseHandler;
            xhr.open('GET', '/get/testcase/' + checkBox.id, true);
            xhr.send();
        }
        else {
            callNumber++;
            getTestCase();
        }
    }
    else if(bAllRequestSuccess && (testsuite.list.length > 0)) {
        var body = JSON.stringify(testsuite);
        console.log('testsuite: ' + body);
        xhr.onreadystatechange = ajaxJSONHandler;

        try {
            var url = '/create/testsuite';
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            xhr.send(body);

        } catch (e) {
            alert("not JSON");
        }
    }
};

function testHandler() {
    testsuite = {};
    testsuite.id = Math.round(+new Date()/1000);
    testsuite.list = [];
    callNumber = 0;
    getTestCase(callNumber);
};

function init() {
    testcases = document.querySelector('#testcases');
    table = testcases.querySelector('#table');

    if(table == null) {
        alert('null');
    }

    document.querySelector('#all').addEventListener('click', showHandler);
    document.querySelector('#add').addEventListener('click', addHandler);
    document.querySelector('#test').addEventListener('click', testHandler);
}

window.addEventListener('load', init);
