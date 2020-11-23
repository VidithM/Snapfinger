const { triggerAsyncId } = require('async_hooks');
const express = require('express');
const socket = require('ws');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const wsServer = http.createServer(app)

const Account = require('./models').Account;

const apiRouter = require('./api').router;
const chatApiRouter = require('./chat-api').router;

app.use('/api', apiRouter);
app.use('/api/chat', chatApiRouter);

const CLIENT_PATH = path.join(__dirname, '..', 'client/');
const MONGO_URI = 'mongodb+srv://vid:Yj3iwVG2VvOGsaPf@cluster0.jwdod.mongodb.net/Snapfinger?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI , {
    useNewUrlParser : true,
    useUnifiedTopology: true
});

app.use(express.static(CLIENT_PATH));
app.use(express.json())


const wss = new socket.Server({server : wsServer});
wss.on('connection', (ws) => {
    console.log('Connection made');
});

app.all('/', async (req, res) => {
    if(req.method == 'POST'){
        //handle login
        let resp = {};
        let email = req.body['email'];
        let psswrd = req.body['password'];

        let val = await Account.findOne({email : email});

        if(val == null){
            resp.status = 'FAILED';
            resp.content = {comment : 'Invalid email'};
        } else {
            if(val.password != psswrd){
                resp.status = 'FAILED';
                resp.content = {comment : 'Incorrect password'};
            } else {
                resp.status = 'SUCCESS';
                resp.content = {comment : 'None', uid : val._id};
            }
        }
        res.json(resp);
    } else {
        res.sendFile(CLIENT_PATH + 'html/index.html');
    }
});
/*
    Registering new account
*/
app.all('/register', async (req, res) => {
    if(req.method == 'POST'){
        let resp = {};
        let email = req.body['email'];
        let uname = req.body['username'];
        let psswrd = req.body['password'];

        let val = await Account.findOne({email : email});

        if(val == null){
            let temp = new Account({email : email, username : uname, password : psswrd, chatrooms : []});
            temp.save();
            resp.status = 'SUCCESS';
            resp.content = {comment : 'None', uid : temp._id};
        } else {
            resp.status = 'FAILED';
            resp.content = {comment : 'Email already exists'};
        }
        res.json(resp);
    } else {
        res.sendFile(CLIENT_PATH + 'html/register.html');
    }
});
app.get('/chat/:id', (req, res) => {
    res.sendFile(CLIENT_PATH + 'html/chat.html');
});
/*
    Chat view
*/
app.all('/chatview', (req, res) => {
    res.sendFile(CLIENT_PATH + 'html/chatview.html');
});

app.listen('3000');