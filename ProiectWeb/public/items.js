
const params = new URLSearchParams(window.location.search);

const id = params.get('categoryID');

console.log(id);

let items = [];


async function init()
{
    let res = await fetch(`/api/categories/${id}/items`);
    items = await res.json();
    console.log(items);
    printItems();
    
}


// async function postItem(body)
// {
//     let res = await fetch(`/api/categories/${id}/items`,{
//         method : 'POST',
//         header : {'ContentType' : 'application/json'},
//         body : JSON.stringify{
            
//         }
//     })
// }


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

init();

function printItems(){
    
    let itemsHTML = '';
    console.log("ITEMS:::",items);
    items.forEach(item =>{
        itemsHTML+= `
        <div class="item" id="item-${item.id}">
                        <div class="above-buttons">
                            <div class="item-picture">
                                <img src="Images/bec.png" alt="Light Bulb" class="item-image" id="item-image-${item.id}">
                            </div>
                            <div class="item-name" id="item-name-${item.id}">
                                <p id="item-name-name">${item.name}</p>
                                <p id="item-name-category">Electrical</p>
                            </div>
                            <div class="item-stock" id="item-stock-${item.id}">
                                <span class="item-number">${item.quantity}</span> in stock
                            </div>
                            <div class="item-alert" id="item-alert-${item.id}">
                                <img src="Images/check.png" alt="Check" class="item-alert-image"> Alert
                            </div>
                        </div>
                        <div class="item-delete-text" id="delete-text-${item.id}">
                                <h2> Are you sure you want to delete? </h2>
                        </div>
                        <div class="item-buttons">
                            <div class="item-buttons-position">
                                <div class="item-delete">
                                    <button id="delete-button" 
                                    onclick="openItemDeleteConfirmation('item-image-${item.id}','item-name-${item.id}', 
                                    'item-stock-${item.id}','item-alert-${item.id}','delete-text-${item.id}','delete-buttons-${item.id}')">Delete</button>
                                </div>
                                <div class="item-view">
                                    <button id="view-button"
                                    onclick="openItemsPopup('view-${item.id}')">View</button>
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
                                    'item-stock-${item.id}','item-alert-${item.id}','delete-text-${item.id}','delete-buttons-${item.id}')">No</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
    })
    console.log("HEEEEI");
    document.querySelector('.items').innerHTML = itemsHTML;
}




function openPopup(id){
    let popup=document.getElementById(id);
    console.log(popup);
    popup.classList.add("open-popup");
}
function openItemDeleteConfirmation(imageID,nameID,stockID,alertID,deleteID,buttonsID){
    let hiddenImageID = document.getElementById(imageID);
    let hiddenNameID = document.getElementById(nameID);
    let hiddenStockID = document.getElementById(stockID);
    let hiddenAlertID = document.getElementById(alertID);

    let shownDeleteID = document.getElementById(deleteID);
    let shownButtonsID = document.getElementById(buttonsID);

    hiddenImageID.classList.add("hide-category");
    hiddenNameID.classList.add("hide-category");
    hiddenStockID.classList.add("hide-category");
    hiddenAlertID.classList.add("hide-category");

    shownDeleteID.classList.add("show-delete-confirmation");
    shownButtonsID.classList.add("show-delete-confirmation");
    console.log(hiddenImageID);

    
}

function closeItemDeleteConfirmation(imageID,nameID,stockID,alertID,deleteID,buttonsID){
    let hiddenImageID = document.getElementById(imageID);
    let hiddenNameID = document.getElementById(nameID);
    let hiddenStockID = document.getElementById(stockID);
    let hiddenAlertID = document.getElementById(alertID);

    let shownDeleteID = document.getElementById(deleteID);
    let shownButtonsID = document.getElementById(buttonsID);

    hiddenImageID.classList.remove("hide-category");
    hiddenNameID.classList.remove("hide-category");
    hiddenStockID.classList.remove("hide-category");
    hiddenAlertID.classList.remove("hide-category");

    shownDeleteID.classList.remove("show-delete-confirmation");
    shownButtonsID.classList.remove("show-delete-confirmation");
    console.log(hiddenImageID);
}

function openItemModal(id){
    let popup=document.getElementById(id);
    console.log(popup);
    popup.classList.add("open-popup")
}

var xValues = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var yValues = [55, 49, 44, 24, 15, 13, 34, 64, 23, 15, 63, 13];
var barColors = "blue";

new Chart("myChart", {
  type: "bar",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {legend: {display: false},
    title: {
      display: true,
      text: "Stock 2025"
    }}
});
function openItemsPopup(id ,count){
    let popup=document.getElementById(id);
    console.log(popup);
    popup.classList.add("open-popup");
    
}
function closeItemsPopup(id)
{
    let popup=document.getElementById(id);
    popup.classList.remove("open-popup");
}

function openPopup(id ,count){
    let popup=document.getElementById(id);
    console.log(popup);
    popup.classList.add("open-popup");
    renameCount=count;
}
function closePopup()
{
    popup.classList.remove("open-popup");
}