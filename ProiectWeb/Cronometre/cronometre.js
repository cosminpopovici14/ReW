const { Client } = require('pg');

const client = new Client({
        user: 'postgres',
        password: 'STUDENT',
        host: 'localhost',
        port: 5432,
        database: 'rew-database',
    }) 



client.connect()
    .then(()=>{
        console.log("Connected to the Database!")
    })
    .catch(err=>{
        console.log("Cronometre error when connecting to the Database: ", err);
    })

async function updateItemsQuantity(){
    console.log("--------------------------");
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
        JOIN item_properties p on i.id = p.item_id
        JOIN item_alerts a on i.id = a.item_id
        JOIN ( 
            select item_id,max(added_date) as added_date 
            from item_dates 
            group by item_id
        ) d on i.id = d.item_id
        ORDER BY id ASC
        `,(err,content)=>{
            let parsed = JSON.stringify(content.rows);
            let items = JSON.parse(parsed); 
            var decreaseQuantityDate;
            items.forEach(item=>{

                const currentDate = new Date();
            if(item.alertdeqtime == "7d")
                decreaseQuantityDate = addMinutes(item.date, 7);
            if(item.alertdeqtime == "14d")
                decreaseQuantityDate = addDays(item.date, 14);
            if(item.alertdeqtime == "30d")
                decreaseQuantityDate = addDays(item.date, 30);
            if(item.alertdeqtime == "60d")
                decreaseQuantityDate = addDays(item.date, 60);
            if(item.alertdeqtime == "90d")
                decreaseQuantityDate = addDays(item.date, 90);
            if(item.alertdeqtime == "180d")
                decreaseQuantityDate = addDays(item.date, 180);
            if(item.alertdeqtime == "1y")
                decreaseQuantityDate = addDays(item.date, 365);


             console.log("---------------",decreaseQuantityDate, "----------",currentDate);

            if(decreaseQuantityDate <= currentDate)
            {
                client.query(`
                    UPDATE items SET quantity = quantity-1
                    WHERE id = $1  
                    `, [item.id],(err1,content)=>{
                        if(err1)
                        {
                            console.log(err1);
                            return;
                        }
                            client.query(`
                                    INSERT INTO item_dates (quantity, added_date, item_id)
                                            VALUES ( $1, $2, $3)
                                `,[item.quantity-1,currentDate,item.id],(err2,content)=>{

                                    if(err2)
                                    {
                                        console.log(err2);
                                        return;
                                    }
                                    console.log(`Decreased the quantity of item ${item.name}`);
                                })
                            
                        
                    });
            }   
            })

            
        })
}

setInterval(updateItemsQuantity,5*1000);


function addDays(date, days){
    var decreaseQuantity = new Date(date);

    decreaseQuantity.setDate(decreaseQuantity.getDate() + days);

    return decreaseQuantity;
}

function addMinutes(date,minutes){
    var decreaseQuantity = new Date(date);
    var final =  new Date(decreaseQuantity.getTime() + 10*1000);
    return final;
}