const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("./db/db.json");
const db = low(adapter);

function NextID() {
    return db.get("posts").size().value() + 1;
}

function IsFree(activator) {
    return db.get("posts").find({ activator }).value() == undefined;
}

function Get(activator) {
    if (IsFree(activator)) {
        return false;
    }
    return db.get("posts").find({ activator }).value();
}

function GetText(activator) {
    const get = Get(activator);
    if (get) {
        return get.text;
    } else {
        return false;
    }
}

function Add(activator, text) {
    if (!IsFree(activator)) return false;
    else {
        db.get("posts")
            .push({
                id: NextID(),
                activator: activator,
                text: text,
            })
            .write();

        return true;
    }
}

function Remove(keyword) {
    db.get("posts").remove({ keyword }).write();
}

// Set some defaults
db.defaults({ posts: [] }).write();

exports.Get = Get;
exports.IsFree = IsFree;
exports.Add = Add;
exports.Remove = Remove;
exports.GetText = GetText;
