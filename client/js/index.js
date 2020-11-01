function putAlert(msg){
    document.getElementById('alert').innerHTML = msg;
}
function clearAlert(){
    putAlert('');
}

function chkLogin(){
    if(localStorage.getItem('uid') != null){
        window.location = '/chatview';
    }
}

async function login(){
    let email = document.getElementById('email-in').value;
    let password = document.getElementById('password-in').value;

    let resp = await fetch('/', {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({email: email, password: password}),
    });
    let respJSON = await resp.json();
    if(respJSON.status == 'SUCCESS'){
        localStorage.setItem('uid', respJSON.content.uid);
        window.location = '/chatview';
    } else {
        putAlert(respJSON.content.comment);
    }
}