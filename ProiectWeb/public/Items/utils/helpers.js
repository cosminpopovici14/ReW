function checkConsumable(consumable) {
    return consumable ? "Consumable" : "Device";
}

function checkAlert(alert) {
    return alert === true ? "checked" : "";
}

function checkAlertImage(alert) {
    return alert ? "Images/alertOn.png" : "Images/alertOff.png";
}

function checkFavouriteImage(favourite) {
    return favourite ? "Images/fullStar.png" : "Images/emptyStar.png";
}

function checkFavourite(favourite) {
    return favourite ? "Remove Favourite" : "Add Favourite";
}

function checkFavouriteTrueFalse(favourite) {
    return favourite ? "false" : "true";
}

function getCurrentDate() {
    const date = new Date();
    return `${date.getDate()} ${date.toLocaleDateString('default', { month: 'short' })} ${date.getFullYear()}`;
}

function getAddedDate(date) {
    if (date === "noalert") return "No Check Set";
    if (date === "NoDate") return "Never Checked";
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleDateString('default', { month: 'short' })} ${d.getFullYear()}`;
}

function getDayAndMonth(date) {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleDateString('default', { month: 'short' })}`;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function getCheckDate(itemlastcheckdate, itemalertdeqtime) {
    switch(itemalertdeqtime) {
        case "7d": return addDays(itemlastcheckdate, 7);
        case "14d": return addDays(itemlastcheckdate, 14);
        case "30d": return addDays(itemlastcheckdate, 30);
        case "60d": return addDays(itemlastcheckdate, 60);
        case "90d": return addDays(itemlastcheckdate, 90);
        case "180d": return addDays(itemlastcheckdate, 180);
        case "1y": return addDays(itemlastcheckdate, 365);
        default: return "noalert";
    }
}

function verifyCheckStatusImage(itemlastcheckdate, itemalertdeqtime) {
    const checkDate = new Date(getCheckDate(itemlastcheckdate, itemalertdeqtime));
    return new Date() >= checkDate ? "Images/device_check_bad.png" : "Images/device_check_good.png";
}

function verifyCheckStatusText(itemlastcheckdate, itemalertdeqtime) {
    const checkDate = new Date(getCheckDate(itemlastcheckdate, itemalertdeqtime));
    return new Date() >= checkDate ? "Check Item" : "OK";
}

function checkSelected(alertdeqtime, option) {
    return alertdeqtime === option ? 'selected="selected"' : '';
}

function openInputs() {
    var checkBox = document.getElementById(`item-consumable-input`);
    var textQuantityP = document.getElementById(`item-quantity-p`);
    var textQuantityI = document.getElementById(`item-quantity-input`);
    var textDecQuantityT = document.getElementById(`item-dec-quantity-title`);
    var textDecQuantityI = document.getElementById(`item-dec-quantity-interval`);
    var textCheckTimeT = document.getElementById(`item-check-time-title`);
    var textCheckTimei = document.getElementById(`item-check-time-interval`);
    if (checkBox.checked == true){
        textQuantityP.style.display = "block";
        textQuantityI.style.display = "block";
        textDecQuantityT.style.display = "block";
        textDecQuantityI.style.display = "block";
        textCheckTimeT.style.display = "none";
        textCheckTimei.style.display = "none";
    } else {
        textQuantityP.style.display = "none";
        textQuantityI.style.display = "none";
        textDecQuantityT.style.display = "none";
        textDecQuantityI.style.display = "none";
        textCheckTimeT.style.display = "block";
        textCheckTimei.style.display = "block";
    }
}

window.checkConsumable = checkConsumable;
window.checkAlert = checkAlert;
window.checkAlertImage = checkAlertImage;
window.checkFavouriteImage = checkFavouriteImage;
window.checkFavourite = checkFavourite;
window.checkFavouriteTrueFalse = checkFavouriteTrueFalse;
window.getCurrentDate = getCurrentDate;
window.getAddedDate = getAddedDate;
window.getDayAndMonth = getDayAndMonth;
window.getCheckDate = getCheckDate;
window.verifyCheckStatusImage = verifyCheckStatusImage;
window.verifyCheckStatusText = verifyCheckStatusText;
window.checkSelected = checkSelected;
window.openInputs = openInputs;
