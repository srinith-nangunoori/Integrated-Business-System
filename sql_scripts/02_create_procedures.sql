-- An audit table to log when employees are deleted.
CREATE TABLE Employee_Audit (
    audit_id SERIAL PRIMARY KEY,
    E_id INT NOT NULL,
    employee_name VARCHAR(100),
    action_type VARCHAR(50),
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger Function 1: This function runs when the trigger is activated.
CREATE OR REPLACE FUNCTION log_employee_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the details of the DELETED employee into the audit table.
    INSERT INTO Employee_Audit(E_id, employee_name, action_type)
    VALUES(OLD.E_id, OLD.employee_name, 'DELETE');
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger 1: This connects the function to the Employee table.
-- It fires BEFORE any DELETE operation on an employee.
CREATE TRIGGER before_employee_delete
BEFORE DELETE ON Employee
FOR EACH ROW
EXECUTE FUNCTION log_employee_deletion();

-- Trigger Function 2: Automatically updates product stock after a sale.
CREATE OR REPLACE FUNCTION update_product_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease the stock of the product that was just sold.
    UPDATE Product
    SET stock = stock - NEW.quantity
    WHERE product_name = NEW.product_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 2: Connects the function to the Buys_Items table.
-- It fires AFTER a new item is INSERTED into a sales bill.
CREATE TRIGGER after_buys_item_insert
AFTER INSERT ON Buys_Items
FOR EACH ROW
EXECUTE FUNCTION update_product_stock_on_sale();


-- Trigger Function 3: Automatically updates material stock after a purchase.
CREATE OR REPLACE FUNCTION update_material_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Increase the stock of the material that was just purchased.
    UPDATE Materials
    SET stock = stock + NEW.quantity
    WHERE material_name = NEW.material_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 3: Connects the function to the Sells_Items table.
-- It fires AFTER a new item is INSERTED into a purchase bill.
CREATE TRIGGER after_sells_item_insert
AFTER INSERT ON Sells_Items
FOR EACH ROW
EXECUTE FUNCTION update_material_stock_on_purchase();


-- USER-DEFINED FUNCTIONS                            


-- Function 1: Calculates the total cost of a sales bill.
CREATE OR REPLACE FUNCTION get_buy_bill_total(p_bill_id INT)
RETURNS NUMERIC AS $$
DECLARE
    total_cost NUMERIC;
BEGIN
    SELECT SUM(cost * quantity)
    INTO total_cost
    FROM Buys_Items
    WHERE Bill_id = p_bill_id;
    RETURN COALESCE(total_cost, 0);
END;
$$ LANGUAGE plpgsql;

-- Function 2: Counts employees in a specific department.
CREATE OR REPLACE FUNCTION count_employees_in_department(p_d_id INT)
RETURNS INT AS $$
DECLARE
    employee_count INT;
BEGIN
    -- This looks at the "Works" junction table to count.
    SELECT COUNT(*)
    INTO employee_count
    FROM Works
    WHERE D_id = p_d_id;
    RETURN employee_count;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Checks if a product's stock is below a certain threshold.
CREATE OR REPLACE FUNCTION is_product_low_stock(p_product_name VARCHAR(100), threshold INT DEFAULT 10)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INT;
BEGIN
    SELECT stock INTO current_stock FROM Product WHERE product_name = p_product_name;
    RETURN current_stock < threshold;
END;
$$ LANGUAGE plpgsql;


-- STEP 3: STORED PROCEDURES (with Exception Handling & Cursor)


-- Procedure 1: Replaces your entire createBuyTransaction JS function.
-- It includes EXCEPTION HANDLING.
CREATE OR REPLACE PROCEDURE process_new_sale(
    p_buyer_id INT,
    p_product_name VARCHAR(100),
    p_quantity INT,
    p_cost NUMERIC,
    INOUT p_bill_id INT DEFAULT NULL -- INOUT allows us to return the new bill_id
)
LANGUAGE plpgsql
AS $$
DECLARE
    available_stock INT;
BEGIN
    -- Check for sufficient stock first.
    SELECT stock INTO available_stock FROM Product WHERE product_name = p_product_name;

    IF available_stock IS NULL THEN
        RAISE EXCEPTION 'Product not found: %', p_product_name;
    END IF;

    IF available_stock < p_quantity THEN
        -- This is the EXCEPTION HANDLING part.
        RAISE EXCEPTION 'Insufficient stock for product: %. Available: %, Required: %', p_product_name, available_stock, p_quantity;
    END IF;

    -- 1. Create a new bill and get its ID back.
    INSERT INTO Buys(B_id) VALUES (p_buyer_id) RETURNING Bill_id INTO p_bill_id;

    -- 2. Add the item to the bill.
    INSERT INTO Buys_Items(Bill_id, product_name, quantity, cost)
    VALUES (p_bill_id, p_product_name, p_quantity, p_cost);

    -- NOTE: The trigger 'after_buys_item_insert' automatically handles the stock update.
    -- We don't need to write an UPDATE statement here!

EXCEPTION
    WHEN OTHERS THEN
        -- If any error occurs (like the RAISE EXCEPTION above), this block runs.
        RAISE NOTICE 'Transaction failed and was rolled back. Reason: %', SQLERRM;
        -- Re-throw the error so the application knows something went wrong.
        RAISE;
END;
$$;


-- Procedure 2 & 3: A procedure that gives a raise to all employees in a specific role.
-- This demonstrates a CURSOR.
CREATE OR REPLACE PROCEDURE give_raise_by_role(
    p_role roletype,
    p_raise_percentage NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    -- 1. Declare the CURSOR to select all employees of a certain role.
    emp_cursor CURSOR FOR
        SELECT E_id, salary FROM Employee WHERE role = p_role FOR UPDATE;
    emp_record RECORD;
BEGIN
    -- 2. Open the cursor to start processing.
    OPEN emp_cursor;

    LOOP
        -- 3. Fetch one row at a time from the cursor.
        FETCH emp_cursor INTO emp_record;
        -- Exit the loop when there are no more employees.
        EXIT WHEN NOT FOUND;

        -- 4. Perform the update for the current employee.
        UPDATE Employee
        SET salary = emp_record.salary * (1 + p_raise_percentage / 100)
        WHERE E_id = emp_record.E_id;

        RAISE NOTICE 'Updated salary for employee ID: %', emp_record.E_id;
    END LOOP;

    -- 5. Close the cursor to free up resources.
    CLOSE emp_cursor;
END;
$$;