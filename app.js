var $ = require('jquery')(require('jsdom').jsdom().parentWindow);
var http = require('http');
var fs = require('fs');
var os = require('os');
var nconf = require('nconf');

/**
 * setup config file
 */
nconf.file({file: './config.json'});
var tables = nconf.get('tables');
for (var key in tables) {
    if (tables.hasOwnProperty(key)) {
        getTable(key, tables[key]);
    }
}

/**
 * get table based on url found in config file
 *
 * args:
 * pos - position table that's being drawn from
 * url - url for the table to pull from
 */
function getTable(pos, url) {
    var html = '';
    http.get(url, function(res) {
        res.on('data', function(data) { 
            html += data; 
        }).on('end', function () {
            console.log('getting table ' + pos + '...');
            var headers = scrapeTableHeaders(html);
            var data = scrapeTableData(html);
            var csvPath = toCSV(pos, headers, data);
            console.log('successfully saved data to ' + csvPath);
        });
    });
}

/**
 * pull table headers from the top
 *
 * args:
 * html - raw html from http get request
 */
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

/**
 * pull table data
 *
 * args:
 * html - raw html from http get request
 */
function scrapeTableData(html) {
    data = [];
    $(html).find('table .tableBody:first td').each(function () {
        if(!$(this).parent('tr').hasClass('tableSubHead') &&
           !$(this).parent('tr').hasClass('tableHead')) {
            if (isFirstEntry($(this).text())) {
                data.push('\n');
            }
            data.push($(this).text());
        }
    });

    /**
     * now clean them puppies up (get rid of last '' entry)
     */
    data.forEach(function (currentValue, index) {
        if(currentValue === '') {
            data.splice(index, 1);
        }
    });

    /**
     * send data toString() and then parse it back into array
     * by split(',') to separate Player, Team entry
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

    return data;
}

/**
 * check to see if a number is the first entry in a record.
 * kind of a botched check, needs to be an int that doesn't 
 * have '+', '.', and '-' in it.
 *
 * args:
 * entry - the entry to check
 */
function isFirstEntry(entry) {
    if (Number(entry) % 1 === 0 && 
        entry.charCodeAt(1) != 46 &&
        entry.charCodeAt(2) != 46 && // need to make these three checks
        entry.charCodeAt(3) != 46 && // because n.indexOf('.') won't work
        entry.indexOf('+') && 
        entry.indexOf('-')) {
        return true;
    }
}

/**
 * doesn't currently use csv-write-stream. probably need to use it
 * to make it easier to write out each individual record, right now
 * it has no line breaks so if you open it up in a csv viewer you'll
 * see one massive record with 1783 columns. which sucks.
 *
 * args:
 * pos - position table that's been drawn from
 * headers - headers from the table
 * data - data from the table
 */
function toCSV(pos, headers, data) {
    var csvData = headers.toString() + ',' + data.toString();
    if(pos === 'd/st') {
        pos = 'd-st';
    }
    var csvPath = 'position_' + pos + '.csv';

    /**
     * to solve ',,' problem, go through csvData and splice all 
     * instances of ',,'
     *
     * doesn't work, should probably fix, you know...
     */
    csvData = csvData.toString().replace(',,', '');

    fs.writeFile(csvPath, csvData, function (err) {
        if (err) throw err;
        var newPath = 'csv/' + csvPath;
        fs.rename(csvPath, newPath, function(err) {
            if (err) throw err;
            console.log('moved ' + csvPath + ' to ' + newPath);
        });
    });

    return csvPath;
}

/**
 * dev function for logging to console the contents of data
 *
 * args:
 * data - data to log (headers or data)
 */
function logData(data) {
    data.forEach(function (currentValue, index) {
        console.log(index + ':' + currentValue);
    });
}
