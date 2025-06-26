async function init() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    categories = data.categories;
    console.log(categories);

    categories.forEach(category => {
        fetch(`/api/categories/${category.id}/export/csv`);
        fetch(`/api/categories/${category.id}/export/json`);
        fetch(`/api/categories/${category.id}/export/xml`);
    });

    await fetch(`/api/categories/export/csv`);
    await fetch(`/api/categories/export/json`);
    await fetch(`/api/categories/export/xml`);
    printCategory();
}

async function getCategoryItemsExport(categoryID) {
    await fetch(`/api/categories/${categoryID}/items/export/csv`);
    await fetch(`/api/categories/${categoryID}/items/export/json`);
    await fetch(`/api/categories/${categoryID}/items/export/xml`);
}

async function PostCategory(body) {
    try {
        const res = await fetch('/api/categories', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: body })
        });

        if (!res.ok) throw new Error(await res.text());

        closePopup('add-popup');
        init();
    } catch (err) {
        console.log("Eroare post", err.message);
        openAddCategoryErrorPopup(err.message);
    }
}

async function PutCategory(id, body) {
    try {
        const res = await fetch('/api/categories', {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name: body })
        });

        if (!res.ok) throw new Error(await res.text());

        closePopup('rename-popup');
        init();
    } catch (err) {
        console.log("Eroare PUT", err.message);
        openRenameCategoryErrorPopup(err.message);
    }
}

async function DeleteCategory(id) {
    await fetch('/api/categories', {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    init();
}

window.init = init;
window.getCategoryItemsExport = getCategoryItemsExport;
window.PostCategory = PostCategory;
window.PutCategory = PutCategory;
window.DeleteCategory = DeleteCategory;