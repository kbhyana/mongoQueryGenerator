let mongo = require('./mapQuery');
let Stats = require('./statistics');
const response = {
    "stat": "NPS",
    "type": "Overall",
    "formula": "((avg(@rmr.numerical > 6) - count(@recommendCompany <=6))/sum(@recommendCompany))*100",
    "createdBy": "kbhyana@gmail.com",
    "modifiedBy": "kbhyana@gmail.com",
};

const functions = [
    "count",
    "sum",
    "avg"
]

let finalQueryGenerator = async function (input) {
    response['formulaParsed']={};
    if (input.length == 0) return null;
    if (input.length == 1) return input[0];
    for (let s = 0, count =1;  s < input.length;) {
        if (isLetter(input[s])) {
            let arrayLength = functions.length;
            for (let i = 0; i < arrayLength; i++) {
                if (input.substr(s, functions[i].length) === functions[i]) {
                    let jumpingIndex = findClosingBracketMatchIndex(input, s + functions[i].length);
                    let parameters = input.substring(s + functions[i].length + 1, jumpingIndex);
                    token1 = 'query'+count.toString();
                    response['formulaParsed'][token1] = {};
                    let columnNameIndex = findColumnNameIndex(parameters, 0)
                    let columnName = parameters.substring(1, columnNameIndex);        
                    let mongoObj = mongoQueryObject(parameters, columnNameIndex, columnName, i);                    
                    // console.log(mongoObj);
                    input = input.replace(input.substr(s, jumpingIndex - s + 1), token1);
                    console.log(input)
                    // console.log(input[s])
                    response['formulaParsed'][token1]['type'] = functions[i];
                    response['formulaParsed'][token1]['query'] = JSON.stringify(mongoObj);
                    // console.log(response)
                    count = count +1;
                }
            }
        }
        s=s+1;
    }
    return input;
}
function findColumnNameIndex(str, pos) {
    if (str[pos] != '@') {
        throw new Error("No '@' at index " + pos);
    }
    for (let i = pos + 1; i < str.length; i++) {
        if (str[i] == '>' || str[i] == '<' || str[i] == '=' || str[i] == '!=') {
            return i;
        }
    }
    return str.length;    // No matching closing parenthesis
}
function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function mongoQueryObject(parameters, columnNameIndex, columnName, functionId) {
    let expression = parameters.substring(columnNameIndex, parameters.length)
    let returnObjArray = [];
    let returnObj = {};
    let noNumberSymbol;
    expression.length === 0 ? noNumberSymbol = 1 : noNumberSymbol = 0;
    let number;
    let symbol;
    for (index in expression) {
        if (!isNaN(expression[index])) {
            let i = parseInt(index, 10) + 1;
            symbol = expression.substring(0, parseInt(index, 10))
            while (i < parameters.length && !isNaN(expression[i])) {
                i += 1;
            }
            number = expression.substring(parseInt(index, 10), i);
            index = i;
        }
    }
    if (functionId == 0) {
        if (noNumberSymbol === 1) {
            return returnObj;
        }
        else {
            switch (symbol) {
                case '>':
                    returnObj[columnName] = { '$gt': parseInt(number, 10) };
                    break;
                case '<':
                    returnObj[columnName] = { '$lt': parseInt(number, 10) };
                    break;
                case '>=':
                    returnObj[columnName] = { '$gte': parseInt(number, 10) };
                    break;
                case '<=':
                    returnObj[columnName] = { '$lte': parseInt(number, 10) };
                    break;
            }
            return returnObj;
        }
    }
    else {
        let groupObject = { '$group': { '_id': null, 'total': {} } }
        groupObject.$group.total['$' + functions[functionId]] = "$" + columnName;
        let matchObj = { '$match': {} };
        if (noNumberSymbol === 1) {
            returnObjArray.push(groupObject)
            return returnObjArray;
        }
        else {
            switch (symbol) {
                case '>':
                    returnObj[columnName] = { '$gt': parseInt(number, 10) };
                    matchObj['$match'] = returnObj;
                    break;
                case '<':
                    returnObj[columnName] = { '$lt': parseInt(number, 10) };
                    matchObj['$match'] = returnObj;
                    break;
                case '>=':
                    returnObj[columnName] = { '$gte': parseInt(number, 10) };
                    matchObj['$match'] = returnObj;
                    break;
                case '<=':
                    returnObj[columnName] = { '$lte': parseInt(number, 10) };
                    matchObj['$match'] = returnObj;
                    break;
            }
            returnObjArray.push(matchObj)
            returnObjArray.push(groupObject)
            return returnObjArray;
        }

    }
}

function findClosingBracketMatchIndex(str, pos) {
    if (str[pos] != '(') {
        throw new Error("No '(' at index " + pos);
    }
    let depth = 1;
    for (let i = pos + 1; i < str.length; i++) {
        switch (str[i]) {
            case '(':
                depth++;
                break;
            case ')':
                if (--depth == 0) {
                    return i;
                }
                break;
        }
    }
    return -1;    // No matching closing parenthesis
}
finalQueryGenerator(response.formula.replace(/\s/g, '')).then((result)=>{
    response['formulaParsed']['finalQuery'] = result;
    Stats.saveStats(response);
    // console.log(JSON.stringify(response));
})
