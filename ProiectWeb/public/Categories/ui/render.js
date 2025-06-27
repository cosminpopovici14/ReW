function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function printCategory() {
    let categoriesHTML = '';
    const categoriesExportButton = `
  <div class="export-dropdown">
    <button class="export-button" onclick="toggleExportOptions()">Export</button>
    <div class="export-options" id="export-options">
      <a href="Downloads/categories.csv" download="categories.csv"><button>CSV</button></a>
      <a href="Downloads/categories.json" download="categories.json"><button>JSON</button></a>
      <a href="Downloads/categories.xml" download="categories.xml"><button>XML</button></a>
    </div>
  </div>
`;

    categories.forEach((category) => {
        const escapedName = escapeHTML(category.name);
        categoriesHTML += `
            <div class="category" id="category-${category.id}">
                <div class="category-name" id="category-name-${category.id}">
                    <h1>${escapedName}</h1>
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
                    <button id="delete-button" onclick="openDeleteConfimation('category-name-${category.id}','category-items-count-${category.id}','category-rename-${category.id}','category-delete-${category.id}','category-view-items-${category.id}','delete-text-${category.id}','delete-buttons-${category.id}')"> Delete </button>
                </div>
                <div class="category-view-items" id="category-view-items-${category.id}">
                    <a href="items.html?categoryID=${category.id}" >
                        <button onclick="getCategoryItemsExport(${category.id})"> View Items </button>
                    </a>
                </div>
                <div class="delete-buttons" id="delete-buttons-${category.id}">
                    <button id="view-items-button-yes" onclick="DeleteCategory('${category.id}')"> Yes </button>
                    <button id="view-items-button-no" onclick="closeDeleteConfimation('category-name-${category.id}','category-items-count-${category.id}','category-rename-${category.id}','category-delete-${category.id}','category-view-items-${category.id}','delete-text-${category.id}','delete-buttons-${category.id}')"> No </button>
                </div>
            </div>
        `;
    });

    document.querySelector('.js-categories-page').innerHTML = categoriesHTML;
    document.querySelector('#export-categories-button').innerHTML = categoriesExportButton;
}

function renameCategory() {
    let text = document.getElementById("category-rename-input").value;
    if (text === "") text = null;
    PutCategory(renameCount, text);
}

function addCategory() {
    let text = document.getElementById("category-name-input").value;
    if (text === "") text = null;
    PostCategory(text);
}

window.printCategory = printCategory;
window.renameCategory = renameCategory;
window.addCategory = addCategory;