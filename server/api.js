const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();

const CLIENT_PATH = path.join(__dirname, '..', 'client/');
const MONGO_URI = process.env.MONGO_URI;

const {Account, Chatroom} = require('./models');
const { report } = require('process');

mongoose.connect(MONGO_URI , {
    useNewUrlParser : true,
    useUnifiedTopology: true
});

router.use(express.static(CLIENT_PATH));
router.use(express.json())

//gets chat ids for a registered user
router.post('/getChats', async (req, res) => {
    let uid = req.body['uid'];
    let val = await Account.findById(uid);
    let resp = {};
    let status = 200;
    if(val != null){
        resp.status = 'SUCCESS';
        resp.content = {name : val.username, chatroomData : []};
        for(room in val.chatrooms){
            let roomVal = await Chatroom.findById(val.chatrooms[room]._id);
            append = {};
            append.id = val.chatrooms[room]._id;
            append.name = roomVal.name;
            append.members = [];
            for (member in roomVal.members){
                append.members.push(roomVal.members[member]._id);
            }
            resp.content.chatroomData.push(append);
        }
    } else {
        resp.status = 'FAILED';
        resp.content = {comment : 'Invalid UID'};
        status = 400;
    }
    res.status(status).json(resp);
});

router.post('/addChat', async (req, res) => {
    let uid = req.body['uid'];
    let acctVal = await Account.findById(uid);
    let resp = {};
    let status = 200;

    let chatName = req.body['name'];
    if(acctVal != null){
        let tempRoom = new Chatroom({name : chatName, members : [uid], messages : []});
        tempRoom.save();
        acctVal.chatrooms.push(tempRoom._id);
        acctVal.save();
        resp.status = 'SUCCESS';
    } else {
        resp.status = 'FAILED';
        resp.content.comment = 'Invalid UID';
        status = 400;
    }
    res.status(status).json(resp);
});


module.exports = {
    router : router,
}