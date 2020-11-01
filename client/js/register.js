function putAlert(msg){
    document.getElementById('alert').innerHTML = msg;
}
function clearAlert(){
    putAlert('');
}

function validateInput(email, username, password){
    if(email == '' || username == '' || password == '' ){
        return false;
    }
    return true;
}

async function register(){
    clearAlert();
    var email = document.getElementById('email-in').value;
    var username = document.getElementById('username-in').value;
    var password = document.getElementById('password-in').value;
    if(!validateInput(email, username, password)){
        putAlert('Invalid credentials entered. Try again!');
    }
    let resp = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({email: email, username: username, password: password}),
    });
    let respJSON = await resp.json();
    if(respJSON.status == 'FAILED'){
        if(respJSON.content.comment = 'Email already exists'){
           putAlert('The email you provided is already in use!')
        } else {
           putAlert('Something went wrong. Try again');
        }
    } else {
        localStorage.setItem('uid', respJSON.content.uid);
        window.location = '/chatview';
    }
}