"use-strict";

// let db = require('./db'),
const globalConfig = require('../dlaas/config');
const mongoose = require("mongoose");
process.env.ENGINE_NAME = 'ANALYTICS'
process.env.ENV = 'DEV';
const express = require("express");
const schema = require("./schema");

StatisticsSchema = new mongoose.Schema(schema.dbSchema['statistics']);

try{
    let options = { 
        poolSize:10,
        keepAlive: 1,
        // user: globalConfig[process.env.ENV][process.env.ENGINE_NAME]['MONGO_DB_USER'],
        // pass: globalConfig[process.env.ENV][process.env.ENGINE_NAME]['MONGO_DB_PASSWORD']
    };
    mongoose.Promise = global.Promise;

    mongoose.connect('mongodb://' + globalConfig[process.env.ENV][process.env.ENGINE_NAME]['MONGO_DB_IP'] + '/' + globalConfig[process.env.ENV][process.env.ENGINE_NAME]['DB_NAME']+"?authSource=admin", options);
}
catch (ex) {
    console.log(ex);
}
StatisticsSchema.statics = {
  saveStats: function (data, isMany) {
    if (isMany) {
      return this.insertMany(data).then((res) => {
        return res;
      })
    }
    else {
      return this.create(data).then((res) => {
          console.log(data)
        return res;
      })
    }
  }
//   get: function (criteria, columns) {
//     return this.find(criteria, columns).exec();
//   },
//   removeUser: function (criteria) {
//     return this.deleteOne(criteria).exec()
//   },
//   getPopulate: function (criteria, columns) {
//     return this.find(criteria, columns).populate('companyId').exec();
//   },
//   updateRecord: function (criteria, columns, columnsProjection) {
//     return this.findOneAndUpdate(criteria, { $set: columns }, { new: true, projection: columnsProjection }, (err, doc) => {
//       if (err) {
//         console.log("Something wrong when updating data!");
//       }
//       console.log(doc);
//     });
//   }
}

let Stats = mongoose.model('Statistics', StatisticsSchema);
module.exports = Stats