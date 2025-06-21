
let categories = [];
let renameCount = 0;

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
            "#c9ae30",
            "#9fb6b4",
            "#b1b2ac"
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

var cursor = document.getElementById('cursor');
document.addEventListener('mousemove', function (e) {
    var x = e.clientX;
    var y = e.clientY;
    cursor.style.left = x - 15 + "px";
    cursor.style.top = y - 15 + "px";
})



async function init() {
    const res = await fetch('/api/categories')
    const data = await res.json();
    categories = data.categories;
    console.log(categories);
    categories.forEach(category => {
        let res = fetch(`/api/categories/${category.id}/export`);
    })
    await fetch(`/api/categories/export`);
    printCategory();
    getTotalItems();

};
async function getCategoryItemsExport(categoryID) {
    let res = await fetch(`/api/categories/${categoryID}/items/export`);
}
async function PostCategory(body) {

    try {
        const res = await fetch('/api/categories', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "name": body })
        })
        if (!res.ok) {
            const errorMsg = await res.text();
            throw new Error(errorMsg);
        }
        else {

            closePopup('add-popup');
            init();
        }
    } catch (err) {
        console.log("Eroare post ", err.message);
        openAddCategoryErrorPopup(err.message);
    }
}

async function PutCategory(id, body) {
    try {
        const res = await fetch('/api/categories', {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "id": id,
                "name": body
            })
        })
        if (!res.ok) {
            const errorMsg = await res.text();
            throw new Error(errorMsg);
        }
        else {

            closePopup('rename-popup');
            init();
        }
    } catch (err) {
        console.log("Eroare post ", err.message);
        openRenameCategoryErrorPopup(err.message);
    }

}

async function DeleteCategory(id) {

    const res = await fetch('/api/categories', {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "id": id
        })
    });

    init();
}

init();


function renameCategory() {
    var text = document.getElementById("category-rename-input").value;
    if (text === "")
        text = null;
    PutCategory(renameCount, text);

}


function addCategory() {

    var text = document.getElementById("category-name-input").value;
    if (text === "")
        text = null;
    PostCategory(text);

}

function printCategory() {
    let categoriesHTML = '';
    let count = 0;
    categoriesExportButton = `
<a href="Downloads/categories.csv" download="categories.csv">
<button class="export-button">Export CSV</button>
</a>
`
    categories.forEach((category) => {

        console.log("EXPORTBUTTON ", categoriesExportButton);
        categoriesHTML += `
    <div class="category" id="category-${category.id}">
                        <div class="category-name" id="category-name-${category.id}">
                            <h1>${category.name}</h1>
                            
                        </div>
                        <div class="delete-text" id="delete-text-${category.id}">
                            <h2> Are you sure you want to delete? </h2>
                        </div>
                        <div class="category-items-count" id="category-items-count-${category.id}">
                            <p>0 items</p>
                        </div>
                        <div class="category-rename" id="category-rename-${category.id}">
                            <button id="rename-button" onclick="openPopup('rename-popup',${category.id})"> Rename </button>
                        </div>
                        <div class="category-delete" id="category-delete-${category.id}">
                            <button id="delete-button" onclick= "openDeleteConfimation('category-name-${category.id}','category-items-count-${category.id}','category-rename-${category.id}','category-delete-${category.id}','category-view-items-${category.id}','delete-text-${category.id}','delete-buttons-${category.id}')" > Delete </button>
                        </div>
                        <div class="category-view-items" id="category-view-items-${category.id}">
                            <a href="items.html?categoryID=${category.id}" >
                             <button onclick="getCategoryItemsExport(${category.id})"> View Items </button>
                            </a>
                        </div>
                        <div class="delete-buttons" id="delete-buttons-${category.id}">
                           <button id="view-items-button-yes" onclick="DeleteCategory('${category.id}')"> Yes </button>
                           <button id="view-items-button-no" onclick= "closeDeleteConfimation('category-name-${category.id}','category-items-count-${category.id}','category-rename-${category.id}','category-delete-${category.id}','category-view-items-${category.id}','delete-text-${category.id}','delete-buttons-${category.id}')"> No </button>
                        </div>
                    </div>
                `;
    });

    document.querySelector('.js-categories-page').innerHTML = categoriesHTML;
    document.querySelector('#export-categories-button').innerHTML = categoriesExportButton;
}





if (categories == null) {
    categories = [];
}
console.log("alooooooooooo!!");


function openPopup(id, count) {
    let popup = document.getElementById(id);
    console.log(popup);
    popup.classList.toggle("open-popup");
    renameCount = count;
}
function openMenuPopup() {
    let popup = document.getElementById('dropdown-content');
    popup.classList.toggle("open-popup");
    let menuBar = document.getElementById('menu-bar');
    console.log(menuBar)
    menuBar.style.rotate = menuBar.style.rotate === '90deg' ? '0deg' : '90deg';


}

function openDeleteConfimation(nameID, countID, renameID, deleteID, itemsID, deleteTextID, deleteButtonsID) {

    let hiddenNameId = document.getElementById(nameID);
    let hiddenCountId = document.getElementById(countID);
    let hiddenRenameId = document.getElementById(renameID);
    let hiddenDeleteId = document.getElementById(deleteID);
    let hiddenItemsId = document.getElementById(itemsID);


    let shownDeleteTextID = document.getElementById(deleteTextID);
    let shownDeleteButtonsID = document.getElementById(deleteButtonsID);


    hiddenNameId.classList.add("hide-category");
    hiddenCountId.classList.add("hide-category");
    hiddenRenameId.classList.add("hide-category");
    hiddenDeleteId.classList.add("hide-category");
    hiddenItemsId.classList.add("hide-category");



    shownDeleteTextID.classList.add("show-delete-confirmation");
    shownDeleteButtonsID.classList.add("show-delete-confirmation");
    console.log(hiddenNameId);

}
function closeDeleteConfimation(nameID, countID, renameID, deleteID, itemsID, deleteTextID, deleteButtonsID) {

    let hiddenNameId = document.getElementById(nameID);
    let hiddenCountId = document.getElementById(countID);
    let hiddenRenameId = document.getElementById(renameID);
    let hiddenDeleteId = document.getElementById(deleteID);
    let hiddenItemsId = document.getElementById(itemsID);


    let shownDeleteTextID = document.getElementById(deleteTextID);
    let shownDeleteButtonsID = document.getElementById(deleteButtonsID);


    hiddenNameId.classList.remove("hide-category");
    hiddenCountId.classList.remove("hide-category");
    hiddenRenameId.classList.remove("hide-category");
    hiddenDeleteId.classList.remove("hide-category");
    hiddenItemsId.classList.remove("hide-category");



    shownDeleteTextID.classList.remove("show-delete-confirmation");
    shownDeleteButtonsID.classList.remove("show-delete-confirmation");
    console.log(hiddenNameId);

}

function closePopup(id) {
    console.log(id);
    let popup = document.getElementById(id);
    popup.classList.remove("open-popup");
    error2 = document.getElementById('error-text-div-2')
    error2.classList.remove("show-error");
    error3 = document.getElementById('error-text-div-3')
    error3.classList.remove("show-error");
}


function openRenameCategoryErrorPopup(errMessage) {
    let errorPopup = document.getElementById('error-text-div-3')
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA", errorPopup)
    let error = `Error : ${errMessage}`;
    document.querySelector('.error-text-3').innerHTML = error;
    errorPopup.classList.add("show-error");

}

function openAddCategoryErrorPopup(errMessage) {
    let errorPopup = document.getElementById('error-text-div-2')
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA", errorPopup)
    let error = `Error : ${errMessage}`;
    document.querySelector('.error-text-2').innerHTML = error;
    errorPopup.classList.add("show-error");

}







