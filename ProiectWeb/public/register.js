
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


async function postRegister(username,email,password, passwordConfirm){

    try{
        let res = await fetch(`/api/register`,{
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
         window.location.href = '/index.html';
    }catch(err){
        console.log(err);
        openErrorPopupRegister(err.message);
    }
    
        
}




function togglePassword(id){
    const input = document.getElementById(id);
    const icon = document.querySelector(".toggle-password");

    if(input.type === "password"){
        input.type = "text";
        icon.textContent = "visibility";
    } else{
        
        input.type = "password";
        icon.textContent = "visibility_off";
    }
}



function addRegister(){
    let username = document.getElementById("usernameInputRegister").value;
    let email = document.getElementById("loginInputRegister").value;
    let password = document.getElementById("passwordInputRegister").value;
    let passwordConfirm = document.getElementById("passwordConfirmInputRegister").value;

    postRegister(username,email,password,passwordConfirm);
}
function openErrorPopupRegister(err){
    
}

