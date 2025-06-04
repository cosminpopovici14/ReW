const http = require('http');
const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');
const { type } = require('os');
const { Client } = require('pg');
const client = new Client({
        user: 'postgres',
        password: 'STUDENT',
        host: 'localhost',
        port: 5432,
        database: 'rew-database',
    })   
client.connect();


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
        client.query('SELECT * from categories ORDER BY id',(err,content)=>{
            if (err) {
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            let parsed = JSON.stringify({categories : content.rows});
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(parsed);
        })
    return;
    }
    
    if(req.method === 'GET' && /^\/api\/categories\/\d+$/.test(req.url)){
        let id = parseInt(req.url.split('/',4)[3]);
         client.query('SELECT * from categories where id = $1',[id],(err,content)=>{
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            let parsed = JSON.stringify(content.rows);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(parsed);
        })
        return;
    }

    if (req.method === 'POST' && req.url === '/api/categories') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            const newCategory = JSON.parse(body);
            client.query('INSERT INTO categories (name) VALUES($1)',[newCategory.name],(err,content)=>{
            
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end("Added Category!");
            })
            // fs.readFile('./data/categories.json', 'utf-8', (err, data) => {
            // if (err) {
            //     res.writeHead(500);
            //     res.end('Server Error');
            //     return;
            // }    
            // const parsed = JSON.parse(data || '{"categories": []}');
            // console.log(parsed.categories.length)
            // let newId=0;
            // if(parsed.categories.length === 0){
            //     newId = 1;
            // } else{
            //     newId = parsed.categories.length + 1;
            // }
            // parsed.categories.push({ id: newId, name: newCategory.name, items: [] });

            // fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
            //     res.writeHead(201);
            //     res.end();
            // });
            // });
        });
        return;
    }


    if(req.method === 'PUT' && req.url === "/api/categories"){
        let body = '';
        req.on('data', chunk => (body+=chunk));
        req.on('end', ()=>{
            const renamedCategory = JSON.parse(body);
            client.query('UPDATE categories SET name=$1 WHERE id=$2',[renamedCategory.name,renamedCategory.id],(err,content)=>{
            
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end("Edited Category!");
            })


            // fs.readFile('./data/categories.json', 'utf-8', (err,data)=>{
            //     if (err) {
            //         res.writeHead(500);
            //         res.end('Server Error');
            //         return;
            //     }
            //     const parsed = JSON.parse(data || '{categories: []}');
            //     console.log(parsed);
            //     if(changeName(parsed.categories,renamedCategory.id,renamedCategory.name)=== false){
            //         res.writeHead(404);
            //         res.end('ID Not Found');
            //         return;
            //     }
            //     fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
            //     res.writeHead(201);
            //     res.end();
            //     });     
            // });
        });
        return;
    }

    if(req.method === 'DELETE' && req.url=== '/api/categories')
    {
        let body='';
        req.on('data', chunk =>{body+=chunk});
        req.on('end', ()=>{
            const deletedCategory = JSON.parse(body);
            client.query('DELETE FROM categories WHERE id=$1',[deletedCategory.id],(err,content)=>{
            
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end("Deleted Category!");
            })
            // fs.readFile('./data/categories.json','utf-8', (err,data)=>{
            //     if(err){
            //         res.writeHead(500);
            //         res.end('Server Error');
            //         return;
            //     }
                
            //     let parsed = JSON.parse(data || '{categories:[]}');
            //     if(deleteCategory(parsed.categories,deletedCategory.id) == false){
            //         res.writeHead(404);
            //         res.end('ID not Found');
            //     }
            //     fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
            //     res.writeHead(201);
            //     res.end();
            //     }); 
            // });
        });
        return;
    }
    


    //FOR ITEMS:
    if(req.method === 'GET' && /^\/api\/categories\/\d+\/items$/.test(req.url))
    {
        let id = parseInt(req.url.split('/',5)[3]);

        client.query(
        `SELECT 
            i.id,
            i.name,
            i.quantity,
            p.consumable,
            a.alertdeqtime,
            p.favourite,
            d.added_date as date,
            a.lastcheckdate
        FROM items i
        JOIN item_properties p on i.id = p.item_id
        JOIN item_alerts a on i.id = a.item_id
        JOIN item_dates d on i.id = d.item_id
        WHERE i.category_id = $1
        ORDER BY id ASC`
            ,[id],(err,content)=>{
            
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            let parsed = JSON.stringify(content.rows);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(parsed);
            })

        // fs.readFile('./data/categories.json', 'utf-8', (err, content) => {
        //     if (err) {
        //         res.writeHead(500);
        //         res.end('Server Error');
        //         return;
        //     }
        //     let parsed = JSON.parse(content);
        //     let myCategory = parsed.categories.find(c => c.id === id);
        //     if(!myCategory)
        //     {
        //         res.writeHead(404);
        //         res.end('Category Not Found');
        //         return;
        //     }
        //     res.writeHead(200, { 'Content-Type': 'application/json' });
        //     res.end(JSON.stringify(myCategory.items)); 
        // });
        return;
    }


    if (req.method === 'POST' && /^\/api\/categories\/\d+\/items$/.test(req.url)) 
    {
        let id = parseInt(req.url.split('/',5)[3]);
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            const newItem = JSON.parse(body);


            //items
            client.query(`INSERT INTO items(category_id,name,quantity)
                          VALUES($1,$2,$3) RETURNING id`
            ,[id,newItem.name,newItem.quantity],(err,content)=>{
            
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }

            let itemId = content.rows[0].id;

            //item_properties
            client.query(`INSERT INTO item_properties (consumable,favourite,item_id)
                          VALUES($1,$2,$3)`,
                        [newItem.consumable,newItem.favourite,itemId],(err1,content)=>{
                            if (err1) {
                                console.log(err1);
                                res.writeHead(500);
                                res.end('Eroare server');
                                return;
                            }
                        
                        //item_alerts
                        client.query(`INSERT INTO item_alerts(alert,alertdeqtime,lastcheckdate,item_id)
                                      VALUES($1,$2,$3,$4)`,
                                    [newItem.alert,newItem.alertdeqtime,newItem.lastcheckdate,itemId],(err2,content)=>{
                                         if (err2) {
                                            console.log(err2);
                                            res.writeHead(500);
                                            res.end('Eroare server');
                                            return;
                                        }

                                        //item_dates
                                        client.query(`INSERT INTO item_dates(quantity,added_date,item_id)
                                                      VALUES($1,$2,$3)`,
                                                    [newItem.quantity,newItem.date,itemId],(err3,content)=>{
                                                        if (err3) {
                                                            console.log(err3);
                                                            res.writeHead(500);
                                                            res.end('Eroare server');
                                                            return;
                                                        }

                                                        res.writeHead(200, { 'Content-Type': 'application/json' });
                                                        res.end("Added new Item");
                                                    })
                                    })
                        })

            })

            
            // fs.readFile('./data/categories.json', 'utf-8', (err, data) => {
            // if (err) {
            //     res.writeHead(500);
            //     res.end('Server Error');
            //     return;
            // }    
            // const parsed = JSON.parse(data || '{"categories": []}');
            // let myCategory = parsed.categories.find(c => c.id === id);

            // if(!myCategory){
            //     res.writeHead(404);
            //     res.end('Category not found');
            //     return;
            // }
           
            // let newId=0;
            // if(myCategory.items.length === 0){
            //     newId = 1;
            // } else{
            //     newId = myCategory.items.length + 1;
            // }
            // myCategory.items.push({ 
            //     id: newId, 
            //     name: newItem.name, 
            //     quantity: newItem.quantity, 
            //     consumable:newItem.consumable, 
            //     alertdeqtime:newItem.alertdeqtime, 
            //     alert:newItem.alert,
            //     date:newItem.date 
            // });

            // fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
            //     res.writeHead(201);
            //     res.end();
            // });
            // });
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
            

            client.query(`UPDATE items SET category_id =$1,
                                           name = $2,
                                           quantity = $3
                                           WHERE id=$4`
            ,[id,editedItem.name,editedItem.quantity,editedItem.id],(err,content)=>{
            
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }



            //item_properties
            client.query(`UPDATE item_properties SET consumable =$1,
                                           favourite = $2
                                           WHERE item_id=$3`,
                        [editedItem.consumable,editedItem.favourite,editedItem.id],(err1,content)=>{
                            if (err1) {
                                console.log("err1 : " ,err1);
                                res.writeHead(500);
                                res.end('Eroare server');
                                return;
                            }
                        
                        //item_alerts
                        client.query(`UPDATE item_alerts SET alert =$1,
                                           alertdeqtime = $2,
                                           lastcheckdate = $3
                                           WHERE item_id=$4`,
                                    [editedItem.alert,editedItem.alertdeqtime,editedItem.lastcheckdate,editedItem.id],(err2,content)=>{
                                         if (err2) {
                                            console.log("err2 : " ,err2);
                                            res.writeHead(500);
                                            res.end('Eroare server');
                                            return;
                                        }

                                        //item_dates
                                        client.query(`UPDATE item_dates  SET quantity =$1,
                                                    added_date = $2
                                                    WHERE item_id=$3`,
                                                    [editedItem.quantity,editedItem.date,editedItem.id],(err3,content)=>{
                                                        if (err3) {
                                                            console.log("err3 : " ,err3);
                                                            res.writeHead(500);
                                                            res.end('Eroare server');
                                                            return;
                                                        }

                                                        res.writeHead(200, { 'Content-Type': 'application/json' });
                                                        res.end("Edited the Item");
                                                    })
                                    })
                        })

            })


            // fs.readFile('./data/categories.json', 'utf-8', (err,data)=>{
            //     if (err) {
            //         res.writeHead(500);
            //         res.end('Server Error');
            //         return;
            //     }
            //     const parsed = JSON.parse(data || '{categories: []}');
            //     let myCategory = parsed.categories.find(c => c.id === id);
            //     if(changeItem(
            //         myCategory.items,
            //         editedItem.id,
            //         editedItem.name,
            //         editedItem.quantity,
            //         editedItem.consumable,
            //         editedItem.alertdeqtime,
            //         editedItem.alert,
            //         editedItem.favourite,
            //         editedItem.date)=== false)
            //     {
            //         res.writeHead(404);
            //         res.end('ID Not Found');
            //         return;
            //     }
            //     fs.writeFile('./data/categories.json', JSON.stringify(parsed,null,2), () => {
            //     res.writeHead(201);
            //     res.end();
            //     });     
            // });
        });
        return;
    }
     if(req.method === 'PATCH' && /^\/api\/categories\/\d+\/items$/.test(req.url)){
  
        let id = parseInt(req.url.split('/',5)[3]);
        let body = '';
        req.on('data', chunk => (body+=chunk));
        req.on('end', ()=>{
            const editedItem = JSON.parse(body);
            
           
            if(editedItem.name)
                client.query('UPDATE items SET name=$1 WHERE id=$2',[editedItem.name,editedItem.id],(err,content)=>{

                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                    })
            else if(editedItem.quantity)
                client.query('UPDATE items SET quantity=$1 WHERE id=$2',[editedItem.quantity,editedItem.id],(err,content)=>{
                    
                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                    })
            else if(editedItem.consumable === true || editedItem.consumable === false)
                client.query('UPDATE item_properties SET consumable=$1 WHERE item_id=$2',[editedItem.consumable,editedItem.id],(err,content)=>{
            
                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                    })
            else if(editedItem.alertdeqtime)
                        client.query('UPDATE item_alerts SET alertdeqtime=$1 WHERE item_id=$2',[editedItem.alertdeqtime,editedItem.id],(err,content)=>{
                    
                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                    })
            else if(editedItem.alert=== true || editedItem.alert === false)
                client.query('UPDATE item_alerts SET alert=$1 WHERE item_id=$2',[editedItem.alert,editedItem.id],(err,content)=>{
            
                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                    })
            else if(editedItem.favourite=== true || editedItem.favourite === false)
                        client.query('UPDATE item_properties SET favourite=$1 WHERE item_id=$2',[editedItem.favourite,editedItem.id],(err,content)=>{
                    
                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                    })
            else if(editedItem.date)
                client.query('UPDATE item_dates SET added_date=$1 WHERE item_id=$2',[editedItem.date,editedItem.id],(err,content)=>{
            
                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                    })
            else if(editedItem.lastcheckdate)
                client.query('UPDATE item_alerts SET lastcheckdate=$1 WHERE item_id=$2',[editedItem.lastcheckdate,editedItem.id],(err,content)=>{
            
                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                    })
            })
        return;
    }

     if(req.method === 'DELETE' && /^\/api\/categories\/\d+\/items$/.test(req.url))
    {
        let id = parseInt(req.url.split('/',5)[3]);
        let body='';
        req.on('data', chunk =>{body+=chunk});
        req.on('end', ()=>{
            const deletedItem = JSON.parse(body);
             client.query('DELETE FROM items WHERE id=$1',[deletedItem.id],(err,content)=>{
            
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end("Deleted Item!");
            })
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



function changeItem(obj,objId,newName,newQuantity,newConsumable,newalertdeqtime,newAlert,newFavourite,newDate){
    let ok=0;
    obj.forEach(obj=>{
        if(obj.id==objId){
            obj.name=newName;
            obj.quantity=newQuantity;
            obj.consumable=newConsumable;
            obj.alertdeqtime=newalertdeqtime;
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
            else if(editedObj.alertdeqtime)
                obj.alertdeqtime = editedObj.alertdeqtime;
            else if(editedObj.alert=== true || editedObj.alert === false)
                obj.alert = editedObj.alert ;
            else if(editedObj.favourite=== true || editedObj.favourite === false)
                obj.favourite = editedObj.favourite ;
            else if(editedObj.date)
                obj.date = editedObj.date;
            else if(editedObj.lastcheckdate)
                obj.lastcheckdate = editedObj.lastcheckdate;
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