var $ = require('jquery')(require('jsdom').jsdom().parentWindow);
var http = require('http');
var fs = require('fs');
var csv = require('csv-write-stream')

/**
 * dev function for logging to console the contents of resData
 */
function logData(data) {
    data.forEach(function (currentValue, index) {
        console.log(data[index] + ':' + currentValue);
    });
}
 
function toCSV(resHeaders, resData) {
    var csvData = resHeaders.toString() + ',' + resData.toString();
    var csvPath = "position_all.csv";
    fs.writeFile(csvPath, csvData, function(err) {
        if (err) throw err;
        console.log('successfully saved file ' + csvPath);
    }); 
}

function scrapeTableHeaders(html) {
    var resHeaders = [];
    $(html).find('.tableSubHead:last td').each(function () {
        resHeaders[resHeaders.length] = $(this).text();
    });

    /**
     * send resData toString() and then parse it back into array
     * to separate Player, Team entry
     *
     * I already know this entry will be ' TEAM' so I'm basically a liar
     */
    resHeaders = resHeaders.toString().split(',');
    resHeaders[2] = 'TEAM';

    return resHeaders;
}

function scrapeTableData(html) {
    resData = [];
    $(html).find('table .tableBody:first td').each(function () {
        if(!$(this).parent('tr').hasClass('tableSubHead') &&
           !$(this).parent('tr').hasClass('tableHead')) {
            resData[resData.length] = $(this).text();
        }
    });

    /**
     * now clean them puppies up
     */
    resData.forEach(function (currentValue, index) {
        if(currentValue === '') {
            resData.splice(index, 1);
        }
    });

    /**
     * send resData toString() and then parse it back into array
     * to separate Player, Team entry
     */
    resData = resData.toString().split(',');

    /**
     * Starting at resData[10] every row has a Player, Team
     * entry that I want to delete a space from. Kind of lucky
     * how it worked out the way it did. Pretty easy
     */
    resData.forEach(function (currentValue, index) {
        var singleEntry = resData[index].toString().split('');
        var tmp = '';
        singleEntry.forEach(function (currentValue, index) {
            if(singleEntry[0] === ' ') {
                singleEntry.splice(index, 1);
            }
            tmp += singleEntry[index].toString();     
        });
        resData[index] = tmp;
    });
    
    return resData;
}

var html = '';
http.get('http://games.espn.go.com/ffl/livedraftresults?position=ALL', function(res) {
    res.on('data', function(data) { 
        html += data; 
    }).on('end', function () {

        console.log('starting fantasy-adp-csv.');
        var resHeaders = scrapeTableHeaders(html);
        var resData = scrapeTableData(html);
        toCSV(resHeaders, resData);
    });
});
