var xhr = new XMLHttpRequest();
var tcid = null;
var tcname = null;
var tags = null;
var VerificationType = null;
var description = null;
var scenario = null;
var bTemplate = false;

function clearScreen() {
    tcid.value = '';
    tcname.value = '';
    tags.value = '';
    VerificationType.value = '';
    description.value = '';
    scenario.value = '';
};

function ajaxJSONHandler() {
    if(xhr.readyState === 4) {
        if(xhr.status !== 200) {
            alert('Error: ' + xhr.status);
        } else {
            var url = '/admin.html';
            location.href = url;
        };
    }
};

function saveHandler() {
    var testcase = {};
    testcase.id = tcid.value;
    testcase.name = tcname.value;
    testcase.tags = tags.value;

    if(VerificationType.value === 'Auto')
        testcase.autoVerification = true;
    else
        testcase.autoVerification = false;
    testcase.description = description.value;

    var array = $.parseJSON(scenario.value);
    console.log('array size: ' + array.length);
    testcase.scenario = array;

    var body = JSON.stringify(testcase);

    try {
        xhr.onreadystatechange = ajaxJSONHandler;
        if(bTemplate === true){
            var url = '/create/testcase';
            xhr.open('POST', url, true);
        }
        else {
            var url = '/update/testcase/' + testcase.id;
            xhr.open('PUT', url, true);
        }
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(body);
    } catch (e) {
        alert("not JSON");
    }
};

function cancelHandler() {
    clearScreen();
};

function isTemplate() {
    if(tcid.value == '') {
        bTemplate = true;
    }

    return bTemplate;
};

function initScreen() {
    tcid.value = 'tc-';
    tcname.value = 'testcase name';
    tags.value = 'tag1;tag2';
    VerificationType.value = 'Auto';
    description.value = 'describe about your testcase';
    scenario.value = '[{"input":"input step 1", "expectedOutput": "input file path if it is manual", "outputType":"image"},{"input":"input step 2"}, {"expectedOutput": "input file path if it is manual", "outputType":"text"}]';
};

function init() {
    tcid = document.querySelector('#tcid');
    tcname = document.querySelector('#name');
    tags = document.querySelector('#tags');
    VerificationType = document.querySelector('#VerificationType');
    description = document.querySelector('#description');
    scenario = document.querySelector('#scenario');

    document.querySelector('#save').addEventListener('click', saveHandler);
    document.querySelector('#cancel').addEventListener('click', cancelHandler);

    if(isTemplate() === true) {
        initScreen();
    }
}

window.addEventListener('load', init);


