require("dotenv").config();
const { MongoClient } = require('mongodb');
url = process.env.MONGO_CONNECTION_STRING;
var client;

class MongoDb {
    constructor() { }

    //methods
    //might switch to module.exports; module.exports vs exports Simply setting exports wouldn't allow the 
    //function to be exported because node exports the object module.exports references.
    //https://techsparx.com/nodejs/async/asynchronous-mongodb.html
    //CRUD
    create = async function (dbName, colName, key, value) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        let result = await collection.insertOne({
            [key]: value
        });
        return result;
    }
    createAtRoot = async function (dbName, colName, value) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        let result = await collection.insertOne(value);
        return result;
    }
    read = async function (dbName, colName, key) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        return await collection.findOne({ [key]: { $exists: true } });
    }
    readAll = async function (dbName, colName) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        return await collection.find().toArray();
    }
    update = async function (dbName, colName, key, value) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        let result = await collection.updateOne({ [key]: { $exists: true } },
            { $set: { [key]: value } }, { upsert: true });
        return result;
    }
    insertIfNotFound = async function (dbName, colName, key, condition, value) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        if (!await collection.find({ [key]: condition }).count() > 0) {
            console.log("ACCEPTED"); //doesn't exist
            await collection.insertOne(value);
            return true;
        } else {
            console.log("REJECTED");
            return false;
        }
    }
    exists = async function (dbName, colName, key, condition) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        if (await collection.find({ [key]: { $exists: true } }).count() > 0) {
            console.log("EXISTS");
            return true;
        } else {
            console.log("DOESN'T EXIST");
            return false;
        }
    }
    doubleExists = async function (dbName, colName, key1, condition1, key2, condition2) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        if (await collection.find({ [key1]: condition1, [key2]: condition2 }).count() > 0) {
            console.log("DOUBLE EXISTS");
            return true;
        } else {
            console.log("DOUBLE DOESN'T EXIST");
            return false;
        }
    }
    doubleUpdate = async function (dbName, colName, key1, condition1, key2, condition2, keyValue, value) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        result = await collection.updateOne({ [key1]: condition1, [key2]: condition2 },
            { $set: { [keyValue]: value } });
        console.log("doubleUpdate result: " + JSON.stringify(result));
        return result != null;
    }
    existsInArray = async function (dbName, colName, key, condition) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        if (await collection.find({ [key]: { $in: [condition] } }).count() > 0) {
            console.log("EXISTS");
            return true;
        } else {
            console.log("DOESN'T EXIST");
            return false;
        }
    }
    updateArray = async function (dbName, colName, key, value) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        let result = await collection.updateOne({ [key]: { $exists: true } },
            { $push: { [key]: value } }, { upsert: false });
        return result;
    }
    destroy = async function (dbName, colName, key) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        return await collection.findOneAndDelete({ [key]: { $exists: true } });
    }
    destroySpecific = async function (dbName, colName, key, value) {
        const { db, client } = await connectDB(dbName);
        const collection = db.collection(colName);
        return await collection.findOneAndDelete({ [key]: value });
    }
}
async function connectDB(dbName, fun = null) {
    if (!client) client = await MongoClient.connect(url, { useNewUrlParser: true });
    return {
        db: client.db(dbName),
        client: client
    };
}
module.exports.init =  async function(fun = null) {
    if (!client) client = await MongoClient.connect(url, { useNewUrlParser: true });
    if (fun) fun();
}
module.exports.close =  async function() {
    if (client) client.close();
    client = undefined;
};

module.exports.mongoDb = new MongoDb();