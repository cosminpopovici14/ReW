function openMenuPopup() {
    let popup = document.getElementById('dropdown-content');
    popup.classList.toggle("open-popup");
    let menuBar = document.getElementById('menu-bar');
    menuBar.style.rotate = menuBar.style.rotate === '90deg' ? '0deg' : '90deg';
}

window.openMenuPopup = openMenuPopup;