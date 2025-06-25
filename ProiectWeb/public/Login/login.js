



async function postLogin(email,password){

    try{
        let res = await fetch(`/api/login`,{
        method : 'POST',
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({
            "email" : email,
            "password" : password
        })
    });
        if(!res.ok){
            const errorMsg = await res.text();
            throw new Error(errorMsg);
        }
         window.location.href = '/index.html';
    }catch(err){
        console.log(err);
        openErrorPopupLogin(err.message);
    }
    
        
}


function togglePassword(){
    const input = document.getElementById("passwordInput");
    const icon = document.querySelector(".toggle-password");

    if(input.type === "password"){
        input.type = "text";
        icon.textContent = "visibility";
    } else{
        input.type = "password";
        icon.textContent = "visibility_off";
    }
}



function addLogin(){
    let email = document.getElementById("loginInput").value;
    let password = document.getElementById("passwordInput").value;

    postLogin(email,password);
}

function openErrorPopupLogin(err){

    let popup =document.getElementById("login-error-div-id");
    
    const errMessage = 'Error : ' + err;
    document.querySelector(`.login-error-text`).innerHTML = errMessage;
    console.log(popup);
    popup.classList.add("show-error");
}