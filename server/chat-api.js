const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();

const CLIENT_PATH = path.join(__dirname, '..', 'client/');
const MONGO_URI = 'mongodb+srv://vid:Yj3iwVG2VvOGsaPf@cluster0.jwdod.mongodb.net/Snapfinger?retryWrites=true&w=majority';

const {Account, Chatroom, Message} = require('./models');
const { report } = require('process');

mongoose.connect(MONGO_URI , {
    useNewUrlParser : true,
    useUnifiedTopology: true
});

router.use(express.static(CLIENT_PATH));
router.use(express.json())

router.post('/getMessages', async (req, res) => {
    let uid = req.body['uid'];
    let room = req.body['room'];
    let num = req.body['numMsg'];
    let offset = req.body['offset'];

    let roomVal = await Chatroom.findById(room);
    let resp = {}
    let status = 200;
    if(roomVal != null){
        let found  = false;
        for (val in roomVal.members){
            if(uid == roomVal.members[val]){
                found = true;
                break;
            }
        }
        if(found){
            let messages = [];
            //message is: {id, author, content}
            let end = roomVal.messages.length - 1 - offset;
            for (let idx = Math.max(end - num + 1, 0); idx <= end ; idx++){
                let msg = roomVal.messages[idx];
                let msgVal = await Message.findById(msg);
                let authorVal = await Account.findById(msgVal.author);

                let put = {id : msg, author : authorVal.username, content : msgVal.content};
                messages.push(put);
            }
            resp.content = messages;
            resp.status = 'SUCCESS';
        } else {
            resp.status = 'FAILED';
            status = 400;
            resp.content.comment = 'User not in room';
        }
    } else {
        resp.status = 'FAILED';
        status = 400;
        resp.content.comment = 'Invalid room ID';
    }
    res.status(status).json(resp);
});
router.post('/pushMessage', async (req, res) => {
    let uid = req.body['uid'];
    let msg = req.body['message'];
    let room = req.body['room'];
    
    let roomVal = await Chatroom.findById(room);
    if(roomVal != null){
        let found  = false;
        for (val in roomVal.members){
            if(uid == roomVal.members[val]){
                found = true;
                break;
            }
        }
        if(found){
            let msgVal = new Message({author : uid, content : msg});
            msgVal.save();
            roomVal.messages.push(msgVal._id);
            roomVal.save();
            res.send('success');
        } else {
            res.send('fail');
        }
    } else {
        res.send('fail');
    }
});

module.exports = {
    router : router,
};

