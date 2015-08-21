var $ = require('jquery')(require('jsdom').jsdom().parentWindow);
var http = require('http');
var fs = require('fs');
var csv = require('csv-write-stream')
 
function toCSV(resHeaders, resData) {
    var csvString = resHeaders.toString() + ',' + resData.toString();
    console.log(csvString);
}

function scrapeTableHeaders(html) {
    var resHeaders = [];
    $(html).find('.tableSubHead:last td').each(function () {
        resHeaders[resHeaders.length] = $(this).text();
    });
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
    for(var i = 2; i < 1783; i += 9) {
        console.log('before:' + resData[i] + '(i = ' + i + ')');
        if(resData[i] === 'D/ST') {
            i += 8;
            continue;
        }

        var team = resData[i].toString().split('');
        var tmp = '';
        team.forEach(function (currentValue, index) {
            if(currentValue === ' ') {
                team.splice(index, 1);
            }
            tmp += team[index].toString();
        });
        console.log('after:' + tmp + '(i = ' + i + ')');
        resData[i] = tmp;
    }

    resData.forEach(function(currentValue, index) {
        //console.log(resData[index]);
    });
    
    return '';
}

var html = '';
http.get('http://games.espn.go.com/ffl/livedraftresults?position=ALL', function(res) {
    res.on('data', function(data) { 
        html += data; 
    }).on('end', function () {

        console.log('starting.');
        var resHeaders = scrapeTableHeaders(html);
        console.log(resHeaders);
        console.log(resData);
        var resData = scrapeTableData(html);
        //toCSV(resHeaders, resData);
        console.log('completed.');
    });
});
