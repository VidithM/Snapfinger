var chats = [];
var invitations = [];

function render(){
    let res = '';
    if(chats.length == 0){
        res += "<li>You're not in any chats!</li></ul>";
    }
    for (idx in chats){
        let curr = chats[idx];
        res += '<li><a href = /chat/' + curr.id + '>' + curr.name + '</a><br><t>' + curr.members.length + ' members</t></li>\n';
    }
    document.getElementById('chatList').innerHTML = res;

    res = '';
    if(invitations.length == 0){
        res += '<li>No invitations...</li>';
    }
    for (idx in invitations){
        let curr = invitations[idx];
        res += '<li><t>' + curr.from + ' is inviting you to room ' + curr.room + '</t><br>';
        res += '<button onclick = "handleInvite(' + idx + ', true)">Accept</button><button onclick = "handleInvite(' + idx + ', false)">Decline</button></li>';
    }
    document.getElementById('inviteList').innerHTML = res;
}

async function addChat() { 
    let name = document.getElementById('chatNameIn').value;
    if(name == ''){
        return;
    }
    let uid = localStorage.getItem('uid');
    let resp = await fetch('/api/addChat', {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body : JSON.stringify({uid : uid, name : name}),
    });
    let respJSON = await resp.json();
    if(respJSON.status == 'FAILED'){
        logout();
    }
}
function logout(){
    localStorage.removeItem('uid');
    window.location = '/';
}
//Init all chat data, set up DOM
async function initialize(){
    fetchUpdates();
    setInterval(fetchUpdates, 2000);
}
async function handleInvite(idx, accept){
    let uid = localStorage.getItem('uid');
    let resp = await fetch('/api/handleInvite', {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({uid : uid, idx : idx, accept : accept}),
    });
}
//Periodically checks for updates on chats
async function fetchUpdates(){
    let uid = localStorage.getItem('uid');
    let resp = await fetch('/api/getAccountData', {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body : JSON.stringify({uid : uid}),
    });
    let respJSON = await resp.json();

    if(respJSON.status == 'FAILED'){
       logout();
    } else {
        document.getElementById('greeting').innerHTML = 'Welcome, ' + respJSON.content.name;
        chats = respJSON.content.chatroomData;
        invitations = respJSON.content.inviteData;
        render();
    }
}