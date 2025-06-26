function openPopup(id, count) {
    const popup = document.getElementById(id);
    popup.classList.toggle("open-popup");
    renameCount = count;
}

function closePopup(id) {
    const popup = document.getElementById(id);
    popup.classList.remove("open-popup");
    const error2 = document.getElementById('error-text-div-2');
    const error3 = document.getElementById('error-text-div-3');
    error2?.classList.remove("show-error");
    error3?.classList.remove("show-error");
}

function openDeleteConfimation(nameID, countID, renameID, deleteID, itemsID, deleteTextID, deleteButtonsID) {
    [nameID, countID, renameID, deleteID, itemsID].forEach(id => document.getElementById(id).classList.add("hide-category"));
    [deleteTextID, deleteButtonsID].forEach(id => document.getElementById(id).classList.add("show-delete-confirmation"));
}

function closeDeleteConfimation(nameID, countID, renameID, deleteID, itemsID, deleteTextID, deleteButtonsID) {
    [nameID, countID, renameID, deleteID, itemsID].forEach(id => document.getElementById(id).classList.remove("hide-category"));
    [deleteTextID, deleteButtonsID].forEach(id => document.getElementById(id).classList.remove("show-delete-confirmation"));
}

function openRenameCategoryErrorPopup(errMessage) {
    const errorPopup = document.getElementById('error-text-div-3');
    const error = `Error : ${errMessage}`;
    document.querySelector('.error-text-3').innerHTML = error;
    errorPopup.classList.add("show-error");
}

function openAddCategoryErrorPopup(errMessage) {
    const errorPopup = document.getElementById('error-text-div-2');
    const error = `Error : ${errMessage}`;
    document.querySelector('.error-text-2').innerHTML = error;
    errorPopup.classList.add("show-error");
}

function toggleExportOptions() {
  const exportOptions = document.getElementById('export-options');
  exportOptions.style.display = exportOptions.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', function(e) {
  const dropdown = document.querySelector('.export-dropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    const options = document.getElementById('export-options');
    if (options) options.style.display = 'none';
  }
});


window.openPopup = openPopup;
window.closePopup = closePopup;
window.openDeleteConfimation = openDeleteConfimation;
window.closeDeleteConfimation = closeDeleteConfimation;
window.openRenameCategoryErrorPopup = openRenameCategoryErrorPopup;
window.openAddCategoryErrorPopup = openAddCategoryErrorPopup;
