const http = require('http');
const fs = require('fs');
const Joi = require('joi');
const Json2csvParser = require("json2csv").Parser;
const nodemailer = require('nodemailer');
const path = require('path');
const { Client } = require('pg');
const { count } = require('console');
const xml2js = require('xml2js');
const { parse } = require('csv-parse/sync');
const client = new Client({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'STUDENT',
    database: process.env.PGDATABASE || 'rew_database',
    port: process.env.PGPORT || 5432,
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'manmat2004@gmail.com',
        pass: 'qwwt hgry kqtk bbmk'
    }
});

async function initializeDatabase() {
    try {
        await client.query(`

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(50) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    UNIQUE(name),
    UNIQUE(email)
);


CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY ,
    name VARCHAR(50) NOT NULL,
    user_id INT, 
    CONSTRAINT fk_user FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    UNIQUE(name,user_id)
);
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY ,
    name VARCHAR(50) NOT NULL ,
    quantity INT NOT NULL,
    category_id INT, 
    CONSTRAINT fk_category FOREIGN KEY(category_id) 
        REFERENCES categories(id)
        ON DELETE CASCADE,
    UNIQUE(name,category_id)
);
CREATE TABLE IF NOT EXISTS item_alerts (
    id SERIAL PRIMARY KEY ,
    alert BOOLEAN NOT NULL,
    alertdeqtime VARCHAR(50) NOT NULL,
    lastcheckdate VARCHAR(50) NOT NULL,
    item_id INT, 
    CONSTRAINT fk_item FOREIGN KEY(item_id) 
        REFERENCES items(id)
        ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS item_properties (
    id SERIAL PRIMARY KEY ,
    consumable BOOLEAN NOT NULL,
    favourite BOOLEAN NOT NULL,
    item_id INT, 
    CONSTRAINT fk_item FOREIGN KEY(item_id) 
        REFERENCES items(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS item_dates(
    id SERIAL PRIMARY KEY ,
    added_date VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    item_id INT, 
    CONSTRAINT fk_item FOREIGN KEY(item_id) 
        REFERENCES items(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action TEXT NOT NULL,           
  table_name TEXT NOT NULL,      
  record_id INT NOT NULL,        
  action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_audit FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE SET NULL
);

CREATE OR REPLACE FUNCTION log_insert_category()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id)
  VALUES (NEW.user_id, 'INSERT', 'categories', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_insert_category
AFTER INSERT ON categories
FOR EACH ROW
EXECUTE FUNCTION log_insert_category();


CREATE OR REPLACE FUNCTION log_update_category()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id)
  VALUES (NEW.user_id, 'UPDATE', 'categories', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_update_category
AFTER UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION log_update_category();

CREATE OR REPLACE FUNCTION log_delete_category()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE id = OLD.user_id) THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id)
    VALUES (OLD.user_id, 'DELETE', 'categories', OLD.id);
  ELSE
    INSERT INTO audit_log (user_id, action, table_name, record_id)
    VALUES (NULL, 'DELETE', 'categories', OLD.id);
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_delete_category
AFTER DELETE ON categories
FOR EACH ROW
EXECUTE FUNCTION log_delete_category();

CREATE OR REPLACE FUNCTION log_insert_item()
RETURNS TRIGGER AS $$
DECLARE
  cat_user_id INT;
BEGIN
  SELECT user_id INTO cat_user_id FROM categories WHERE id = NEW.category_id;

  INSERT INTO audit_log (user_id, action, table_name, record_id)
  VALUES (cat_user_id, 'INSERT', 'items', NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_insert_item
AFTER INSERT ON items
FOR EACH ROW
EXECUTE FUNCTION log_insert_item();


-- UPDATE
CREATE OR REPLACE FUNCTION log_update_item()
RETURNS TRIGGER AS $$
DECLARE
  cat_user_id INT;
BEGIN
  SELECT user_id INTO cat_user_id FROM categories WHERE id = NEW.category_id;

  INSERT INTO audit_log (user_id, action, table_name, record_id)
  VALUES (cat_user_id, 'UPDATE', 'items', NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_update_item
AFTER UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION log_update_item();


-- DELETE
CREATE OR REPLACE FUNCTION log_delete_item()
RETURNS TRIGGER AS $$
DECLARE
  cat_user_id INT;
BEGIN
  SELECT user_id INTO cat_user_id FROM categories WHERE id = OLD.category_id;

  INSERT INTO audit_log (user_id, action, table_name, record_id)
  VALUES (cat_user_id, 'DELETE', 'items', OLD.id);

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_delete_item
AFTER DELETE ON items
FOR EACH ROW
EXECUTE FUNCTION log_delete_item();




CREATE OR REPLACE FUNCTION estimate_depletion_date(p_item_id INT)
RETURNS DATE AS $$
DECLARE
    avg_daily_consumption FLOAT;
    latest_quantity INT;
    last_date DATE;
BEGIN
    SELECT 
        AVG(diff) 
    INTO avg_daily_consumption
    FROM (
        SELECT 
            quantity - LAG(quantity) OVER (ORDER BY added_date) AS diff,
            added_date
        FROM item_dates
        WHERE item_id = p_item_id
    ) AS consumption
    WHERE diff < 0;

    SELECT quantity, added_date
    INTO latest_quantity, last_date
    FROM item_dates
    WHERE item_id = p_item_id
    ORDER BY added_date DESC
    LIMIT 1;

    IF avg_daily_consumption IS NULL OR avg_daily_consumption = 0 THEN
        RETURN NULL;
    END IF;

    RETURN last_date + (latest_quantity / ABS(avg_daily_consumption)) * INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;





CREATE OR REPLACE FUNCTION check_export_has_data()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM categories c
        LEFT JOIN items i ON c.id = i.category_id
        LEFT JOIN item_properties p ON i.id = p.item_id
        LEFT JOIN item_alerts a ON i.id = a.item_id
        LEFT JOIN (
            SELECT item_id, MAX(added_date) AS added_date
            FROM item_dates
            GROUP BY item_id
        ) d ON i.id = d.item_id
    ) THEN
        RAISE EXCEPTION 'Nu exista date pentru export' USING ERRCODE = 'P0001';
    END IF;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_category_exists(cat_id INT) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE id = cat_id) THEN
        RAISE EXCEPTION 'Categoria cu id-ul % nu exista!', cat_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_category_has_items(cat_id INTEGER)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM items WHERE category_id = cat_id
    ) THEN
        RAISE EXCEPTION 'Categoria nu are iteme.';
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_item_exists(item_id INTEGER)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM items WHERE id = item_id
    ) THEN
        RAISE EXCEPTION 'Itemul nu exista.';
    END IF;
END;
$$ LANGUAGE plpgsql; 



        `);

        console.log('✅ Tabelele au fost create sau existau deja.');
    } catch (error) {
        console.error('❌ Eroare la crearea tabelelor:', error.message);
        process.exit(1);
    }
}

function parseCookies(req) {
    let list = {};
    let cookiesHeader = req.headers.cookie;
    if (!cookiesHeader)
        return list;
    let cookiesArray = [];
    let i = 0;
    cookiesHeader.split('; ').forEach(cookie => {
        cookie.split('=').forEach(elem => {
            cookiesArray[i++] = elem;
        })
    });
    for (let i = 1; i < cookiesArray.length; i += 2) {
        list[cookiesArray[i - 1]] = cookiesArray[i];
    }
    return list;

}
client.connect()
    .then(() => {
        console.log("✅ Conectat la PostgreSQL");
        return initializeDatabase();
    })
    .catch(err => {
        console.error("❌ Eroare la conectarea la PostgreSQL:", err.message);
    });

let pendingCodes = {};
const server = http.createServer((req, res) => {
    const cookies = parseCookies(req);
    console.log(cookies);
    let file = '';
    file = req.url.split('?')[0];
    const userID = parseInt(cookies.userId);
    console.log(req.url);
    let filePath = path.join(__dirname, 'public', file);
    let ext = path.extname(filePath);

    let contentType = 'text/html';
    const isPublic =
        req.url === '/register.html' ||
        req.url === '/login.html' ||
        req.url === '/api/login' ||
        req.url === '/api/register' ||
        req.url === '/api/register/verify' ||
        req.url.endsWith('.css') ||
        req.url.endsWith('.js') ||
        req.url.endsWith('.png')

    if (!isPublic && cookies.auth != 'true') {
        res.writeHead(302, { Location: '/login.html' });
        res.end();
        return;
    }
    if (req.url == '/')
        if (cookies.role == 'user') {
            res.writeHead(302, { Location: '/index.html' });
            res.end();
            return;
        }
        else {
            res.writeHead(302, { Location: '/admin.html' });
            res.end();
            return;
        }
    if (req.url == '/admin.html' && cookies.role == 'user') {
        res.writeHead(403);
        res.end("Acces Denied. Admins Only!")
        return;
    }
    if (req.method === `GET` && req.url === '/api/admin/users') {
        client.query('SELECT * from users', (err, content) => {
            if (err) {
                res.setHeader(500);
                res.end("Server Error");
                return;
            }
            let parsed = JSON.stringify({ users: content.rows });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(parsed);
        });
        return;
    }
    if (req.method === 'DELETE' && req.url === '/api/admin/users') {
        let body = '';
        req.on('data', chunk => { body += chunk });
        req.on('end', () => {
            const deletedUser = JSON.parse(body);
            client.query('DELETE FROM users WHERE id=$1', [deletedUser.id], (err, content) => {

                if (err) {
                    console.log(err);
                    res.writeHead(500);
                    res.end('Eroare server');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end("Deleted User!");
            })
        });
        return;
    }
    if (req.method === `GET` && req.url === '/api/admin/auditlog') {
        client.query('SELECT * from audit_log ORDER BY action_time DESC', (err, content) => {
            if (err) {
                res.setHeader(500);
                res.end("Server Error");
                return;
            }
            let parsed = JSON.stringify({ logs: content.rows });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(parsed);
        });
        return;
    }
    if (req.method === `POST` && req.url === '/api/register') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const user = JSON.parse(body);
            console.log(user);
            if (pendingCodes[user.email] != user.code) {
                res.writeHead(400);
                res.end("Codes do not match!");
                return;
            }
            client.query(`INSERT INTO users(name,email,password)
                          VALUES ($1,$2,$3) RETURNING id`,
                [user.name, user.email, user.password], (err, content) => {
                    if (err) {
                        res.writeHead(500);
                        res.end(err.message);
                        return;
                    }

                    let id = content.rows[0].id;
                    res.writeHead(302, {
                        Location: '/index.html',
                        'Content-Type': 'application/json',
                        'Set-Cookie': [
                            `userId = ${id}; Max-Age=604800;HttpOnly;Path=/`,
                            `auth = true;  Max-Age=604800;HttpOnly;Path=/`,
                            `role = user;  Max-Age=604800;HttpOnly;Path=/`
                        ]
                    });
                    res.end("Registered new User!");
                })
        })
        return;
    }
    if (req.method === `POST` && req.url === '/api/register/verify') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const user = JSON.parse(body);
            console.log(user);
            if (user.password != user.passwordConfirm) {
                res.writeHead(400);
                res.end("Passwords do not match!");
                return;
            }
            // var emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            //     if(emailRegex.test(user.email)==false){
            //         res.writeHead(400);
            //         res.end("Please write a valid email!")
            //         return;
            //     }
            var passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
            if (passwordRegex.test(user.password) == false) {
                res.writeHead(400);
                res.end("Password does not match the criteria!")
                return;
            }
            client.query('SELECT * FROM users where email=$1', [user.email], (err1, content1) => {
                if (err1) {
                    res.writeHead(500),
                        res.end(err1.message);
                    return;
                }
                if (content1.rows.length != 0) {
                    res.writeHead(400);
                    res.end("Email Already Exists!");
                    return;
                }

                let randomCode = makeid(5);
                pendingCodes[user.email] = randomCode;
                var mailOptions = {
                    from: 'manmat2004@gmail.com',
                    to: user.email,
                    subject: 'Your Confirmation Code!',
                    text: `Your Confirmation Code is: ${randomCode}`
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end("Verified Inputs and sent Email!");
            })
        })
        return;
    }
    if (req.method === 'POST' && req.url === '/api/login') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const user = JSON.parse(body);
            client.query('SELECT * FROM users where email=$1', [user.email], (err1, content1) => {
                if (err1) {
                    res.writeHead(500),
                        res.end(err1.message);
                    return;
                }
                if (content1.rows.length == 0) {
                    res.writeHead(400);
                    res.end("Email Not Found!");
                    return;
                }
                client.query('SELECT * FROM users where email=$1 and password=$2', [user.email, user.password], (err2, content2) => {
                    if (err2) {
                        res.writeHead(500);
                        res.end(err2.message);
                        return;
                    }
                    if (content2.rows.length == 0) {
                        res.writeHead(400);
                        res.end('Wrong Password!');
                        return;
                    }
                    let foundUser = JSON.stringify(content2.rows);
                    parsed = JSON.parse(foundUser);
                    if ((user.email == 'admin1@admin.com' && user.password == 'parola123')
                        || (user.email == 'admin2@admin.com' && user.password == 'parola456')) {
                        res.writeHead(302, {
                            Location: '/admin.html',
                            'Content-Type': 'application/json',
                            'Set-Cookie': [
                                `userId = ${[parsed[0].id]}; Max-Age=604800;HttpOnly;Path=/`,
                                `auth = true;  Max-Age=604800;HttpOnly;Path=/`,
                                `role = admin;  Max-Age=604800;HttpOnly;Path=/`
                            ]
                        })
                        res.end("Authenitcated Admin!");
                        return;
                    }
                    else {
                        res.writeHead(302, {
                            Location: '/index.html',
                            'Content-Type': 'application/json',
                            'Set-Cookie': [
                                `userId = ${[parsed[0].id]}; Max-Age=604800;HttpOnly;Path=/`,
                                `auth = true;  Max-Age=604800;HttpOnly;Path=/`,
                                `role = user;  Max-Age=604800;HttpOnly;Path=/`
                            ]
                        })
                        res.end("Authenitcated User!");
                    }

                })
            })
        })
        return;
    }

    if (req.method === 'GET' && req.url == '/api/logout') {
        res.writeHead(302, {
            Location: '/login.html',
            'Content-Type': 'application/json',
            'Set-Cookie': [
                `userId = ; Max-Age=604800;HttpOnly;Path=/`,
                `auth = false;  Max-Age=604800;HttpOnly;Path=/`,
                `role = ;  Max-Age=604800;HttpOnly;Path=/`
            ]
        })
        res.end("Logged Out User!");
        return;
    }


    if (req.method === 'GET' && req.url === '/api/categories') {
        client.query('SELECT * from categories WHERE user_id =$1 ORDER BY id', [userID], (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            let parsed = JSON.stringify({ categories: content.rows });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(parsed);
        })
        return;
    }

    if (req.method === 'GET' && req.url === '/api/items/count') {
        client.query('SELECT count(*) as total FROM items i join categories c on i.category_id = c.id where c.user_id=$1', [userID], (err, result) => {
            if (err) {
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            let count = result.rows[0].total;
            console.log("Count: ", count);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(count));
        })
        return;
    }

    if (req.method === 'GET' && req.url === '/api/lowItems/count') {
        client.query(`SELECT count(*) as total FROM items i 
            join categories c on i.category_id = c.id 
            join item_properties p on i.id = p.item_id  
            where c.user_id=$1 and i.quantity<=5 and p.consumable = true `, [userID], (err, result) => {
            if (err) {
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            let count = result.rows[0].total;
            console.log("Count: ", count);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(count));
        })
        return;
    }

    if (req.method === 'GET' && req.url === '/api/categories/count') {
        client.query('SELECT count(*) as total FROM categories c where c.user_id=$1', [userID], (err, result) => {
            if (err) {
                res.writeHead(500);
                res.end('Eroare server');
                return;
            }
            let count = result.rows[0].total;
            console.log("Count: ", count);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(count));
        })
        return;
    }

    if (req.method === 'GET' && /^\/api\/categories\/\d+$/.test(req.url)) {
        let id = parseInt(req.url.split('/', 4)[3]);
        client.query('SELECT * from categories where id = $1', [id], (err, content) => {
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
            client.query('INSERT INTO categories (name,user_id) VALUES($1,$2) ', [newCategory.name, userID], (err, content) => {

                if (err) {
                    console.log(err);
                    res.writeHead(400);
                    res.end(checkErrorCode(err.code, err.message));
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


    if (req.method === 'PUT' && req.url === "/api/categories") {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            const renamedCategory = JSON.parse(body);
            client.query('UPDATE categories SET name=$1 WHERE id=$2', [renamedCategory.name, renamedCategory.id], (err, content) => {

                if (err) {
                    console.log(err);
                    res.writeHead(400);
                    res.end(checkErrorCode(err.code, err.message));
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

    if (req.method === 'DELETE' && req.url === '/api/categories') {
        let body = '';
        req.on('data', chunk => { body += chunk });
        req.on('end', () => {
            const deletedCategory = JSON.parse(body);
            client.query('DELETE FROM categories WHERE id=$1', [deletedCategory.id], (err, content) => {

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



    if (req.method === 'GET' && /^\/api\/categories\/\d+\/items$/.test(req.url)) {
        let id = parseInt(req.url.split('/', 5)[3]);

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
            , [id], (err, content) => {

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


    if (req.method === 'POST' && /^\/api\/categories\/\d+\/items$/.test(req.url)) {
        let id = parseInt(req.url.split('/', 5)[3]);
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            const newItem = JSON.parse(body);


            //items
            client.query(`INSERT INTO items(category_id,name,quantity)
                          VALUES($1,$2,$3) RETURNING id`
                , [id, newItem.name, newItem.quantity], (err, content) => {

                    if (err) {
                        console.log(err);
                        res.writeHead(400);
                        res.end(checkErrorCode(err.code, err.message));
                        return;
                    }

                    let itemId = content.rows[0].id;

                    //item_properties
                    client.query(`INSERT INTO item_properties (consumable,favourite,item_id)
                          VALUES($1,$2,$3)`,
                        [newItem.consumable, newItem.favourite, itemId], (err1, content) => {
                            if (err1) {
                                console.log(err1);
                                res.writeHead(400);
                                res.end(err1.code);
                                return;
                            }

                            //item_alerts
                            client.query(`INSERT INTO item_alerts(alert,alertdeqtime,lastcheckdate,item_id)
                                      VALUES($1,$2,$3,$4)`,
                                [newItem.alert, newItem.alertdeqtime, newItem.lastcheckdate, itemId], (err2, content) => {
                                    if (err2) {
                                        console.log(err2);
                                        res.writeHead(400);
                                        res.end(err2.message);
                                        return;
                                    }

                                    //item_dates
                                    client.query(`INSERT INTO item_dates(quantity,added_date,item_id)
                                                      VALUES($1,$2,$3)`,
                                        [newItem.quantity, newItem.date, itemId], (err3, content) => {
                                            if (err3) {
                                                console.log(err3);
                                                res.writeHead(400);
                                                res.end(err3.message);
                                                return;
                                            }

                                            res.writeHead(200, { 'Content-Type': 'application/json' });
                                            res.end("Added new Item");
                                        })
                                })
                        })

                })



        });
        return;
    }



    if (req.method === 'PUT' && /^\/api\/categories\/\d+\/items$/.test(req.url)) {
        console.log("test");
        let id = parseInt(req.url.split('/', 5)[3]);
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            const editedItem = JSON.parse(body);


            client.query(`UPDATE items SET category_id =$1,
                                           name = $2,
                                           quantity = $3
                                           WHERE id=$4`
                , [id, editedItem.name, editedItem.quantity, editedItem.id], (err, content) => {

                    if (err) {
                        console.log(err);
                        res.writeHead(400);
                        res.end(checkErrorCode(err.code, err.message));
                        return;
                    }



                    //item_properties
                    client.query(`UPDATE item_properties SET consumable =$1,
                                           favourite = $2
                                           WHERE item_id=$3`,
                        [editedItem.consumable, editedItem.favourite, editedItem.id], (err1, content) => {
                            if (err1) {
                                console.log("err1 : ", err1);
                                res.writeHead(500);
                                res.end('Eroare server');
                                return;
                            }

                            //item_alerts
                            client.query(`UPDATE item_alerts SET alert =$1,
                                           alertdeqtime = $2,
                                           lastcheckdate = $3
                                           WHERE item_id=$4`,
                                [editedItem.alert, editedItem.alertdeqtime, editedItem.lastcheckdate, editedItem.id], (err2, content) => {
                                    if (err2) {
                                        console.log("err2 : ", err2);
                                        res.writeHead(500);
                                        res.end('Eroare server');
                                        return;
                                    }

                                    //item_dates
                                    client.query(`INSERT INTO item_dates (quantity, added_date, item_id)
                                                    VALUES ( $1, $2, $3)`,
                                        [editedItem.quantity, editedItem.date, editedItem.id], (err3, content) => {
                                            if (err3) {
                                                console.log("err3 : ", err3);
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


    if (req.method === 'PATCH' && /^\/api\/categories\/\d+\/items$/.test(req.url)) {

        let id = parseInt(req.url.split('/', 5)[3]);
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            const editedItem = JSON.parse(body);


            if (editedItem.name)
                client.query('UPDATE items SET name=$1 WHERE id=$2', [editedItem.name, editedItem.id], (err, content) => {

                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                })
            else if (editedItem.quantity)
                client.query('UPDATE items SET quantity=$1 WHERE id=$2', [editedItem.quantity, editedItem.id], (err, content) => {

                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                })
            else if (editedItem.consumable === true || editedItem.consumable === false)
                client.query('UPDATE item_properties SET consumable=$1 WHERE item_id=$2', [editedItem.consumable, editedItem.id], (err, content) => {

                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                })
            else if (editedItem.alertdeqtime)
                client.query('UPDATE item_alerts SET alertdeqtime=$1 WHERE item_id=$2', [editedItem.alertdeqtime, editedItem.id], (err, content) => {

                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                })
            else if (editedItem.alert === true || editedItem.alert === false)
                client.query('UPDATE item_alerts SET alert=$1 WHERE item_id=$2', [editedItem.alert, editedItem.id], (err, content) => {

                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                })
            else if (editedItem.favourite === true || editedItem.favourite === false)
                client.query('UPDATE item_properties SET favourite=$1 WHERE item_id=$2', [editedItem.favourite, editedItem.id], (err, content) => {

                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                })
            else if (editedItem.date)
                client.query('UPDATE item_dates SET added_date=$1 WHERE item_id=$2', [editedItem.date, editedItem.id], (err, content) => {

                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end('Eroare server');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end("Edited Category!");
                })
            else if (editedItem.lastcheckdate)
                client.query('UPDATE item_alerts SET lastcheckdate=$1 WHERE item_id=$2', [editedItem.lastcheckdate, editedItem.id], (err, content) => {

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

    if (req.method === 'DELETE' && /^\/api\/categories\/\d+\/items$/.test(req.url)) {
        let id = parseInt(req.url.split('/', 5)[3]);
        let body = '';
        req.on('data', chunk => { body += chunk });
        req.on('end', () => {
            const deletedItem = JSON.parse(body);
            client.query('DELETE FROM items WHERE id=$1', [deletedItem.id], (err, content) => {

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

    if (req.method === 'GET' && /^\/api\/categories\/\d+\/items\/\d+\/data$/.test(req.url)) {
        let id = parseInt(req.url.split('/')[5]);

        client.query(
            `SELECT 
            added_date, quantity from item_dates 
            WHERE item_id = $1`
            , [id], (err, content) => {

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
    if (req.method === 'GET' && /^\/api\/categories\/\d+\/items\/\d+\/export\/csv$/.test(req.url)) {
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
                        res.end('Error writing file');
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'File Created Successfully' }));
                });
            } catch (err) {
                console.error('Eroare server:', err);
                const statusCode = err.message.includes('nu exista') ? 404 : 500;
                res.writeHead(statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message || 'Eroare server' }));
            }
        })();

        return;
    }



    if (req.method === 'GET' && /^\/api\/categories\/\d+\/items\/export\/csv$/.test(req.url)) {
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
                        res.end('Error writing file');
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


    if (req.method === 'GET' && /^\/api\/categories\/\d+\/export\/csv$/.test(req.url)) {
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
                        res.end('Error writing file');
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



    if (req.method === 'GET' && req.url === '/api/categories/export/csv') {
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
                WHERE c.user_id = $1
                ORDER BY c.id ASC
            `, [userID]);

                const jsonData = result.rows;

                const fields = Object.keys(jsonData[0]);
                const json2csvParser = new Json2csvParser({ fields, header: true });
                const csv = json2csvParser.parse(jsonData);

                fs.writeFile(`public/Downloads/categories.csv`, csv, (error) => {
                    if (error) {
                        console.error(error);
                        res.writeHead(500);
                        res.end('Error writing file');
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

    if (req.method === 'GET' && req.url === '/api/categories/export/json') {
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
        WHERE c.user_id = $1
        ORDER BY c.id ASC
      `, [userID]);

                const jsonData = JSON.stringify(result.rows, null, 2);

                fs.writeFile(`public/Downloads/categories.json`, jsonData, (err) => {
                    if (err) {
                        console.error(err);
                        res.writeHead(500);
                        res.end('Error writing JSON file');
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'JSON exportat cu succes!' }));
                });
            } catch (err) {
                res.writeHead(500);
                res.end('Eroare server la export JSON');
            }
        })();
        return;
    }

    if (req.method === 'GET' && req.url === '/api/categories/export/xml') {
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
        WHERE c.user_id = $1
        ORDER BY c.id ASC
      `, [userID]);

                const data = result.rows;

                const { create } = require('xmlbuilder2');
                const root = create({ version: '1.0' }).ele('categories');

                data.forEach(entry => {
                    const category = root.ele('category');
                    for (const [key, value] of Object.entries(entry)) {
                        category.ele(key).txt(value !== null ? String(value) : '');
                    }
                });

                const xml = root.end({ prettyPrint: true });

                fs.writeFile(`public/Downloads/categories.xml`, xml, (err) => {
                    if (err) {
                        console.error(err);
                        res.writeHead(500);
                        res.end('Error writing XML file');
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'XML exportat cu succes!' }));
                });
            } catch (err) {
                console.error(err);
                res.writeHead(500);
                res.end('Eroare server la export XML');
            }
        })();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/categories/import') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { file, type } = JSON.parse(body);

                let items;

                if (type === 'csv') {
                    items = parse(file, { columns: true, skip_empty_lines: true });
                } else if (type === 'xml') {
                    const parsed = await xml2js.parseStringPromise(file, { explicitArray: false });
                    if (!parsed || !parsed.categories || !parsed.categories.category)
                        throw new Error("Invalid XML Format");

                    let rawItems = parsed.categories.category;
                    items = Array.isArray(rawItems) ? rawItems : [rawItems];

                    for (const item of items) {
                        item.id = Number(item.id);
                        item.item_id = Number(item.item_id);
                        item.quantity = Number(item.quantity);
                        item.consumable = item.consumable === 'true' || item.consumable === true;
                        item.favourite = item.favourite === 'true' || item.favourite === true;
                        item.alert = item.alert === 'true' || item.alert === true;
                    }
                } else if (type === 'json') {
                    items = JSON.parse(file);
                } else {
                    throw new Error("Bad file format.");
                }

                if (!Array.isArray(items)) throw new Error("Should be an array.");

                const categoriiMap = new Map();
                for (const item of items) {
                    const key = `${item.id}|${item.name}`;
                    if (!categoriiMap.has(key)) categoriiMap.set(key, []);
                    categoriiMap.get(key).push(item);
                }

                for (const [key, lista] of categoriiMap.entries()) {
                    const [catId, catName] = key.split('|');

                    await client.query(`
          INSERT INTO categories (id, name, user_id)
          VALUES ($1, $2, $3)
        `, [catId, catName, userID]);

                    for (const item of lista) {
                        const itemId = item.item_id;

                        await client.query(`
            INSERT INTO items (id, name, quantity, category_id)
            VALUES ($1, $2, $3, $4)
          `, [itemId, item.item_name, item.quantity, catId]);

                        await client.query(`
            INSERT INTO item_properties (consumable, favourite, item_id)
            VALUES ($1, $2, $3)
          `, [item.consumable, item.favourite, itemId]);

                        await client.query(`
            INSERT INTO item_alerts (alert, alertdeqtime, lastcheckdate, item_id)
            VALUES ($1, $2, $3, $4)
          `, [item.alert, item.alertdeqtime, item.lastcheckdate, itemId]);

                        await client.query(`
            INSERT INTO item_dates (added_date, quantity, item_id)
            VALUES ($1, $2, $3)
          `, [item.date, item.quantity, itemId]);
                    }
                }

                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end("Import done!");
            } catch (err) {
                console.error("Import error:", err.message);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end("Import error: " + err.message);
            }
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

   async function updateItemsQuantity() {
    const currentDate = new Date();

    client.query(`
        SELECT DISTINCT
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
        JOIN item_properties p ON i.id = p.item_id
        JOIN item_alerts a ON i.id = a.item_id
        JOIN (
            SELECT item_id, MAX(added_date) AS added_date
            FROM item_dates
            GROUP BY item_id
        ) d ON i.id = d.item_id
        ORDER BY i.id ASC
    `, (err, result) => {
        if (err) return console.log("DB SELECT error:", err);

        const items = result.rows;

        items.forEach(item => {
            const itemDate = new Date(item.date);
            const lastCheck = item.lastcheckdate ? new Date(item.lastcheckdate) : null;

            let decreaseDate = (() => {
                switch (item.alertdeqtime) {
                    case "7d": return addMinutes(item.date, 7);
                    case "14d": return addDays(itemDate, 14);
                    case "30d": return addDays(itemDate, 30);
                    case "60d": return addDays(itemDate, 60);
                    case "90d": return addDays(itemDate, 90);
                    case "180d": return addDays(itemDate, 180);
                    case "1y": return addDays(itemDate, 365);
                    default: return null;
                }
            })();

            if (!decreaseDate || decreaseDate > currentDate || item.quantity <= 0) return;

            const newQuantity = item.quantity - 1;

            if (item.consumable) {
                if (newQuantity < 0) return;

                client.query(`UPDATE items SET quantity = $1 WHERE id = $2`, [newQuantity, item.id], err1 => {
                    if (err1) return console.log("UPDATE error:", err1);

                    client.query(`
                        INSERT INTO item_dates (quantity, added_date, item_id)
                        VALUES ($1, $2, $3)
                    `, [newQuantity, currentDate, item.id], err2 => {
                        if (err2) return console.log("INSERT error:", err2);

                        const shouldSendEmail = item.alert === true && (newQuantity === 5);

                        if (shouldSendEmail) {
                            const mailOptions = {
                                from: 'manmat2004@gmail.com',
                                to: 'manmat2004@gmail.com',
                                subject: 'Low Quantity Item!',
                                text: `The Item ${item.name} has a low quantity of ${newQuantity}`
                            };

                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) console.log(error);
                                else console.log('Email sent:', info.response);
                            });
                        }

                        console.log(`Decreased quantity for: ${item.name}, new quantity: ${item.quantity}, shouldSendEmail: ${shouldSendEmail}`);
                    });
                });
            }

            else {
                const shouldSendEmail =
                    !lastCheck || lastCheck.toDateString() !== currentDate.toDateString();

                if (shouldSendEmail) {
                    const mailOptions = {
                        from: 'manmat2004@gmail.com',
                        to: 'manmat2004@gmail.com',
                        subject: 'Item Check Reminder',
                        text: `The Item ${item.name} needs to be checked.`
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) console.log(error);
                        else {
                            console.log('Email sent:', info.response);
                            client.query(`
                                UPDATE item_alerts SET lastcheckdate = $1 WHERE item_id = $2
                            `, [currentDate, item.id]);
                        }
                    });
                }
            }
        });
    });
}




    setInterval(updateItemsQuantity, 20 * 1000);


    function addDays(date, days) {
        var decreaseQuantity = new Date(date);

        decreaseQuantity.setDate(decreaseQuantity.getDate() + days);

        return decreaseQuantity;
    }

    function addMinutes(date, minutes) {
        var decreaseQuantity = new Date(date);
        var final = new Date(decreaseQuantity.getTime() + 10 * 1000);
        return final;
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


server.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://localhost:3000');
});


function checkErrorCode(errorCode, errorMessage) {
    if (errorCode == 23502) {
        if (errorMessage.includes("name"))
            return "Name should not be null!"
        else if (errorMessage.includes("quantity"))
            return "Quantity should be a number!"
    }
    if (errorCode == 23505)
        return "The name already exists!"
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}