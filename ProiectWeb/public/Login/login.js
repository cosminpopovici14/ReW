

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
      "#71b4b5",
      "#32c5c0"
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

         window.location.href = '/';
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