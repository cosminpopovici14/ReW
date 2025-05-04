

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
    const elmnt = document.getElementById(id);
    console.log(elmnt);
    
    
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
categories.forEach((category) =>{
    categoriesHTML += `
    <div class="category" id="test">
                        <div class="category-name">
                            <h1>${category}</h1>
                        </div>
                        <div class="category-items-count">
                            <p>152 items</p>
                        </div>
                        <div class="category-rename">
                            <button id="rename-button"> Rename </button>
                        </div>
                        <div class="category-delete">
                            <button id="delete-button" onclick= "deleteDivFromCategories('test')" > Delete </button>
                        </div>
                        <div class="category-view-items">
                            <button id="view-items-button" > View Items </button>
                        </div>
                    </div>
                `;
});
console.log(categoriesHTML);
document.querySelector('.js-categories-page').innerHTML = categoriesHTML;