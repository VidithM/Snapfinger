var numMsg = 50;
var chatId;
var messages = [];

function render(){
   let DOMContent = '';
   let idx = 0;
   if(messages.length == 0){
       DOMContent += '<p>No messages yet. Send the first one!</p>';
   }
   while(idx < messages.length){
       let msg = messages[idx];
       DOMContent += '<p><t style = "font-weight : bold">' + msg.author + ': </t><t>' + msg.content + '</t></p>\n';
       idx++;
   }
   document.getElementById('chatBody').innerHTML = DOMContent;
}

async function invite(){
    let email = document.getElementById('inviteIn').value;
    if(email != ''){
        let uid = localStorage.getItem('uid');
        let resp = await fetch('/api/invite', {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                uid : uid,
                room : chatId,
                email : email,
            }), 
        });
        let respJSON = await resp.json();
        if(respJSON.status == 'FAILED'){
            alert('Invalid user email!');
        } else {
            document.getElementById('inviteIn').value = '';
            alert('Invite successfuly sent');
        }
    }
}

async function loadMessages(offset, num){
    let uid = localStorage.getItem('uid');
    let resp = await fetch('/api/chat/getMessages', {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body : JSON.stringify({
            uid : uid,
            room : chatId,
            numMsg : num,
            offset : offset,
        }),
    });
    let respJSON = await resp.json();
    if(respJSON.status == 'FAILED'){
        back();
    } else {
        return respJSON.content;
    }
}
async function pollMessage(){
    latest = (await loadMessages(0, 1));
    if(latest.length == 0){
        return;
    }
    latest = latest[0];
    if(messages.length == 0 || latest.id != messages[messages.length - 1].id){
        messages.push(latest);
        render();
        document.getElementById('notif').innerHTML = '';
    }
}   
function pushMessage(){
    let msg = document.getElementById('msgIn').value;
    document.getElementById('msgIn').value = '';
    document.getElementById('notif').innerHTML = 'Sending...';
    let uid = localStorage.getItem('uid');
    if(msg != ''){
        fetch('/api/chat/pushMessage', {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body : JSON.stringify({
                uid : uid,
                message : msg,
                room : chatId,
            }),
        });
    }
}

function back(){
    window.location = '/chatview';
}

async function initialize(){
    let url = window.location.href.toString();
    chatId = url.substring(url.indexOf('chat/') + 5);
    if(localStorage.getItem('uid') == null){
        back();
    }
    messages = await loadMessages(0, numMsg);
    numMsg = messages.length;
    render();
    setInterval(pollMessage, 3000);
}