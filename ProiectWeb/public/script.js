
let categories = [];
let renameCount=0;


async function init(){
    const res = await fetch('/api/categories')
    const data = await res.json();
    categories = data.categories;
    console.log(categories); 
    printCategory();
};

async function PostCategory(body){

    const res = await fetch('/api/categories', {
        method: "POST",
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({"name" : body})
    })

    init();
}

async function PutCategory(id,body){

    const res = await fetch('/api/categories', {
        method: "PUT",
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
            "id" : id,
            "name" : body})
    })

    init();
}

async function DeleteCategory(id){

    const res = await fetch('/api/categories', {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
            "id" : id})
    });

    init();
}

init();






function renameCategory(){
    var text = document.getElementById("category-rename-input").value;
    PutCategory(renameCount,text);
   
}


function addCategory(){
    
    var text = document.getElementById("category-name-input").value;
    PostCategory(text);
    
}

function deleteDivFromCategories(id)
{
    console.log("script:", id);
    DeleteCategory(id);
}


function printCategory(){
let categoriesHTML ='';
let count = 0;
categories.forEach((category) =>{
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
                            <button id="view-items-button" > View Items </button>
                        </div>
                        <div class="delete-buttons" id="delete-buttons-${category.id}">
                           <button id="view-items-button-yes" onclick="deleteDivFromCategories('${category.id}')"> Yes </button>
                           <button id="view-items-button-no" onclick= "closeDeleteConfimation('category-name-${category.id}','category-items-count-${category.id}','category-rename-${category.id}','category-delete-${category.id}','category-view-items-${category.id}','delete-text-${category.id}','delete-buttons-${category.id}')"> No </button>
                        </div>
                    </div>
                `;
});

document.querySelector('.js-categories-page').innerHTML = categoriesHTML;
}





if(categories == null)
{
    categories = [];
}
console.log("alooooooooooo!!");


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




