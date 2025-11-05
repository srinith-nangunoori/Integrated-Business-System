CREATE TABLE Buyer (
    B_id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    phone_no VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT
);

CREATE TABLE Supplier (
    S_id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    phone_no VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT
);

CREATE TYPE unittype AS ENUM('k.g','liter');
-- In 01_create_tables.sql, find and update the Product table
CREATE TABLE Product (
    product_name VARCHAR(100) PRIMARY KEY,
    stock INT DEFAULT 0,
    unit unittype NOT NULL,
    CONSTRAINT stock_non_negative CHECK (stock >= 0)
);

CREATE TABLE Materials (
    material_name VARCHAR(100) PRIMARY KEY,
    stock INT DEFAULT 0,
    unit unittype NOT NULL,
    CONSTRAINT stock_non_negative CHECK (stock >= 0)
);

CREATE TABLE Department (
    D_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TYPE gendertype AS ENUM('MALE','FEMALE','OTHER');
CREATE TYPE employeetype AS ENUM('PERMANENT','TEMPORARY');
CREATE TYPE roletype AS ENUM('PRODUCTION MANAGER','QUALITY CONTROLLER','MACHINE OPERATOR','PRODUCTION SUPERVISOR','INVENTORY CONTROLLER');
CREATE TABLE Employee (
    E_id SERIAL PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    age INT,
    gender gendertype,
    type employeetype NOT NULL,
    role roletype NOT NULL,
    salary NUMERIC(10,2) NOT NULL,
    phone_no VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT
);

CREATE TABLE Works(
    E_id INT REFERENCES Employee(E_id),
    D_id INT REFERENCES Department(D_id),
    work_date DATE default CURRENT_DATE, 
    PRIMARY KEY (E_id, D_id, work_date)
);

CREATE TABLE Buys (
    Bill_id SERIAL PRIMARY KEY,
    B_id INT REFERENCES Buyer(B_id),
    buy_date DATE DEFAULT CURRENT_DATE,
    buy_time TIME DEFAULT CURRENT_TIME
);

CREATE TABLE Buys_Items (
    Bill_id INT REFERENCES Buys(Bill_id),
    product_name VARCHAR(100) REFERENCES Product(product_name),
    quantity INT DEFAULT 1 NOT NULL,
    cost NUMERIC(10,2),
    PRIMARY KEY (Bill_id, product_name)
);

CREATE TABLE Sells (
    Bill_id SERIAL PRIMARY KEY,
    S_id INT REFERENCES Supplier(S_id),
    sell_date DATE DEFAULT CURRENT_DATE,
    sell_time TIME DEFAULT CURRENT_TIME
);

CREATE TABLE Sells_Items (
    Bill_id INT REFERENCES Sells(Bill_id),
    material_name VARCHAR(100) REFERENCES Materials(material_name),
    quantity INT DEFAULT 1 NOT NULL,
    cost NUMERIC(10,2),
    PRIMARY KEY (Bill_id, material_name)
);

CREATE TABLE Input (
    D_id INT REFERENCES Department(D_id),
    material_name VARCHAR(100) REFERENCES Materials(material_name),
    quantity INT default 1,
    unit unittype NOT NUll,
    input_date DATE default CURRENT_DATE, 
    input_time TIME default CURRENT_TIME, 
    PRIMARY KEY (D_id, material_name, input_date, input_time)
);

CREATE TABLE Output (
    D_id INT REFERENCES Department(D_id),
    product_name VARCHAR(100) REFERENCES Product(product_name),
    quantity INT default 1,
    unit unittype NOT NUll,
    output_date DATE default CURRENT_DATE,
    output_time TIME default CURRENT_TIME,
    PRIMARY KEY (D_id, product_name, output_date, output_time)
);