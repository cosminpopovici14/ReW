const params = new URLSearchParams(window.location.search);
const id = params.get('categoryID');

let items = [];
let category = [];
let chartData = [];

function init() {
    fetch(`/api/categories/${id}/items`).then(res => res.json()).then(data => {
        items = data;
        return fetch(`/api/categories/${id}`);
    }).then(res2 => res2.json()).then(data2 => {
        category = data2;
        printItems();
    });
}

function getChartData(itemID) {
    fetch(`/api/categories/${id}/items/${itemID}/data`).then(res => res.json()).then(data => {
        chartData = data;
        createCanvas(itemID, chartData);
    });
}

function getItemExport(itemID) {
    fetch(`/api/categories/${id}/items/${itemID}/export`);
}

function postItem(name, isConsumable, quantity, autodeq, alert, date) {
    fetch(`/api/categories/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            quantity,
            consumable: isConsumable,
            alertdeqtime: autodeq,
            alert,
            favourite: false,
            date,
            lastcheckdate: "NoDate"
        })
    }).then(res => {
        if (!res.ok) return res.text().then(text => { throw new Error(text); });
        closeItemsPopup('add-popup');
        init();
    }).catch(err => {
        openErrorPopupPost(err.message);
    });
}

function putItem(itemID, name, isConsumable, quantity, autodeq, alert, favourite, date, lastcheckdate) {
    fetch(`/api/categories/${id}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: parseInt(itemID),
            name,
            quantity: parseInt(quantity),
            consumable: (isConsumable == "true"),
            alertdeqtime: autodeq,
            alert,
            favourite: (favourite == "true"),
            date,
            lastcheckdate
        })
    }).then(res => {
        if (!res.ok) return res.text().then(text => { throw new Error(text); });
        closeItemsPopup(`edit-popup-${itemID}`);
        init();
    }).catch(err => {
        openErrorPopupPut(err.message, itemID);
    });
}

function deleteItem(idDeleted) {
    fetch(`/api/categories/${id}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idDeleted })
    }).then(() => init());
}

function patchDeviceCheck(itemID) {
    const date = new Date();
    fetch(`/api/categories/${id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemID, lastcheckdate: date })
    }).then(() => init());
}

function patchFavourite(itemID, itemFavourite) {
    fetch(`/api/categories/${id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemID, favourite: (itemFavourite == "true") })
    }).then(() => init());
}

window.items = items;
window.category = category;
window.chartData = chartData;
window.init = init;
window.getChartData = getChartData;
window.getItemExport = getItemExport;
window.postItem = postItem;
window.putItem = putItem;
window.deleteItem = deleteItem;
window.patchDeviceCheck = patchDeviceCheck;
window.patchFavourite = patchFavourite;
