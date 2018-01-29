var xhr = null;
var tcid = null;
var tcname = null;
var tags = null;
var VerificationType = null;
var description = null;
var output = null;
var table = null;

function addRowHandler() {
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    var colCount = table.rows[0].cells.length;

    for(var i=0; i<colCount; i++) {
        var newcell = row.insertCell(i);
        newcell.innerHTML = table.rows[1].cells[i].innerHTML;

        switch(newcell.childNodes[0].type) {
            case "text":
                newcell.childNodes[0].value = '';
                break;
            case "checkbox":
                newcell.childNodes[0].checked = false;
                break;
        }
    }
};

function deleteRowHandler() {
    try {
        var rowCount = table.rows.length;

        for(var i=0; i<rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];
            if(null != chkbox && true == chkbox.checked) {
                if(rowCount <= 1) {
                    alert("Cannot delete all the rows.");
                    break;
                }
                table.deleteRow(i);
                rowCount--;
                i--;
            }
        }
    }catch(e) {
        alert(e);
    }
};

function exportToHandler() {
    var steps = getScenario();
    output.value = JSON.stringify(steps);
};

function ajaxJSONHandler() {
    if(xhr.readyState === 4) {
        if(xhr.status !== 200) {
            alert('Error: ' + xhr.status);
        } else {
            var url = '/index.html';
            location.href = url;
        };
    }
};

function createHandler() {
    var testcase = {};
    testcase.id = tcid.value;
    testcase.name = tcname.value;
    testcase.tags = tags.value;

    if(VerificationType.value === 'Auto')
        testcase.autoVerification = true;
    else
        testcase.autoVerification = false;
    testcase.description = description.value;

    var array = $.parseJSON(output.value);
    console.log('array size: ' + array.length);
    testcase.scenario = array;

    var body = JSON.stringify(testcase);

    try { 
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = ajaxJSONHandler;

        var url = '/create/testcase';
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(body);
    } catch (e) {
        alert("not JSON: " + body);

        document.write(e);
    }
};

function updateHandler() {
    var testcase = {};
    testcase.id = tcid.value;
    testcase.name = tcname.value;
    testcase.tags = tags.value;

    if(VerificationType.value === 'Auto')
        testcase.autoVerification = true;
    else
        testcase.autoVerification = false;
    testcase.description = description.value;

    var array = $.parseJSON(output.value);
    console.log('array size: ' + array.length);
    testcase.scenario = array;

    var body = JSON.stringify(testcase);

    try { 
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = ajaxJSONHandler;

        var url = '/update/testcase/' + testcase.id;
        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(body);

    } catch (e) {
        alert("not JSON: " + body);

        document.write(e);
    }
};


function getScenario() {
    var stepArray = [];
    var rowLength = table.rows.length;
    for (var i = 1; i < rowLength; i++){
        var step = {};
        var cells = table.rows.item(i).cells;
        var cellLength = cells.length;
        for(var j = 0; j < cellLength; j++){
            var tdInput = cells.item(j).querySelector("input");
            var tdSelect = cells.item(j).querySelector("select");

            if(tdInput) {
                var cellVal = tdInput.value
            } else if(tdSelect) {
                var cellVal = tdSelect.value
            }

            if(j === 1) {
                step.input = cellVal;
            } else if (j === 2) {
                step.expectedOutput = cellVal;
            } else if (j === 3) {
                step.expectedFile = cellVal;
            } else if (j === 4) {
                step.fileType = cellVal;
            }
        }

        stepArray[i-1] = step;
    }

    return stepArray;
};

function cancelHandler() {
    var url = '/index.html';
    location.href = url;
};

function init() {
    tcid = document.querySelector('#tcid');
    tcname = document.querySelector('#name');
    tags = document.querySelector('#tags');
    VerificationType = document.querySelector('#VerificationType');
    description = document.querySelector('#description');
    output = document.querySelector('#output');
    table = document.querySelector('#dataTable');

    document.querySelector('#addRow').addEventListener('click', addRowHandler);
    document.querySelector('#deleteRow').addEventListener('click', deleteRowHandler);
    document.querySelector('#exportTo').addEventListener('click', exportToHandler);
    document.querySelector('#create').addEventListener('click', createHandler);
    document.querySelector('#update').addEventListener('click', updateHandler);
    document.querySelector('#cancel').addEventListener('click', cancelHandler);
}

window.addEventListener('load', init);
