const mongoose = require('mongoose')
const Schema = mongoose.Schema;

let AccountSchema = new Schema({
    email: String,
    username: String,
    password: String,
    invitations:
    [
        {user : mongoose.ObjectId, room : mongoose.ObjectId}
    ],
    chatrooms: [mongoose.ObjectId],
});

let MessageSchema = new Schema({
    author: mongoose.ObjectId,
    content: String,
});

let ChatroomSchema = new Schema({
    name: String,
    members: [mongoose.ObjectId],
    messages: [mongoose.ObjectId],
});

module.exports = {
    Account : mongoose.model('Account', AccountSchema),
    Message : mongoose.model('Message', MessageSchema),
    Chatroom : mongoose.model('Chatroom', ChatroomSchema),
}