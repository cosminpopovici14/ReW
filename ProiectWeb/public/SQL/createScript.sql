CREATE TABLE users(
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name VARCHAR(50),
	password VARCHAR(50)
);
CREATE TABLE categories (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) NOT NULL,
    user_id INT, 
    CONSTRAINT fk_user FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);
CREATE  TABLE items (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    category_id INT, 
    CONSTRAINT fk_category FOREIGN KEY(category_id) 
        REFERENCES categories(id)
        ON DELETE CASCADE
);
CREATE  TABLE item_alerts (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    alert BOOLEAN NOT NULL,
    alertdeqtime VARCHAR(50) NOT NULL,
    lastcheckdate VARCHAR(50),
    item_id INT, 
    CONSTRAINT fk_item FOREIGN KEY(item_id) 
        REFERENCES items(id)
        ON DELETE CASCADE
);
CREATE  TABLE item_properties (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    consumable BOOLEAN NOT NULL,
    favourite BOOLEAN NOT NULL,
    item_id INT, 
    CONSTRAINT fk_item FOREIGN KEY(item_id) 
        REFERENCES items(id)
        ON DELETE CASCADE
);

CREATE TABLE item_dates(
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	added_date VARCHAR(50) NOT NULL,
	quantity INT NOT NULL,
	item_id INT, 
    CONSTRAINT fk_item FOREIGN KEY(item_id) 
        REFERENCES items(id)
        ON DELETE CASCADE
)
	