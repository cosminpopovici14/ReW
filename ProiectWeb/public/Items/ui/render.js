function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function printItems() {
    console.log("cATEGORY",category);
    console.log("CATEGORY NAME: ",category.name);
    const escapedCategoryName = escapeHTML(category[0].name);
    let categoryTitleHTML = `${escapedCategoryName}`;
    let viewHTML = '';
    let editHTML = '';
    let itemsHTML = '';

    exportButtonHTML=`
            <a href="Downloads/category-${category[0].id}-items.csv" download="category-${category[0].id}-items.csv">
            <button class="export-button">Export CSV</button>
            </a>
            `
    console.log("ITEMS:::",items);
    items.forEach(item =>{
        const escapedItemName = escapeHTML(item.name);
        const escapedQuantity = escapeHTML(item.quantity);
        const escapedDate = escapeHTML(item.date);
        const escapedLastCheck = escapeHTML(item.lastcheckdate);
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
                        <div class ="error-text-div" id="error-text-div-put-${item.id}">
                            <p class="error-text-put-${item.id}">Error : Invalid Input</p>
                        </div>
                        <div id="item-name-div">
                            <p class="item-inputs-titles" id="item-name-p">Item Name</p> <input class="item-inputs" id="item-name-input-${item.id}" required="required" type="text" value="${escapedItemName}">
                        </div>
                        
                        <div id="item-quantity">
                            <p class="item-inputs-titles" id="item-quantity-p-${item.id}">Quantity</p> <input class="item-inputs" id="item-quantity-input-${item.id}" required="required" type="text"  value="${escapedQuantity}">
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
                            <div class = "add-item-popup-button" id="add-item-add-button"> <button class = "add-item-button-text" onclick="editItemConsumable(${item.id},'${item.favourite}','${item.quantity}','${item.date}','${item.lastcheckdate}');  ">Edit</button></div>
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
                        <div class ="error-text-div" id="error-text-div-put-${item.id}">
                            <p class="error-text-put-${item.id}">Error : Invalid Input</p>
                        </div>
                        <div id="item-name-div">
                            <p class="item-inputs-titles" id="item-name-p">Item Name</p> <input class="item-inputs" id="item-name-input-${item.id}" required="required" type="text" value="${escapedItemName}">
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
                            <div class = "add-item-popup-button-edit" id="add-item-add-button"> <button class = "add-item-button-text-edit" onclick="editItemDevice(${item.id},'${item.favourite}','${item.lastcheckdate}');">Edit</button></div>
                            <div class = "add-item-popup-button" id="add-item-cancel-button"> <button class = "add-item-button-text" onclick ="closeItemsPopup('edit-popup-${item.id}'); ">Cancel</button></div>  
                        </div>
                    </div>
                    `;
        }
        
        if(item.consumable == true){
            viewHTML+=`<div class="items-popup" id="view-${item.id}">
                        <div class="item-view-title">
                            <h1 class="item-view-item-name">${escapedItemName}</h1>
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
                                    ${escapedQuantity}
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
                                    <button onclick="patchFavourite('${item.id}','${checkFavouriteTrueFalse(item.favourite)}')">${checkFavourite(item.favourite)}</button>
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
                            <h1 class="item-view-item-name">${escapedItemName}</h1>
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
                                    <button onclick="patchFavourite('${item.id}','${checkFavouriteTrueFalse(item.favourite)}')">${checkFavourite(item.favourite)}</button>
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
                                <p id="item-name-name">${escapedItemName}</p>
                                <p id="item-name-category">${checkConsumable(item.consumable)}</p>
                            </div>
                            <div class="item-stock" id="item-stock-${item.id}">
                                <span class="item-number">${escapedQuantity}</span> in stock
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

window.printItems = printItems;