let totalItems;
let totalCategories;

async function init() {
    let itemRes = await fetch('/api/items/count');

    totalItems = await itemRes.json();

    let categoriesRes = await fetch ('/api/categories/count');

    totalCategories = await categoriesRes.json();

    let lowRes = await fetch ('/api/lowItems/count');
    totalLowItems = await lowRes.json();

    console.log("Categories ",totalCategories);

    displayStatistics();
}

init();

function displayStatistics() {

    console.log(totalItems);  

    let totals = ` <div class="welcome-page-statistic">
                         <div class = welcome-page-total-items> 
                          Total items: <b id = "total-items-count">${totalItems}</b> 
                        </div>
                    </div>
                    <div class="welcome-page-statistic">
                        <div class = welcome-page-categories> Total Categories: <b>${totalCategories}</b></div>
                   </div>
                   <div class="welcome-page-statistic">
                    <div class = welcome-page-total-low-stock> Low Stock Items: <b>${totalLowItems}</b></div>
               </div>`
    document.querySelector('#welcome-page-statistics-block').innerHTML = totals;
}

function openMenuPopup() {
    let popup = document.getElementById('dropdown-content');
    popup.classList.toggle("open-popup");
    let menuBar = document.getElementById('menu-bar');
    console.log(menuBar)
    menuBar.style.rotate = menuBar.style.rotate === '90deg' ? '0deg' : '90deg';


}