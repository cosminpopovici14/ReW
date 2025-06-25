let totalItems;
let totalCategories;
 new FinisherHeader({
  "count": 10,
  "size": {
    "min": 1300,
    "max": 1500,
    "pulse": 0
  },
  "speed": {
    "x": {
      "min": 0,
      "max": 0.1
    },
    "y": {
      "min": 0,
      "max": 0.1
    }
  },
  "colors": {
    "background": "#e7e5e2",
    "particles": [
      "#777a7f",
      "#d6d9d6",
      "#f086b1",
      "#9fb6b4",
      "#acb2b1"
    ]
  },
  "blending": "overlay",
  "opacity": {
    "center": 0.5,
    "edge": 0.05
  },
  "skew": 0,
  "shapes": [
    "c"
  ]
});
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