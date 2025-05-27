

let categories = JSON.parse(localStorage.getItem("categories"));
let renameCount=0;
console.log(categories);


if(categories == null)
{
    categories = [];
}
console.log("alooooooooooo!!");
function deleteDivFromCategories(id)
{
    console.log(id);
    let startOfIndex = 9;
    let categoryNumber = id.slice(startOfIndex);
    categoryNumber = parseInt(categoryNumber);
    categories.splice(categoryNumber,1);
    console.log(categories);
    localStorage.setItem("categories",JSON.stringify(categories));
    elmnt = document.getElementById(id);
    elmnt.remove();
    window.location.reload();
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

function openDeleteConfimation(nameID,countID,renameID,deleteID,itemsID,deleteTextID,deleteButtonsID){
   
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
function closeDeleteConfimation(nameID,countID,renameID,deleteID,itemsID,deleteTextID,deleteButtonsID){
   
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

function closePopup(id)
{
    console.log(id);
    let popup=document.getElementById(id);
    popup.classList.remove("open-popup");
}

function renameCategory(){
    var text = document.getElementById("category-rename-input").value;
    categories[renameCount] = text;
    localStorage.setItem("categories",JSON.stringify(categories));
    window.location.reload();
}
function getCategory(){
    
    var text = document.getElementById("category-name-input").value;
    categories.push(text);
    console.log(categories);
    localStorage.setItem("categories",JSON.stringify(categories));
    window.location.reload();
}

let categoriesHTML ='';
let count = 0;
categories.forEach((category) =>{
categoriesHTML += `
    <div class="category" id="category-${count++}">
                        <div class="category-name" id="category-name-${count-1}">
                            <h1>${category}</h1>
                            
                        </div>
                        <div class="delete-text" id="delete-text-${count-1}">
                            <h2> Are you sure you want to delete? </h2>
                        </div>
                        <div class="category-items-count" id="category-items-count-${count-1}">
                            <p>0 items</p>
                        </div>
                        <div class="category-rename" id="category-rename-${count-1}">
                            <button id="rename-button" onclick="openPopup('rename-popup',${count-1})"> Rename </button>
                        </div>
                        <div class="category-delete" id="category-delete-${count-1}">
                            <button id="delete-button" onclick= 
                            "openDeleteConfimation('category-name-${count-1}',
                            'category-items-count-${count-1}',
                            'category-rename-${count-1}',
                            'category-delete-${count-1}',
                            'category-view-items-${count-1}','delete-text-${count-1}',
                            'delete-buttons-${count-1}')" > Delete </button>
                        </div>
                        <div class="category-view-items" id="category-view-items-${count-1}">
                            <a href="./items.html"><b> View Items </b></a>
                        </div>
                        <div class="delete-buttons" id="delete-buttons-${count-1}">
                           <button id="view-items-button-yes" onclick="deleteDivFromCategories('category-${count-1}')"> Yes </button>
                           <button id="view-items-button-no" onclick= 
                           "closeDeleteConfimation('category-name-${count-1}',
                           'category-items-count-${count-1}','category-rename-${count-1}',
                           'category-delete-${count-1}','category-view-items-${count-1}',
                           'delete-text-${count-1}','delete-buttons-${count-1}')"> No </button>
                        </div>
                    </div>
                `;
});

document.querySelector('.js-categories-page').innerHTML = categoriesHTML;

