var $ = require('jquery')(require('jsdom').jsdom().parentWindow);
var http = require('http');
var fs = require('fs');
var csv = require('csv-write-stream')
var os = require('os');

/**
 * dev function for logging to console the contents of data
 */
function logData(data) {
    data.forEach(function (currentValue, index) {
        console.log(index + ':' + currentValue);
    });
}

/**
 * check to see if a number is the first entry in a record.
 * kind of a botched check, needs to be an int that doesn't 
 * have '+', '.', and '-' in it.
 */
function isFirstEntry(n) {
    if (Number(n) % 1 === 0 && 
        n.charCodeAt(1) != 46 &&
        n.charCodeAt(2) != 46 && // need to make these three checks
        n.charCodeAt(3) != 46 && // because n.indexOf('.') won't work
        n.indexOf('+') && 
        n.indexOf('-')) {
        console.log(n.charCodeAt(3));
        return 1;
    }
}
/**
 * doesn't currently use csv-write-stream. probably need to use it
 * to make it easier to write out each individual record, right now
 * it has no line breaks so if you open it up in a csv viewer you'll
 * see one massive record with 1783 columns. which sucks.
 */
function toCSV(headers, data) {
    var csvData = headers.toString() + ',' + data.toString();
    var csvPath = 'position_all.csv';

    fs.writeFile(csvPath, csvData, function (err) {
        if (err) throw err;
    });
    
    console.log('successfully saved to ' + csvPath);
}

function scrapeTableHeaders(html) {
    var headers = [];
    $(html).find('.tableSubHead:last td').each(function () {
        headers[headers.length] = $(this).text();
    });

    /**
     * send data toString() and then parse it back into array
     * to separate Player, Team entry. also, I already know this 
     * entry will be ' TEAM' so I'm basically a liar.
     */
    headers = headers.toString().split(',');
    headers[2] = 'TEAM';

    return headers;
}

function scrapeTableData(html) {
    data = [];
    $(html).find('table .tableBody:first td').each(function () {
        if(!$(this).parent('tr').hasClass('tableSubHead') &&
           !$(this).parent('tr').hasClass('tableHead')) {
            if (isFirstEntry($(this).text())) {
                data.push('\n');
            }
            data.push($(this).text());
            console.log($(this).text());
            console.log('-------------');
        }
    });

    /**
     * now clean them puppies up
     */
    data.forEach(function (currentValue, index) {
        if(currentValue === '') {
            data.splice(index, 1);
        }
    });

    /**
     * send data toString() and then parse it back into array
     * to separate Player, Team entry
     */
    data = data.toString().split(',');

    /**
     * every team entry has a space that should be deleted.
     *
     * before: ' NE'
     * after: 'NE'
     */
    data.forEach(function (currentValue, index) {
        var singleEntry = data[index].toString().split('');
        var tmp = '';
        singleEntry.forEach(function (currentValue, index) {
            if(singleEntry[0] === ' ') {
                singleEntry.splice(index, 1);
            }
            tmp += singleEntry[index].toString();     
        });
        data[index] = tmp;
    });
    
    /*
    data.forEach(function (currentValue, index) {
        if(isFirstEntry(currentValue)) {
            console.log('would have found this entry ' + currentValue + ' at index ' + index + ' - typeof: ' + typeof(currentValue));
        }
    });
    */

    return data;
}

var html = '';
http.get('http://games.espn.go.com/ffl/livedraftresults?position=ALL', function(res) {
    res.on('data', function(data) { 
        html += data; 
    }).on('end', function () {

        console.log('starting fantasy-adp-csv.');
        var headers = scrapeTableHeaders(html);
        var data = scrapeTableData(html);
        toCSV(headers, data);
    });
});
