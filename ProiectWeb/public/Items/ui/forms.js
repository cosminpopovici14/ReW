function addItem() {
    const nameInput = document.getElementById("item-name-input").value;
    const name = nameInput === "" ? null : nameInput;
    const isConsumable = document.getElementById("item-consumable-input").checked;
    const alert = document.getElementById("item-alert-input").checked;
    const date = new Date();

    if (isConsumable) {
        const quantity = parseInt(document.getElementById("item-quantity-input").value);
        const autodeq = document.getElementById("item-dec-quantity-interval").value;
        postItem(name, isConsumable, quantity, autodeq, alert, date);
    } else {
        const checkTime = document.getElementById("item-check-time-interval").value;
        postItem(name, isConsumable, 1, checkTime, alert, date);
    }
}

function editItemConsumable(itemID, itemFavourite, itemQuantity, itemDate, itemLastCheckDate) {
    const nameInput = document.getElementById(`item-name-input-${itemID}`).value;
    const name = nameInput === "" ? null : nameInput;
    const quantity = parseInt(document.getElementById(`item-quantity-input-${itemID}`).value);
    const autodeq = document.getElementById(`item-dec-quantity-interval-${itemID}`).value;
    const alert = document.getElementById(`item-alert-input-${itemID}`).checked;
    const date = itemQuantity !== quantity ? new Date() : itemDate;

    putItem(itemID, name, "true", quantity, autodeq, alert, itemFavourite, date, itemLastCheckDate);
}

function editItemDevice(itemID, itemFavourite, itemLastCheckDate) {
    const nameInput = document.getElementById(`item-name-input-${itemID}`).value;
    const name = nameInput === "" ? null : nameInput;
    const checkTime = document.getElementById(`item-check-time-interval-${itemID}`).value;
    const alert = document.getElementById(`item-alert-input-${itemID}`).checked;
    const date = new Date();

    putItem(itemID, name, "false", 1, checkTime, alert, itemFavourite, date, itemLastCheckDate);
}

window.addItem = addItem;
window.editItemConsumable = editItemConsumable;
window.editItemDevice = editItemDevice;