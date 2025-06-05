const params = new URLSearchParams(window.location.search);
const id = params.get('categoryID');
var lastItemID = -1;

console.log(id);

let items = [];
let category=[];
let chartData=[];
let editOpened = 0;
async function init()
{
    let res = await fetch(`/api/categories/${id}/items`);
    items = await res.json();
    let res2 = await fetch(`/api/categories/${id}`);
    category= await res2.json();
    console.log("adfjka",category);
    console.log(items);
    printItems();

}

async function getChartData(itemID) {
    let res = await fetch(`/api/categories/${id}/items/${itemID}/data`);
    chartData = await res.json();
    createCanvas(itemID,chartData);
    
}

async function getItemExport(itemID){
    let res = await fetch(`/api/categories/${id}/items/${itemID}/export`);
}



async function postItem(name,isConsumable,quantity,autodeq,alert,date)
{
    
        let res = await fetch(`/api/categories/${id}/items`,{
        method : 'POST',
        header : {'ContentType' : 'application/json'},
        body : JSON.stringify({
            "name" : name,
            "quantity": quantity,
            "consumable": isConsumable,
            "alertdeqtime": autodeq,
            "alert":alert,
            "date":date,
            "favourite": false,
            "lastcheckdate":"NoDate"
        })
    })
    init();  
}


async function putItem(itemID,name,isConsumable,quantity,autodeq,alert,favourite,date,lastcheckdate){

    itemID = parseInt(itemID);
    quantity = parseInt(quantity);
    favourite = (favourite == "true");
    isConsumable = (isConsumable == "true");
    console.log("PUT:::",lastcheckdate);
    let res = await fetch(`/api/categories/${id}/items`,{
        method : 'PUT',
        header : {'ContentType' : 'application/json'},
        body : JSON.stringify({
            "id" : itemID,
            "name" : name,
            "quantity": quantity,
            "consumable": isConsumable,
            "alertdeqtime": autodeq,
            "alert":alert,
            "favourite":favourite,
            "date": date,
            "lastcheckdate": lastcheckdate
        })
    });
    init();
}

async function deleteItem(idDeleted)
{
    let res = await fetch(`/api/categories/${id}/items`,{
        method : 'DELETE',
        headers : {'ContentType' : 'application/json'},
        body : JSON.stringify({
            "id" : idDeleted
        })
    });
    init();
}

async function patchDeviceCheck(itemID){
    const date = new Date();
    let res = await fetch(`/api/categories/${id}/items`,{
        method : 'PATCH',
        header : {'ContentType' : 'application/json'},
        body : JSON.stringify({
            "id" : itemID,
            "lastcheckdate": date
        })
    });
    init(); 
}

init();



function addItem(){
    var name = document.getElementById("item-name-input").value;
    var isConsumable = document.getElementById("item-consumable-input").checked;
    const date = new Date();
    if(isConsumable == true){
        var quantity = parseInt(document.getElementById("item-quantity-input").value);
        var autodeq = document.getElementById("item-dec-quantity-interval").value;
        var alert = document.getElementById("item-alert-input").checked;
        console.log(name,isConsumable,quantity,autodeq,alert)
        postItem(name,isConsumable,quantity,autodeq,alert,date);
    }
    else{
        var checkTime = document.getElementById("item-check-time-interval").value;
        var alert = document.getElementById("item-alert-input").checked;
        postItem(name,isConsumable,1,checkTime,alert,date)
    }

}

function editItemConsumable(itemID,itemFavourite,itemQuantity,itemDate, itemLastCheckDate){
    var name = document.getElementById(`item-name-input-${itemID}`).value;
    var quantity = parseInt(document.getElementById(`item-quantity-input-${itemID}`).value);
    var autodeq = document.getElementById(`item-dec-quantity-interval-${itemID}`).value;
    var alert = document.getElementById(`item-alert-input-${itemID}`).checked;
    var date;
    if(itemQuantity!=quantity)
        date = new Date();
    else 
        date = itemDate;
    console.log("INTRI?? editItemConsumable",itemID,name,true,quantity,autodeq,alert,itemLastCheckDate);
    putItem(itemID,name,"true",quantity,autodeq,alert,itemFavourite,date,itemLastCheckDate);  
    } 


function editItemDevice(itemID,itemFavourite,itemLastCheckDate){
    var date= new Date();
    var name = document.getElementById(`item-name-input-${itemID}`).value;
    var checkTime = document.getElementById(`item-check-time-interval-${itemID}`).value;
    var alert = document.getElementById(`item-alert-input-${itemID}`).checked;
    console.log("INTRI??",itemID,name,false,1,checkTime,alert,date,itemLastCheckDate);


    putItem(itemID,name,"false",1,checkTime,alert,itemFavourite,date,itemLastCheckDate)
}

function printItems(){
    console.log("cATEGORY",category);
    console.log("CATEGORY NAME: ",category.name);
    categoryTitleHTML = `${category[0].name}`;
    viewHTML = '';
    editHTML = '';
    let itemsHTML = '';
    exportButtonHTML=`
            <a href="Downloads/category-${category[0].id}-items.csv" download="category-${category[0].id}-items.csv">
            <button class="export-button">Export CSV</button>
            </a>
            `
    console.log("ITEMS:::",items);
    items.forEach(item =>{
        if(item.consumable == true)
        {
            

            editHTML+=`
            <div class="edit-item-popup" id="edit-popup-${item.id}">
                        <div class="add-item-image">
                            <img src="Images/cube.png" alt="Cube" class="item-image-cube" >
                        </div>
                        
                        <div class="add-item-popup-title-div">
                            <h2 id="add-item-popup-title">Edit Consumable</h2>
                        </div>
                        
                        <div id="item-name-div">
                            <p class="item-inputs-titles" id="item-name-p">Item Name</p> <input class="item-inputs" id="item-name-input-${item.id}" required="required" type="text" value="${item.name}">
                        </div>
                        
                        <div id="item-quantity">
                            <p class="item-inputs-titles" id="item-quantity-p-${item.id}">Quantity</p> <input class="item-inputs" id="item-quantity-input-${item.id}" required="required" type="text"  value="${item.quantity}">
                        </div>
                        <div id="item-date"> 
                            <p class="item-inputs-titles" id="item-dec-quantity-title-${item.id}">Auto-Decrease Quantity</p> 
                            <select name="interval" class="item-interval" id="item-dec-quantity-interval-${item.id}"  >
                                <option value="noalert" ${checkSelected(item.alertdeqtime, "noalert")}>Off</option>
                                <option value="7d" ${checkSelected(item.alertdeqtime, "7d")}>7 days</option>
                                <option value="14d" ${checkSelected(item.alertdeqtime, "14d")}>14 days</option>
                                <option value="30d" ${checkSelected(item.alertdeqtime, "30d")}>30 days</option>
                                <option value="60d" ${checkSelected(item.alertdeqtime, "60d")}>60 days</option>
                                <option value="90d" ${checkSelected(item.alertdeqtime, "90d")}>90 days</option>
                                <option value="180d" ${checkSelected(item.alertdeqtime, "180d")}>180 days</option>
                                <option value="1y" ${checkSelected(item.alertdeqtime, "1y")}>1 year</option>
                                
                            </select>
                        </div>
                        <div class="checkbox-div" id="item-alert">
                            <input  class="custom-checkbox" id="item-alert-input-${item.id}" required="required" ${checkAlert(item.alert)} type="checkbox"> <p class="item-inputs-titles" id="item-alert-p">Enable Alert</p> 
                        </div>
                        <div class="add-item-popup-buttons-div">
                            <div class = "add-item-popup-button" id="add-item-add-button"> <button class = "add-item-button-text" onclick="editItemConsumable(${item.id},'${item.favourite}','${item.quantity}','${item.date}','${item.lastcheckdate}'); "; closeItemsPopup('edit-popup-${item.id}')">Edit</button></div>
                            <div class = "add-item-popup-button" id="add-item-cancel-button"> <button class = "add-item-button-text" onclick ="closeItemsPopup('edit-popup-${item.id}'); ">Cancel</button></div>  
                        </div>
                    </div> 
        `
        }
        else
        {
            editHTML+= `<div class="edit-item-popup" id="edit-popup-${item.id}">
                        <div class="add-item-image">
                            <img src="Images/cube.png" alt="Cube" class="item-image-cube" >
                        </div>
                        
                        <div class="add-item-popup-title-div">
                            <h2 id="add-item-popup-title">Edit Device</h2>
                        </div>
                        
                        <div id="item-name-div">
                            <p class="item-inputs-titles" id="item-name-p">Item Name</p> <input class="item-inputs" id="item-name-input-${item.id}" required="required" type="text" value="${item.name}">
                        </div>
                        
                        <div id="item-date"> 
                            <p class="item-inputs-titles" id="item-check-time-title-${item.id}">Check Time</p> 
                            <select name="interval" class="item-interval" id="item-check-time-interval-${item.id}"  >
                                <option value="noalert" ${checkSelected(item.alertdeqtime, "noalert")}>Off</option>
                                <option value="7d" ${checkSelected(item.alertdeqtime, "7d")}>7 days</option>
                                <option value="14d" ${checkSelected(item.alertdeqtime, "14d")}>14 days</option>
                                <option value="30d" ${checkSelected(item.alertdeqtime, "30d")}>30 days</option>
                                <option value="60d" ${checkSelected(item.alertdeqtime, "60d")}>60 days</option>
                                <option value="90d" ${checkSelected(item.alertdeqtime, "90d")}>90 days</option>
                                <option value="180d" ${checkSelected(item.alertdeqtime, "180d")}>180 days</option>
                                <option value="1y" ${checkSelected(item.alertdeqtime, "1y")}>1 year</option>  
                            </select>
                        </div>
                        <div class="checkbox-div" id="item-alert">
                            <input  class="custom-checkbox" id="item-alert-input-${item.id}" required="required" ${checkAlert(item.alert)} ${console.log("check alert: ",checkAlert(item.alert))} type="checkbox"> <p class="item-inputs-titles" id="item-alert-p">Enable Alert</p> 
                        </div>
                        <div class="add-item-popup-buttons-div">
                            <div class = "add-item-popup-button-edit" id="add-item-add-button"> <button class = "add-item-button-text-edit" onclick="editItemDevice(${item.id},'${item.favourite}','${item.lastcheckdate}'); "; closeItemsPopup('edit-popup-${item.id}')">Edit</button></div>
                            <div class = "add-item-popup-button" id="add-item-cancel-button"> <button class = "add-item-button-text" onclick ="closeItemsPopup('edit-popup-${item.id}'); ">Cancel</button></div>  
                        </div>
                    </div>
                    `;
        }
        
        if(item.consumable == true){
            viewHTML+=`<div class="items-popup" id="view-${item.id}">
                        <div class="item-view-title">
                            <h1 class="item-view-item-name">${item.name}</h1>
                            <div class="item-view-category">
                                <div class="item-view-category-title">
                                    Category
                                </div>
                                <div class="item-view-category-name">
                                    ${categoryTitleHTML}
                                </div>
                            </div>
                        </div>
                        <div class="item-view-info">
                            <div class="item-view-quantity">
                                <div class="quantity-title">
                                    Quantity
                                </div>
                                <div class="quantity-number">
                                    ${item.quantity}
                                </div>
                                <div class="quantity-date">
                                    ${getCurrentDate()}
                                </div>
                            </div>
                            <div class="item-view-added">
                                <div class="quantity-title">
                                    Added
                                </div>
                                <div class="added-date">
                                     ${getAddedDate(item.date)}
                                </div>
                                <div class="added-alert">
                                    Alert
                                </div>
                            </div>
                        </div>
                        <div class="item-view-graph">
                            <div class="graph-title">
                                <h3>Stock Levels</h3>
                            </div>
                            <canvas id="myChart-${item.id}" style="width:100%;max-width:700px"></canvas>
                        </div>
                        <div class="item-view-buttons">
                            <div class="upper-buttons">
                                <div class="view-button" id="view-edit-button">
                                    <button onclick="openEditPopup('edit-popup-${item.id}');">Edit Item</button>
                                </div>
                                <div class="view-button" id="view-schedule">
                                    <button onclick="putItem('${item.id}','${item.name}','${item.consumable}','${item.quantity}','${item.alertdeqtime}',${item.alert},'${checkFavouriteTrueFalse(item.favourite)}','${item.date}')">${checkFavourite(item.favourite)}</button>
                                </div>
                            </div>
                            <div class="lower-buttons">
                                <div class="export-button-consumables" id="view-export">
                                <a href="Downloads/item-${item.id}.csv" download="item-${item.id}.csv">
                                    <button  id="export-btn">Export to CSV</button>
                                </a>
                                </div>
                            </div>
                        </div>
                        <div class="item-view-close">
                            <button onclick="closeItemsPopup('view-${item.id}')">Close</button>
                        </div>
                    </div>`
        }
        else
        {
            viewHTML+=`<div class="items-popup" id="view-${item.id}">
                        <div class="item-view-title">
                            <h1 class="item-view-item-name">${item.name}</h1>
                            <div class="item-view-category">
                                <div class="item-view-category-title">
                                    Category
                                </div>
                                <div class="item-view-category-name">
                                    ${categoryTitleHTML}
                                </div>
                            </div>
                        </div>
                        <div class="item-view-info">
                            <div class="item-view-quantity-device">
                                <div class="quantity-date">
                                    ${getCurrentDate()}
                                </div>
                            </div>
                            <div class="item-view-added-device">
                                
                                <div class="added-alert">
                                    Alert
                                </div>
                            </div>
                        </div>
                        <div class="item-view-condition">
                            <div class="item-view-conditon-title"> <h2>Device Condition</h2> </div>
                            <div class="item-view-condition-conditions">
                                <div class="item-view-condition-text">
                                    <img src= ${verifyCheckStatusImage(item.lastcheckdate, item.alertdeqtime)} alt="Light Bulb" class="item-view-condition-image view-condition-text-item" id="item-view-condition-check">
                                    <div class="opacity-lowered view-condition-text-item"> Status: </div> 
                                    <h3 class="view-condition-text-item"> ${verifyCheckStatusText(item.lastcheckdate, item.alertdeqtime)} </h3>
                                </div>
                                <div class="item-view-condition-text ">
                                    <img src= "Images/device_clock.png" alt="Light Bulb" class="item-view-condition-image view-condition-text-item" "> 
                                    <div class="opacity-lowered view-condition-text-item"> Last Checked: </div>
                                    <h3 class="view-condition-text-item"> ${getAddedDate(item.lastcheckdate)} </h3> 
                                </div>
                                <div class="item-view-condition-text"> 
                                    <img src= "Images/device_calendar.png" alt="Light Bulb" class="item-view-condition-image view-condition-text-item" "> 
                                    <div class="opacity-lowered view-condition-text-item"> Next Check: </div>
                                    <h3 class="view-condition-text-item"> ${getAddedDate(getCheckDate(item.lastcheckdate,item.alertdeqtime))} </h3> 
                                </div>
                            </div>
                        </div>
                        <div class="item-view-buttons">
                            <div class="upper-buttons">
                                <div class="view-button" id="view-edit-button">
                                    <button onclick="openEditPopup('edit-popup-${item.id}');">Edit Item</button>
                                </div>
                                <div class="view-button" id="view-schedule">
                                    <button onclick="putItem('${item.id}','${item.name}','${item.consumable}','${item.quantity}','${item.alertdeqtime}',${item.alert},'${checkFavouriteTrueFalse(item.favourite)}','${item.date}')">${checkFavourite(item.favourite)}</button>
                                </div>
                            </div>
                            <div class="lower-buttons">
                                <div class="export-button-devices" id="view-export">
                                    <a href="Downloads/item-${item.id}.csv" download="item-${item.id}.csv">
                                    <button  id="export-btn">Export to CSV</button>
                                </a>
                                </div>
                                <div class="check-button" id="view-check">
                                    <button id="check-btn" onclick="patchDeviceCheck(${item.id})">Confirm Check</button>
                                </div>
                            </div>
                        </div>
                        <div class="item-view-close">
                            <button onclick="closeItemsPopup('view-${item.id}')">Close</button>
                        </div>
                    </div>`
        }
        itemsHTML+= `
        <div class="item" id="item-${item.id}">
                        <div class="above-buttons">
                            <div class="item-picture">
                                <img src=${checkFavouriteImage(item.favourite)} alt="Light Bulb" class="item-image" id="item-image-${item.id}">
                            </div>
                            <div class="item-name" id="item-name-${item.id}">
                                <p id="item-name-name">${item.name}</p>
                                <p id="item-name-category">${checkConsumable(item.consumable)}</p>
                            </div>
                            <div class="item-stock" id="item-stock-${item.id}">
                                <span class="item-number">${item.quantity}</span> in stock
                            </div>
                            <div class="item-alert" id="item-alert-${item.id}">
                                <div class="item-alert-image" id="item-alert-image-${item.id}">
                                    <img src=${checkAlertImage(item.alert)} alt="Check" class="item-alert-image">
                                </div> 
                                <div class="item-alert-text" id="item-alert-text-${item.id}"> 
                                    Alert
                                </div>
                            </div>
                        </div>
                        <div class="item-delete-text" id="delete-text-${item.id}">
                                <h2> Are you sure you want to delete? </h2>
                        </div>
                        <div class="item-buttons">
                            <div class="item-buttons-position">
                                <div class="item-delete" id="item-delete-${item.id}">
                                    <button id="delete-button" 
                                    onclick="openItemDeleteConfirmation('item-image-${item.id}','item-name-${item.id}', 
                                    'item-stock-${item.id}','item-alert-${item.id}','delete-text-${item.id}',
                                    'delete-buttons-${item.id}', 'item-delete-${item.id}', 'item-view-${item.id}')">Delete</button>
                                </div>
                                <div class="item-view" id="item-view-${item.id}">
                                    <button id="view-button"
                                    onclick="getItemExport(${item.id});getChartData(${item.id}); openItemsPopup('view-${item.id}'); ">View</button>
                                </div>
                            </div>
                        </div>
                        <div class="item-delete-buttons" id = "delete-buttons-${item.id}">
                            <div class="delete-buttons-position">   
                                <div class="delete-buttons-yes">
                                    <button id="delete-button-yes" 
                                    onclick="deleteItem('${item.id}')">Yes</button>
                                </div>
                                <div class="delete-buttons-no">
                                    <button id="delete-button-no" 
                                    onclick="closeItemDeleteConfirmation('item-image-${item.id}','item-name-${item.id}', 
                                    'item-stock-${item.id}','item-alert-${item.id}','delete-text-${item.id}',
                                    'delete-buttons-${item.id}','item-delete-${item.id}', 'item-view-${item.id}')">No</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
    })
    console.log("HEEEEI");
    document.querySelector('.items-title').innerHTML = categoryTitleHTML;
    document.querySelector('.items-edit-popup-div').innerHTML = editHTML;
    document.querySelector('.items-info-popup-div').innerHTML = viewHTML;
    document.querySelector('.items').innerHTML = itemsHTML;
    document.querySelector('#export-items-button').innerHTML = exportButtonHTML;
}

function checkConsumable(consumable){
    if(consumable == true)
        return "Consumable";
    else
        return "Device";

}

function checkAlert(alert){
    if(alert === true)
        return "checked";
    return "";
}

function checkAlertImage(alert){
    if(alert)
        return "Images/alertOn.png"
    return "Images/alertOff.png"
}



function openPopup(id){
    let popup=document.getElementById(id);
    console.log(popup);
    popup.classList.add("open-popup");
}
function openEditPopup(id){
    let popup=document.getElementById(id);
    console.log(popup);
    popup.classList.add("open-popup");
    editOpened=1;
}
function openItemDeleteConfirmation(imageID,nameID,stockID,alertID,deleteID,buttonsID,deleteButtonID,viewButtonID){
    let hiddenImageID = document.getElementById(imageID);
    let hiddenNameID = document.getElementById(nameID);
    let hiddenStockID = document.getElementById(stockID);
    let hiddenAlertID = document.getElementById(alertID);
    let hiddenDeleteButtonID = document.getElementById(deleteButtonID);
    let hiddenViewButtonID = document.getElementById(viewButtonID);

    let shownDeleteID = document.getElementById(deleteID);
    let shownButtonsID = document.getElementById(buttonsID);

    hiddenImageID.classList.add("hide-category");
    hiddenNameID.classList.add("hide-category");
    hiddenStockID.classList.add("hide-category");
    hiddenAlertID.classList.add("hide-category");
    hiddenDeleteButtonID.classList.add("hide-category");
    hiddenViewButtonID.classList.add("hide-category");

    shownDeleteID.classList.add("show-delete-confirmation");
    shownButtonsID.classList.add("show-delete-confirmation");
    console.log(hiddenImageID);

    
}

function closeItemDeleteConfirmation(imageID,nameID,stockID,alertID,deleteID,buttonsID,deleteButtonID,viewButtonID){
    let hiddenImageID = document.getElementById(imageID);
    let hiddenNameID = document.getElementById(nameID);
    let hiddenStockID = document.getElementById(stockID);
    let hiddenAlertID = document.getElementById(alertID);
    let hiddenDeleteButtonID = document.getElementById(deleteButtonID);
    let hiddenViewButtonID = document.getElementById(viewButtonID);

    let shownDeleteID = document.getElementById(deleteID);
    let shownButtonsID = document.getElementById(buttonsID);

    hiddenImageID.classList.remove("hide-category");
    hiddenNameID.classList.remove("hide-category");
    hiddenStockID.classList.remove("hide-category");
    hiddenAlertID.classList.remove("hide-category");
    hiddenDeleteButtonID.classList.remove("hide-category");
    hiddenViewButtonID.classList.remove("hide-category");

    shownDeleteID.classList.remove("show-delete-confirmation");
    shownButtonsID.classList.remove("show-delete-confirmation");
    console.log(hiddenImageID);
}

function openItemModal(id){
    let popup=document.getElementById(id);
    console.log(popup);
    popup.classList.add("open-popup")
}


function openItemsPopup(id ,count){
    let popup=document.getElementById(id);
    console.log(popup);
    popup.classList.add("open-popup");
    
}
function closeItemsPopup(id)
{
    let popup=document.getElementById(id);
    popup.classList.remove("open-popup");
    editOpened=0;
}

function openPopup(id ,count){
    let popup=document.getElementById(id);
    console.log(popup);
    popup.classList.add("open-popup");
    renameCount=count;
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

function checkSelected(alertdeqtime, option){
    if(alertdeqtime === option)
        return `selected="selected"`;
    return "";
}



function createCanvas(ItemID,chartData){
    var xValues=[];
    var yValues=[];
    console.log("CHART: ",chartData);
    chartData.forEach(function(element){
        xValues.push(getDayAndMonth(element.added_date));
        yValues.push(element.quantity);
    });
    var barColors = "#5AC8FA";
    console.log("Creating canvas");
    new Chart(`myChart-${ItemID}`, {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
        },
        options: {  
            legend: {display: false},
            title: {
                display: true,
                text: "Stock 2025"
            }
        }
    });
}
function checkFavouriteImage(favourite){
    if(favourite)
        return "Images/fullStar.png";
    return "Images/emptyStar.png";
}

function checkFavourite(favourite){
    if(favourite)
        return "Remove Favourite";
    return "Add Favourite";
}

function checkFavouriteTrueFalse(favourite){
    if(favourite)
        return "false";
    return "true";
}

function getCurrentDate(){
    const date = new Date();

    const [month, day, year] = [
        date.toLocaleDateString('default', {month: 'short'}),
        date.getDate(),
        date.getFullYear(),
    ];
    
    var stringDate = day + " " + month + " " + year;
    return(stringDate);
}
function getAddedDate(date){
    
    const dateObj = new Date(date);
    const [month, day, year] = [
        dateObj.toLocaleDateString('default', {month: 'short'}),
        dateObj.getDate(),
        dateObj.getFullYear(),
    ];
    var stringDate = day + " " + month + " " + year;
    return(stringDate);

}

function getDayAndMonth(date){
    const dateObj = new Date(date);
    const [month, day] = [
        dateObj.toLocaleDateString('default', {month: 'short'}),
        dateObj.getDate(),
    ];
    var stringDate = day + " " + month;
    return(stringDate);
}

function getCheckDate(itemlastcheckdate, itemalertdeqtime){
    if(itemalertdeqtime == "noalert")
        return "No Check Set"
    if(itemalertdeqtime == "7d")
        var res = addDays(itemlastcheckdate, 7);
    if(itemalertdeqtime == "14d")
        var res = addDays(itemlastcheckdate, 14);
    if(itemalertdeqtime == "30d")
        var res = addDays(itemlastcheckdate, 30);
    if(itemalertdeqtime == "60d")
        var res = addDays(itemlastcheckdate, 60);
    if(itemalertdeqtime == "90d")
        var res = addDays(itemlastcheckdate, 90);
    if(itemalertdeqtime == "180d")
        var res = addDays(itemlastcheckdate, 180);
    if(itemalertdeqtime == "1y")
        var res = addDays(itemlastcheckdate, 365);
    return res;
}
function addDays(date, days){
    var result = new Date(date);

    result.setDate(result.getDate() + days);

    return result;
}

function verifyCheckStatusImage(itemlastcheckdate, itemalertdeqtime){
    let res = getCheckDate(itemlastcheckdate,itemalertdeqtime);
    let verifyDate = new Date(res);
    let date = new Date();
   
    if(date >= verifyDate)
       return "Images/device_check_bad.png";
    return "Images/device_check_good.png"
}

function verifyCheckStatusText(itemlastcheckdate, itemalertdeqtime){
    let res = getCheckDate(itemlastcheckdate,itemalertdeqtime);
    let verifyDate = new Date(res);
    let date = new Date();
    
    if(date >= verifyDate)
       return "Check Item";
    return "OK";
}