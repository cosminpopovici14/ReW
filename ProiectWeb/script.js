

let categories = JSON.parse(localStorage.getItem("categories"));

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



function openPopup(id){
    let popup=document.getElementById(id);
    console.log(popup);
    popup.classList.add("open-popup");
}

function closePopup()
{
    popup.classList.remove("open-popup");
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
                        <div class="category-name">
                            <h1>${category}</h1>
                        </div>
                        <div class="category-items-count">
                            <p>0 items</p>
                        </div>
                        <div class="category-rename">
                            <button id="rename-button"> Rename </button>
                        </div>
                        <div class="category-delete">
                            <button id="delete-button" onclick= "deleteDivFromCategories('category-${count-1}')" > Delete </button>
                        </div>
                        <div class="category-view-items">
                            <button id="view-items-button" > View Items </button>
                        </div>
                    </div>
                `;
});

document.querySelector('.js-categories-page').innerHTML = categoriesHTML;

