
new FinisherHeader({
  "count": 10,
  "size": {
    "min": 1300,
    "max": 1500,
    "pulse": 0
  },
  "speed": {
    "x": {
      "min": 0.1,
      "max": 0.6
    },
    "y": {
      "min": 0.1,
      "max": 0.6
    }
  },
  "colors": {
    "background": "#aba6b0",
    "particles": [
      "#bfbaba",
      "#807a7a",
      "#a29b9b",
      "#c74d5d",
      "#f44848"
    ]
  },
  "blending": "overlay",
  "opacity": {
    "center": 0.5,
    "edge": 0.05
  },
  "skew": 0,
  "shapes": [
    "c"
  ]
});


async function postConfirmation(username,email,password, passwordConfirm){
    try{
        let res = await fetch(`/api/register/verify`,{
        method : 'POST',
        header : {'ContentType' : 'application/json'},
        body : JSON.stringify({
            "name" : username,
            "email" : email,
            "password" : password,
            "passwordConfirm" : passwordConfirm
        })
    });
        if(!res.ok){
            const errorMsg = await res.text();
            throw new Error(errorMsg);
        }
        openEmailConfirm();
    }catch(err){
        console.log(err);
        openErrorPopupRegister(err.message);
    }
}

async function postRegister(code,username,email,password, passwordConfirm){

    try{
        let res = await fetch(`/api/register`,{
        method : 'POST',
        header : {'ContentType' : 'application/json'},
        body : JSON.stringify({
            "code" : code,
            "name" : username,
            "email" : email,
            "password" : password,
            "passwordConfirm" : passwordConfirm
        })
    });
        if(!res.ok){
            const errorMsg = await res.text();
            throw new Error(errorMsg);
        }
        window.location.href = '/index.html';
    }catch(err){
        console.log(err);
    }
    
        
}




function togglePassword(id,iconId){
    const input = document.getElementById(id);
     const icon = document.getElementById(iconId);

    if(input.type === "password"){
        input.type = "text";
        icon.textContent = "visibility";
    } else{
        
        input.type = "password";
        icon.textContent = "visibility_off";
    }
}



function addRegisterConfirm(){
    let username = document.getElementById("usernameInputRegister").value;
    let email = document.getElementById("loginInputRegister").value;
    let password = document.getElementById("passwordInputRegister").value;
    let passwordConfirm = document.getElementById("passwordConfirmInputRegister").value;
    postConfirmation(username,email,password,passwordConfirm);
}
function addRegister(){
    let code = document.getElementById("registerConfirmCode").value;
    let username = document.getElementById("usernameInputRegister").value;
    let email = document.getElementById("loginInputRegister").value;
    let password = document.getElementById("passwordInputRegister").value;
    let passwordConfirm = document.getElementById("passwordConfirmInputRegister").value;
    postRegister(code,username,email,password,passwordConfirm);
}


function openEmailConfirm(code){
    let confirmPopup = document.getElementById('confirm-popup-id');
    confirmPopup.classList.add("show-error");
}

function openErrorPopupRegister(err){
    let popup =document.getElementById("register-error-id");

    const errMessage = 'Error : ' + err;
    document.querySelector(`.register-error-text`).innerHTML = errMessage;
    console.log(popup);
    popup.classList.add("show-error");
}

