



async function postRegister(username,email,password){

    try{
        let res = await fetch(`/api/register`,{
        method : 'POST',
        header : {'ContentType' : 'application/json'},
        body : JSON.stringify({
            "name" : username,
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
        openErrorPopupRegister(err.message);
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



function addRegister(){
    let username = document.getElementById("usernameInputRegister").value;
    let email = document.getElementById("loginInputRegister").value;
    let password = document.getElementById("passwordInputRegister").value;

    postRegister(username,email,password);
}
function openErrorPopupRegister(err){
    
}