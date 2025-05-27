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
        file = req.url;
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
    if(req.method === 'GET' && req.url.startsWith('/api/categories/')){
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
            parsed.categories.push({ id: newId, name: newCategory.name });

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
//POST - CREATE

//GET -READ

//PUT - UPDATE

//DELETE - DELETE