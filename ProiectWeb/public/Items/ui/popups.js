function openPopup(id) {
    document.getElementById(id).classList.add("open-popup");
}

function openEditPopup(id) {
    document.getElementById(id).classList.add("open-popup");
    window.editOpened = 1;
}

function openItemsPopup(id) {
    document.getElementById(id).classList.add("open-popup");
}

function closeItemsPopup(id) {
    const itemID = id.split('-')[2];
    const popup = document.getElementById(id);
    popup.classList.remove("open-popup");
    if (itemID === undefined) {
        document.getElementById('error-text-div-post')?.classList.remove("show-error");
    } else {
        document.getElementById(`error-text-div-put-${itemID}`)?.classList.remove("show-error");
    }
}

function openItemDeleteConfirmation(imageID, nameID, stockID, alertID, deleteID, buttonsID, deleteButtonID, viewButtonID) {
    [imageID, nameID, stockID, alertID, deleteButtonID, viewButtonID].forEach(id => document.getElementById(id).classList.add("hide-category"));
    [deleteID, buttonsID].forEach(id => document.getElementById(id).classList.add("show-delete-confirmation"));
}

function closeItemDeleteConfirmation(imageID, nameID, stockID, alertID, deleteID, buttonsID, deleteButtonID, viewButtonID) {
    [imageID, nameID, stockID, alertID, deleteButtonID, viewButtonID].forEach(id => document.getElementById(id).classList.remove("hide-category"));
    [deleteID, buttonsID].forEach(id => document.getElementById(id).classList.remove("show-delete-confirmation"));
}

window.openPopup = openPopup;
window.openEditPopup = openEditPopup;
window.openItemsPopup = openItemsPopup;
window.closeItemsPopup = closeItemsPopup;
window.openItemDeleteConfirmation = openItemDeleteConfirmation;
window.closeItemDeleteConfirmation = closeItemDeleteConfirmation;