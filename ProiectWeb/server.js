const http = require('http');
const fs = require('fs');
const Json2csvParser = require("json2csv").Parser;
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
        `SELECT DISTINCT
            i.id,
            i.name,
            i.quantity,
            p.consumable,
            a.alert,
            a.alertdeqtime,
            p.favourite,
            d.added_date as date,
            a.lastcheckdate
        FROM items i
        JOIN item_properties p on i.id = p.item_id
        JOIN item_alerts a on i.id = a.item_id
        JOIN ( 
            select item_id,max(added_date) as added_date 
            from item_dates 
            group by item_id
        ) d on i.id = d.item_id
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
                                        client.query(`INSERT INTO item_dates (quantity, added_date, item_id)
                                                    VALUES ( $1, $2, $3)`,
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

    if(req.method === 'GET' && /^\/api\/categories\/\d+\/items\/\d+\/data$/.test(req.url)){
        let id = parseInt(req.url.split('/')[5]);
        
        client.query(
        `SELECT 
            added_date, quantity from item_dates 
            WHERE item_id = $1`
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

        return;
    }
    if (req.method === 'GET' && /^\/api\/categories\/\d+\/items\/\d+\/export$/.test(req.url)) {
  const id = parseInt(req.url.split('/')[5]);

  (async () => {
    try {
      await client.query('SELECT check_item_exists($1)', [id]);

      const content = await client.query(
        `SELECT DISTINCT
            i.id,
            i.name,
            i.quantity,
            p.consumable,
            a.alert,
            a.alertdeqtime,
            p.favourite,
            d.added_date AS date,
            a.lastcheckdate
         FROM items i
         LEFT JOIN item_properties p ON i.id = p.item_id
         LEFT JOIN item_alerts a ON i.id = a.item_id
         LEFT JOIN (
             SELECT item_id, MAX(added_date) AS added_date 
             FROM item_dates 
             GROUP BY item_id
         ) d ON i.id = d.item_id
         WHERE i.id = $1
         ORDER BY i.id ASC`,
        [id]
      );

      const jsonData = content.rows;
      const fields = Object.keys(jsonData[0]);
      const json2csvParser = new Json2csvParser({ fields, header: true });
      const csv = json2csvParser.parse(jsonData);

      fs.writeFile(`public/Downloads/item-${id}.csv`, csv, (error) => {
        if (error) {
          console.error(error);
          res.writeHead(500);
          res.end('Eroare la scrierea fișierului');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File Created Successfully' }));
      });
    } catch (err) {
      console.error('Eroare server:', err);
      const statusCode = err.message.includes('nu există') ? 404 : 500;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Eroare server' }));
    }
  })();

  return;
}



    if (req.method === 'GET' && /^\/api\/categories\/\d+\/items\/export$/.test(req.url)) {
  const id = parseInt(req.url.split('/')[3]);

  (async () => {
    try {
      await client.query('SELECT check_category_has_items($1)', [id]);

      const content = await client.query(
        `SELECT DISTINCT
            i.id,
            i.name,
            i.quantity,
            p.consumable,
            a.alert,
            a.alertdeqtime,
            p.favourite,
            d.added_date as date,
            a.lastcheckdate
         FROM items i
         JOIN item_properties p on i.id = p.item_id
         JOIN item_alerts a on i.id = a.item_id
         JOIN (
            SELECT item_id, MAX(added_date) AS added_date
            FROM item_dates
            GROUP BY item_id
         ) d ON i.id = d.item_id
         WHERE i.category_id = $1
         ORDER BY i.id ASC`,
        [id]
      );

      const jsonData = content.rows;
      const fields = Object.keys(jsonData[0]);
      const json2csvParser = new Json2csvParser({ fields, header: true });
      const csv = json2csvParser.parse(jsonData);

      fs.writeFile(`public/Downloads/category-${id}-items.csv`, csv, (error) => {
        if (error) {
          console.error(error);
          res.writeHead(500);
          res.end('Eroare la scrierea fișierului');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File Created Successfully' }));
      });
    } catch (err) {
      console.error('Eroare server:', err);
      const statusCode = err.message.includes('nu are iteme') ? 404 : 500;
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Eroare server' }));
    }
  })();

  return;
}


   if (req.method === 'GET' && /^\/api\/categories\/\d+\/export$/.test(req.url)) {
  const id = parseInt(req.url.split('/')[3]);

  (async () => {
    try {
      await client.query('SELECT check_category_exists($1)', [id]);

      const content = await client.query(
        `SELECT DISTINCT
            c.id,
            c.name,
            i.id as item_id,
            i.name as item_name,
            i.quantity,
            p.consumable,
            a.alert,
            a.alertdeqtime,
            p.favourite,
            d.added_date as date,
            a.lastcheckdate
          FROM categories c
          LEFT JOIN items i on c.id = i.category_id
          LEFT JOIN item_properties p on i.id = p.item_id
          LEFT JOIN item_alerts a on i.id = a.item_id
          LEFT JOIN ( 
              select item_id,max(added_date) as added_date 
              from item_dates 
              group by item_id
          ) d on i.id = d.item_id
          WHERE c.id = $1
          ORDER BY c.id ASC`,
        [id]
      );

      const jsonData = content.rows;

      const fields = Object.keys(jsonData[0]);
      const json2csvParser = new Json2csvParser({ fields, header: true });
      const csv = json2csvParser.parse(jsonData);

      fs.writeFile(`public/Downloads/category-${id}.csv`, csv, (error) => {
        if (error) {
          console.error(error);
          res.writeHead(500);
          res.end('Eroare la scrierea fișierului');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File Created Successfully' }));
      });
    } catch (err) {
      console.error('Eroare server:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Eroare server' }));
    }
  })();

  return;
}



    if (req.method === 'GET' && /^\/api\/categories\/export$/.test(req.url)) {
    (async () => {
        try {
            await client.query('SELECT check_export_has_data();');

            const result = await client.query(`
                SELECT DISTINCT
                    c.id,
                    c.name,
                    i.id as item_id,
                    i.name as item_name,
                    i.quantity,
                    p.consumable,
                    a.alert,
                    a.alertdeqtime,
                    p.favourite,
                    d.added_date as date,
                    a.lastcheckdate
                FROM categories c
                LEFT JOIN items i ON c.id = i.category_id
                LEFT JOIN item_properties p ON i.id = p.item_id
                LEFT JOIN item_alerts a ON i.id = a.item_id
                LEFT JOIN (
                    SELECT item_id, MAX(added_date) AS added_date
                    FROM item_dates
                    GROUP BY item_id
                ) d ON i.id = d.item_id
                ORDER BY c.id ASC
            `);

            const jsonData = result.rows;

            const fields = Object.keys(jsonData[0]);
            const json2csvParser = new Json2csvParser({ fields, header: true });
            const csv = json2csvParser.parse(jsonData);

            fs.writeFile(`public/Downloads/categories.csv`, csv, (error) => {
                if (error) {
                    console.error(error);
                    res.writeHead(500);
                    res.end('Eroare la scrierea fișierului');
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'File Created Successfully' }));
            });
        } catch (err) {
            if (err.code === 'P0001') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                console.log("Error: ", err);
            } else {
                console.error('Eroare SQL:', err);
                res.writeHead(500);
                res.end('Eroare server');
            }
        }
    })();

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


