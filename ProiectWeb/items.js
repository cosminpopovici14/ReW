

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