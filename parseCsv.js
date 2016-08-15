/*#################################################################*/
/*#################################################################*/
// Aurthor:
//			s0ba
// Date:
//			Aug 15 2016
// Summary:
// 			parseCsv.js takes a csv file containing lottery
//			draws, parses them and then filters to return an
//			object containing unix date of draw and that dates
//			lottery results.
/*#################################################################*/
/*#################################################################*/

/*#################################################################*/
// 	Node Modules
/*#################################################################*/
var fs = require('fs');
var parser = require('csv-parser')
var emitter = new(require('events').EventEmitter);


/*#################################################################*/
// 	Global Variables
/*#################################################################*/
var _data = [],
    _newDate;

/*#################################################################*/
// 	FUNCTIONS
// --------------------------------------------------------------- //
// --------------------------------------------------------------- //
// 	Convert date string in csv file to unix time. Works by replacing
// 	month in date string with its corresponding indexOf position in
// 	the _MONTHS array below. This new object is then converted to a
// 	string and passed into the Date.parse() function. The value of
// 	which is then returned.
// --------------------------------------------------------------- //
function _ConvertDate(dateStr) {
    var _MONTHS = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    var _month,
        _day,
        _dateStrArr,
        _newDateNum;

    _dateStrArr = dateStr.split('-');
    _month = _dateStrArr[1];
    _day = _dateStrArr[0];
    _dateStrArr[0] = (_MONTHS.indexOf(_month) + 1);
    _dateStrArr[1] = _day;
    _newDateNum = Date.parse(_dateStrArr.toString());

    return _newDateNum
}

// --------------------------------------------------------------- //
// 	Function parses and filters data returned from the csv-parser
// 	module in the getData function. Using reduce it creates a new
// 	array and pushes an obj for each element within passed data array
//	This object has drawDate (unix-time) and results (array of
//	results). This object is returned to the invoking parent
//	function.
// --------------------------------------------------------------- //
parseCSV = function ParseCSV(data) {
    var resultregEx = /Ball\ \d/,
        bBallregEx = /$Ball/;

    var lotteryDraws = data.reduce(function(draw, numbers) {
        var _unixDate,
            _drawArr = [],
            _drawObj = {};

        if (numbers.hasOwnProperty('DrawDate')) {
            _unixDate = _convertDate(numbers.DrawDate);
            _drawObj.drawDate = _unixDate;
        }

        for (key in numbers) {
            if (numbers.hasOwnProperty(key) && resultregEx.test(key)) {
                _drawArr.push(numbers[key]);
            }
        }

        _drawArr.push('bb', (numbers.hasOwnProperty('Bonus Ball')) ? numbers['Bonus Ball'] : null);
        _drawObj.results = _drawArr;
        draw.push(_drawObj);
        return draw
    }, [])

    console.log(lotteryDraws);
    return (lotteryDraws);
}

// --------------------------------------------------------------- //
//	Function creates a node.js read stream, and pipes that to parse
//	csv-paser module. Sets up event listners for 'data' and 'end'.
//	The latter used to emit a custom event for when the data from
//	the csv file is ready to be parsed and filtered by parseCSV
//	function above.
// --------------------------------------------------------------- //
getData = function GetData(url) {
        stream = fs.createReadStream(url)
            .pipe(parser())
            .on('data', function(data) {
                _data.push(data);
            })
            .on('end', function() {
                console.log('finished parsing csv')
                emitter.emit('ready')
            })
            .on('error', function(err) {
                console.log('problem reading from csv.. error: ', error);
            })
    }
    // ------------------------------------------------------------------
    // 	FUNCTIONS END
    /*#################################################################*/

csvData = getData('datasets/lotto-draw-history.csv');

/*#################################################################*/
// 	Event listner for custome 'ready' event fired by the emitter
//	object.
/*#################################################################*/
emitter.on('ready', function() {
    // console.log(_data);
    parsedCSV = parseCSV(_data);
})
