var chats = [];

function updateDOM(){
    let res = '<ul>';
    if(chats.length == 0){
        res += "<li>You're not in any chats!</li></ul>";
    }
    for (chatData in chats){
        let curr = chats[chatData];
        res += '<li><a href = /chat/' + curr.id + '>' + curr.name + '</a><br><t>' + curr.members.length + ' members</t></li>\n';
    }
    document.getElementById('chatList').innerHTML = res;
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

//Periodically checks for updates on chats
async function fetchUpdates(){
    let uid = localStorage.getItem('uid');
    let resp = await fetch('/api/getChats', {
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
        updateDOM();
    }
}