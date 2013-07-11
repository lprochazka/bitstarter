#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlFile) {
    return cheerio.load(fs.readFileSync(htmlFile));
};

var cheerioUrl = function(url) {
    return cheerio.load(url);
};

var loadChecks = function(checksFile) {
    return JSON.parse(fs.readFileSync(checksFile));
};

var checkUrl = function(htmlUrl, checksFile) {
    restler.get(htmlUrl).on('complete', function(result) {
        if (result instanceof Error) {
            console.log('Error: ' + result.message);
        } else {
            var checkJson = procesUrl(result, program.checks);
            var outJson = JSON.stringify(checkJson, null, 4);
            console.log(outJson);
        }
    });
}

var procesUrl = function(url, checksfile) {
    $ = cheerioUrl(url);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
// Workaround for commander.js issue.
// http://stackoverflow.com/a/6772648
    return fn.bind({});
};
if (require.main == module) {
    program
            .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
            .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
            .option('-u, --url <url>', 'Url to index.html')
            .parse(process.argv);
    var checkJson;
    if (program.url) {
        checkJson = checkUrl(program.url, program.checks);
    } else if (program.file) {
        checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}