function openErrorPopupPost(errMessage) {
    const errorPopup = document.getElementById('error-text-div-post');
    const error = `Error : ${errMessage}`;
    document.querySelector('.error-text-post').innerHTML = error;
    errorPopup.classList.add("show-error");
}

function openErrorPopupPut(errMessage, itemID) {
    const errorPopup = document.getElementById(`error-text-div-put-${itemID}`);
    const error = `Error : ${errMessage}`;
    document.querySelector(`.error-text-put-${itemID}`).innerHTML = error;
    errorPopup.classList.add("show-error");
}

window.openErrorPopupPost = openErrorPopupPost;
window.openErrorPopupPut = openErrorPopupPut;