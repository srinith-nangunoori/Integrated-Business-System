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
CREATE TABLE Product (
    product_name VARCHAR(100) PRIMARY KEY,
    stock INT DEFAULT 0,
    unit unittype NOT NULL
);

CREATE TABLE Materials (
    material_name VARCHAR(100) PRIMARY KEY,
    stock INT DEFAULT 0,
    unit unittype NOT NULL
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
    work_date DATE default current_date(),
    PRIMARY KEY (E_id, D_id, work_date)
);

CREATE TABLE Buys(
    Bill_id SERIAL ,
    product_name VARCHAR(100) REFERENCES Product(product_name),
    quantity INT default 1 not null,
    cost NUMERIC(10,2),
    PRIMARY KEY (Bill_id, product_name)
);
create table buys1(
	Bill_id SERIAL primary key references Buys(Bill_id),
    B_id INT REFERENCES Buyer(B_id),
    date DATE default current_date(),
    time TIME default current_time()
);

CREATE TABLE Sells (
    Bill_id SERIAL,
    material_name VARCHAR(100) REFERENCES Materials(material_name),
    quantity INT default 1 not null,
    cost NUMERIC(10,2),
    PRIMARY KEY (Bill_id, material_name)
);
create table Sells1(
	Bill_id SERIAL primary key references Sells(Bill_id),
    S_id INT REFERENCES Supplier(S_id),
    date DATE default current_date(),
    time TIME default current_time()
);

CREATE TABLE Input (
    D_id INT REFERENCES Department(D_id),
    material_name VARCHAR(100) REFERENCES Materials(material_name),
    quantity INT default 1,
    unit unittype NOT NUll,
    date DATE default  current_date(),
    time TIME default  current_time(),
    PRIMARY KEY (D_id, material_name, date, time)
);

CREATE TABLE Output (
    D_id INT REFERENCES Department(D_id),
    product_name VARCHAR(100) REFERENCES Product(product_name),
    quantity INT default 1,
    unit unittype NOT NUll,
    date DATE default  current_date(),
    time TIME default  current_time(),
    PRIMARY KEY (D_id, product_name, date, time)
);

