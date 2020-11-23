const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();

const CLIENT_PATH = path.join(__dirname, '..', 'client/');
const MONGO_URI = 'mongodb+srv://vid:Yj3iwVG2VvOGsaPf@cluster0.jwdod.mongodb.net/Snapfinger?retryWrites=true&w=majority';

const {Account, Chatroom} = require('./models');
const { report } = require('process');

mongoose.connect(MONGO_URI , {
    useNewUrlParser : true,
    useUnifiedTopology: true
});

router.use(express.static(CLIENT_PATH));
router.use(express.json())

//gets chat ids for a registered user
router.post('/getAccountData', async (req, res) => {
    let uid = req.body['uid'];
    let val = await Account.findById(uid);
    let resp = {};
    let status = 200;
    if(val != null){
        resp.status = 'SUCCESS';
        resp.content = {name : val.username, chatroomData : [], inviteData : []};
        for(room in val.chatrooms){
            let roomVal = await Chatroom.findById(val.chatrooms[room]._id);
            let append = {};
            append.id = val.chatrooms[room]._id;
            append.name = roomVal.name;
            append.members = [];
            for (member in roomVal.members){
                append.members.push(roomVal.members[member]._id);
            }
            resp.content.chatroomData.push(append);
        }
        for (invite in val.invitations){
            let senderVal = await Account.findById(val.invitations[invite].user);
            let roomVal = await Chatroom.findById(val.invitations[invite].room);
            let append = {};
            append.from = senderVal.username;
            append.room = roomVal.name;
            resp.content.inviteData.push(append);
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

router.post('/invite', async (req, res) => {
    let user = req.body['uid'];
    let email = req.body['email'];
    let room = req.body['room'];

    let resp = {};
    let status = 200;

    let acctVal = await Account.findById(user);
    if(acctVal != null){
        let otherAcctVal = await Account.findOne({email : email});
        let roomVal = await Chatroom.findById(room);
        if(otherAcctVal != null){
            if(otherAcctVal == acctVal){
                resp.status = 'FAILED';
                status = 400;
                resp.comment = 'Self invite';
            } else if (roomVal in acctVal.chatrooms){
                resp.status = 'FAILED';
                status = 400;
                resp.comment = 'Other user already in room';
            } else {
                let append = {user : user, room : roomVal._id};
                otherAcctVal.invitations.push(append);
                otherAcctVal.save();
                resp.status = 'SUCCESS';
            }
        } else {
            resp.status = 'FAILED';
            resp.comment = 'Invalid email';
            status = 400;
        }
    } else {
        resp.status = 'FAILED';
        resp.comment = 'Invalid UID';
        status = 400;
    }
    res.status(status).json(resp);
});
router.post('/handleInvite', async (req, res) => {
    let uid = req.body['uid'];
    let idx = req.body['idx'];
    let accept = req.body['accept'];

    let acctVal = await Account.findById(uid);
    let resp = {};
    let status = 200;
    if(acctVal != null){
        if(accept == 0){
            acctVal.invitations.splice(idx, 1);
            acctVal.save();
            resp.status = 'SUCCESS';
        } else {
            let invite = acctVal.invitations[idx];
            if(invite.room in acctVal.chatrooms){
                resp.status = 'FAILED';
                resp.comment = 'User already in room';
                status = 400;
            } else {
                let roomVal = await Chatroom.findById(invite.room);
                roomVal.members.push(uid);
                acctVal.chatrooms.push(invite.room);
                acctVal.invitations.splice(idx, 1);
                acctVal.save();
                roomVal.save();
                resp.status = 'SUCCESS';
            }
        }
    } else {
        resp.status = 'FAILED';
        resp.comment = 'Invalid UID';
        status = 400;
    }
    res.status(status).json(resp);
}); 
/*
TODO: handle invite, looks up specific invite for user
*/
module.exports = {
    router : router,
};