const http = require('http');
const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');
const { type } = require('os');

const server = http.createServer((req, res) => {
    
    let file = '';
    if(req.url ==='/') {
        file = 'index.html';
    } else{
        file =req.url.split('?')[0];
    }
    let filePath = path.join(__dirname, 'public', file);
    let ext = path.extname(filePath); 
    let contentType = 'text/html';

    if (req.method === 'GET' && req.url === '/api/categories') {
        fs.readFile('./data/categories.json', 'utf-8', (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(content);
        });
    return;
    }
    if(req.method === 'GET' && /^\/api\/categories\/\d+$/.test(req.url)){
        let id = parseInt(req.url.split('/',4)[3]);
         fs.readFile('./data/categories.json', 'utf-8', (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
            }
            let parsed = JSON.parse(content);
            let myCategory = parsed.categories.find(c => c.id === id);
            if(!myCategory)
            {
                res.writeHead(404);
                res.end('Category Not Found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(myCategory)); 
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/api/categories') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            const newCategory = JSON.parse(body);

            fs.readFile('./data/categories.json', 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
            }    
            const parsed = JSON.parse(data || '{"categories": []}');
            console.log(parsed.categories.length)
            let newId=0;
            if(parsed.categories.length === 0){
                newId = 1;
            } else{
                newId = parsed.categories.length + 1;
            }
            parsed.categories.push({ id: newId, name: newCategory.name, items: [] });

            fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
                res.writeHead(201);
                res.end();
            });
            });
        });
        return;
    }


    if(req.method === 'PUT' && req.url === "/api/categories"){
        let body = '';
        req.on('data', chunk => (body+=chunk));
        req.on('end', ()=>{
            const renamedCategory = JSON.parse(body);
            
            fs.readFile('./data/categories.json', 'utf-8', (err,data)=>{
                if (err) {
                    res.writeHead(500);
                    res.end('Server Error');
                    return;
                }
                const parsed = JSON.parse(data || '{categories: []}');
                console.log(parsed);
                if(changeName(parsed.categories,renamedCategory.id,renamedCategory.name)=== false){
                    res.writeHead(404);
                    res.end('ID Not Found');
                    return;
                }
                fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
                res.writeHead(201);
                res.end();
                });     
            });
        });
        return;
    }

    if(req.method === 'DELETE' && req.url=== '/api/categories')
    {
        let body='';
        req.on('data', chunk =>{body+=chunk});
        req.on('end', ()=>{
            const deletedCategory = JSON.parse(body);
            fs.readFile('./data/categories.json','utf-8', (err,data)=>{
                if(err){
                    res.writeHead(500);
                    res.end('Server Error');
                    return;
                }
                
                let parsed = JSON.parse(data || '{categories:[]}');
                if(deleteCategory(parsed.categories,deletedCategory.id) == false){
                    res.writeHead(404);
                    res.end('ID not Found');
                }
                fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
                res.writeHead(201);
                res.end();
                }); 
            });
        });
        return;
    }
    


    //FOR ITEMS:
    if(req.method === 'GET' && /^\/api\/categories\/\d+\/items$/.test(req.url))
    {
        let id = parseInt(req.url.split('/',5)[3]);
        fs.readFile('./data/categories.json', 'utf-8', (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
            }
            let parsed = JSON.parse(content);
            let myCategory = parsed.categories.find(c => c.id === id);
            if(!myCategory)
            {
                res.writeHead(404);
                res.end('Category Not Found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(myCategory.items)); 
        });
        return;
    }


    if (req.method === 'POST' && /^\/api\/categories\/\d+\/items$/.test(req.url)) 
    {
        let id = parseInt(req.url.split('/',5)[3]);
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            const newItem = JSON.parse(body);

            fs.readFile('./data/categories.json', 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
            }    
            const parsed = JSON.parse(data || '{"categories": []}');
            let myCategory = parsed.categories.find(c => c.id === id);

            if(!myCategory){
                res.writeHead(404);
                res.end('Category not found');
                return;
            }
           
            let newId=0;
            if(myCategory.items.length === 0){
                newId = 1;
            } else{
                newId = myCategory.items.length + 1;
            }
            myCategory.items.push({ 
                id: newId, 
                name: newItem.name, 
                quantity: newItem.quantity, 
                consumable:newItem.consumable, 
                alertDeqTime:newItem.alertDeqTime, 
                alert:newItem.alert,
                date:newItem.date 
            });

            fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
                res.writeHead(201);
                res.end();
            });
            });
        });
        return;
    }
    


    if(req.method === 'PUT' && /^\/api\/categories\/\d+\/items$/.test(req.url)){
        console.log("test");
        let id = parseInt(req.url.split('/',5)[3]);
        let body = '';
        req.on('data', chunk => (body+=chunk));
        req.on('end', ()=>{
            const editedItem = JSON.parse(body);
            
            fs.readFile('./data/categories.json', 'utf-8', (err,data)=>{
                if (err) {
                    res.writeHead(500);
                    res.end('Server Error');
                    return;
                }
                const parsed = JSON.parse(data || '{categories: []}');
                let myCategory = parsed.categories.find(c => c.id === id);
                if(changeItem(
                    myCategory.items,
                    editedItem.id,
                    editedItem.name,
                    editedItem.quantity,
                    editedItem.consumable,
                    editedItem.alertDeqTime,
                    editedItem.alert,
                    editedItem.favourite,
                    editedItem.date)=== false)
                {
                    res.writeHead(404);
                    res.end('ID Not Found');
                    return;
                }
                fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
                res.writeHead(201);
                res.end();
                });     
            });
        });
        return;
    }
     if(req.method === 'PATCH' && /^\/api\/categories\/\d+\/items$/.test(req.url)){
  
        let id = parseInt(req.url.split('/',5)[3]);
        let body = '';
        req.on('data', chunk => (body+=chunk));
        req.on('end', ()=>{
            const editedItem = JSON.parse(body);
            
            fs.readFile('./data/categories.json', 'utf-8', (err,data)=>{
                if (err) {
                    res.writeHead(500);
                    res.end('Server Error');
                    return;
                }
                const parsed = JSON.parse(data || '{categories: []}');
                let myCategory = parsed.categories.find(c => c.id === id);
                if(editItem(myCategory.items,editedItem)=== false)
                {
                    res.writeHead(404);
                    res.end('ID Not Found');
                    return;
                }
                fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
                res.writeHead(201);
                res.end();
                });     
            });
        });
        return;
    }

     if(req.method === 'DELETE' && /^\/api\/categories\/\d+\/items$/.test(req.url))
    {
        let id = parseInt(req.url.split('/',5)[3]);
        let body='';
        req.on('data', chunk =>{body+=chunk});
        req.on('end', ()=>{
            const deletedItem = JSON.parse(body);
            fs.readFile('./data/categories.json','utf-8', (err,data)=>{
                if(err){
                    res.writeHead(500);
                    res.end('Server Error');
                    return;
                }
                
                let parsed = JSON.parse(data || '{categories:[]}');
                let myCategory = parsed.categories.find(c => c.id === id);
                if(deleteCategory(myCategory.items,deletedItem.id) == false){
                    res.writeHead(404);
                    res.end('ID not Found');
                }
                fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
                res.writeHead(201);
                res.end();
                }); 
            });
        });
        return;
    }
    


    switch (ext) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


function changeName(obj, objId, newName) {
    let ok = 0;
    obj.forEach(obj=>{
        if (obj.id === objId){
            obj.name = newName
            ok=1;
        };
    });
    if(ok === 1)
        return true;
    else return false;
}

function deleteCategory(obj,objId){
    if(objId<1 || objId > obj.length){
        return false;
    }
    obj.splice(objId-1,1);
    for(let i = objId;i<obj.length+1;i++)
    {
        obj[i-1].id -=1;
    }
    return true;
    
}

function changeItem(obj,objId,newName,newQuantity,newConsumable,newAlertDeqTime,newAlert,newFavourite,newDate){
    let ok=0;
    obj.forEach(obj=>{
        if(obj.id==objId){
            obj.name=newName;
            obj.quantity=newQuantity;
            obj.consumable=newConsumable;
            obj.alertDeqTime=newAlertDeqTime;
            obj.alert=newAlert;
            obj.favourite = newFavourite;
            obj.date = newDate;
            ok=1;
        }
    });
    if(ok==1) return true;
    return false;
}

function editItem(obj, editedObj){
    let ok=0;
    console.log(editedObj);
    obj.forEach(obj=>{
        if(obj.id == editedObj.id)
        {
            if(editedObj.name)
                obj.name = editedObj.name;
            else if(editedObj.quantity)
                obj.quantity = editedObj.quantity;
            else if(editedObj.consumable === true || editedObj.consumable === false)
                obj.consumable = editedObj.consumable;
            else if(editedObj.alertDeqTime)
                obj.alertDeqTime = editedObj.alertDeqTime;
            else if(editedObj.alert=== true || editedObj.alert === false)
                obj.alert = editedObj.alert ;
            else if(editedObj.favourite=== true || editedObj.favourite === false)
                obj.favourite = editedObj.favourite ;
            else if(editedObj.date)
                obj.date = editedObj.date;
            else if(editedObj.lastCheckDate)
                obj.lastCheckDate = editedObj.lastCheckDate;
            ok=1;
        }
    });
    if(ok==1) return true;
    return false;
}


//POST - CREATE

//GET -READ

//PUT - UPDATE

//DELETE - DELETE