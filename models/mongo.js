require("dotenv").config();
const { MongoClient } = require('mongodb');
const url = process.env.MONGO_CONNECTION_STRING;
var client;

//might switch to module.exports; module.exports vs exports Simply setting exports wouldn't allow the 
//function to be exported because node exports the object module.exports references.
//https://techsparx.com/nodejs/async/asynchronous-mongodb.html
module.exports.init = async function (fun = null) {
    if (!client) client = await MongoClient.connect(url, { useNewUrlParser: true });
    if (fun) fun();
}
async function connectDB(dbName, fun = null) {
    if (!client) client = await MongoClient.connect(url, { useNewUrlParser: true });
    return {
        db: client.db(dbName),
        client: client
    };
}
//CRUD
async function create(dbName, colName, key, value) {
    const { db, client } = await connectDB(dbName);
    const collection = db.collection(colName);
    let result = await collection.insertOne({
        [key]: value
    });
    return result;
}
async function createAtRoot(dbName, colName, value) {
    const { db, client } = await connectDB(dbName);
    const collection = db.collection(colName);
    let result = await collection.insertOne(value);
    return result;
}
async function read(dbName, colName, key) {
    const { db, client } = await connectDB(dbName);
    const collection = db.collection(colName);
    return await collection.findOne({ [key]: { $exists: true } });
}
async function readAll(dbName, colName) {
    const { db, client } = await connectDB(dbName);
    const collection = db.collection(colName);
    return await collection.find().toArray();
}
async function update(dbName, colName, key, value) {
    const { db, client } = await connectDB(dbName);
    const collection = db.collection(colName);
    let result = await collection.updateOne({ [key]: { $exists: true } },
        { $set: { [key]: value } }, { upsert: true });
    return result;
}
async function insertIfNotFound(dbName, colName, key, condition, value) {
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
async function exists(dbName, colName, key, condition) {
    const { db, client } = await connectDB(dbName);
    const collection = db.collection(colName);
    if (await collection.find({ [key]: condition }).count() > 0) {
        console.log("EXISTS");
        return true;
    } else {
        console.log("DOESN'T EXIST");
        return false;
    }
}
async function doubleExists(dbName, colName, key1, condition1, key2, condition2) {
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
async function doubleUpdate(dbName, colName, key1, condition1, key2, condition2, keyValue, value) {
    const { db, client } = await connectDB(dbName);
    const collection = db.collection(colName);
    result = await collection.updateOne({ [key1]: condition1, [key2]: condition2 },
        { $set: { [keyValue]: value } });
    console.log("doubleUpdate result: " + JSON.stringify(result));
    return result != null;
}
async function existsInArray(dbName, colName, key, condition) {
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
async function updateArray(dbName, colName, key, value) {
    const { db, client } = await connectDB(dbName);
    const collection = db.collection(colName);
    let result = await collection.updateOne({ [key]: { $exists: true } },
        { $push: { [key]: value } }, { upsert: false });
    return result;
}
async function destroy(dbName, colName, key) {
    const { db, client } = await connectDB(dbName);
    const collection = db.collection(colName);
    return await collection.findOneAndDelete({ [key]: { $exists: true } });
}

module.exports.close = async function close() {
    if (client) client.close();
    client = undefined;
};

module.exports.create = create;
module.exports.createAtRoot = createAtRoot;
module.exports.read = read;
module.exports.readAll = readAll;
module.exports.update = update;
module.exports.doubleUpdate = doubleUpdate;
module.exports.insertIfNotFound = insertIfNotFound;
module.exports.exists = exists;
module.exports.doubleExists = doubleExists;
module.exports.existsInArray = existsInArray;
module.exports.updateArray = updateArray;
module.exports.destroy = destroy;