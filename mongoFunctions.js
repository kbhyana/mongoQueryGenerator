const globalConfig = require('../dlaas/config');
const mongoose = require("mongoose");
process.env.ENGINE_NAME = 'ANALYTICS'
process.env.ENV = 'DEV';
let collection;
const functions = [
    "count",
    "sum",
    "avg"
]
let getDataFromMongo = async function getDataFromMongo(functionId, parameters) {
    let result;
    try {
        let options = {
            poolSize: 10,
            keepAlive: 1,
            // user: globalConfig[process.env.ENV][process.env.ENGINE_NAME]['MONGO_DB_USER'],
            // pass: globalConfig[process.env.ENV][process.env.ENGINE_NAME]['MONGO_DB_PASSWORD']
        };
        mongoose.Promise = global.Promise;

        await mongoose.connect('mongodb://' + globalConfig[process.env.ENV][process.env.ENGINE_NAME]['MONGO_DB_IP'] + '/' + globalConfig[process.env.ENV][process.env.ENGINE_NAME]['DB_NAME'] + "?authSource=admin", options)
        let db = mongoose.connection;
        const collection = db.collection('customers');
        let columnNameIndex = findColumnNameIndex(parameters, 0)
        let columnName = parameters.substring(1, columnNameIndex);
        let mongoObj = mongoQueryObject(parameters, columnNameIndex, columnName, functionId);
        if (functionId === 0) {
            result = await collection.find(mongoObj).count();
        }
        else {
            let resultObj = await collection.aggregate(mongoObj).toArray();
            result = resultObj[0].total
        }
    }
    catch (ex) {
        console.log(ex);
    }
    return result;
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

module.exports = {
    getDataFromMongo: getDataFromMongo
}