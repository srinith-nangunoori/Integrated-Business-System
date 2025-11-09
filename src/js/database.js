const { Pool } = require('pg');
const dbConfig = require('./dbConfig');
const pool = new Pool(dbConfig);


// --- NEW HELPER FUNCTION WITH RETRY LOGIC ---
const connectWithRetry = async (retries = 3, delay = 1000) => {
    while (retries > 0) {
        try {
            const client = await pool.connect();
            console.log("Database connection successful.");
            return client;
        } catch (error) {
            retries--;
            console.log(`Connection failed. Retries left: ${retries}. Retrying in ${delay / 1000}s...`);
            if (retries === 0) {
                console.error("Could not connect to database after multiple retries.", error);
                throw error; // Throw the final error if all retries fail
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

/**
 * Tests the connection to the database.
 * @returns {Promise<boolean>} - True if connection is successful, false otherwise.
 */
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to the cloud database for a test.");
    const result = await client.query('SELECT NOW()');
    console.log("Database server time:", result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error("Failed to connect to the database during test:", error);
    return false;
  }
}

/**
 * Fetches all suppliers from the database.
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
async function getSuppliers() {
  const query = 'SELECT S_id, company_name, contact_name, email, phone_no FROM Supplier ORDER BY S_id';
  
  try {
    const client = await connectWithRetry();
    const result = await client.query(query);
    client.release();
    console.log('Fetched suppliers from DB:', result.rows);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Adds a new supplier to the database.
 * @param {object} supplierData - The data for the new supplier.
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
async function addSupplier(supplierData) {
  const { company_name, contact_name, phone_no, email, address } = supplierData;
  const query = {
    text: `INSERT INTO Supplier (company_name, contact_name, phone_no, email, address) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING *`, // RETURNING * sends the new row back to us
    values: [company_name, contact_name, phone_no, email, address],
  };

  try {
    const client = await connectWithRetry();
    const result = await client.query(query);
    client.release();
    console.log('New supplier added to DB:', result.rows[0]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Error adding supplier:', error);
    return { success: false, error: error.message };
  }
}

async function getSupplierById(id) {
  const query = {
    text: 'SELECT * FROM Supplier WHERE S_id = $1',
    values: [id],
  };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query);
    client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error(`Error fetching supplier with id ${id}:`, error);
    return { success: false, error: error.message };
  }
}

// --- NEW FUNCTION TO UPDATE A SUPPLIER ---
async function updateSupplier(id, supplierData) {
  const { company_name, contact_name, phone_no, email, address } = supplierData;
  const query = {
    text: `UPDATE Supplier 
           SET company_name = $1, contact_name = $2, phone_no = $3, email = $4, address = $5 
           WHERE S_id = $6 
           RETURNING *`,
    values: [company_name, contact_name, phone_no, email, address, id],
  };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query);
    client.release();
    console.log('Updated supplier in DB:', result.rows[0]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error(`Error updating supplier with id ${id}:`, error);
    return { success: false, error: error.message };
  }
}

async function deleteSupplier(id) {
  const query = {
    text: 'DELETE FROM Supplier WHERE S_id = $1',
    values: [id],
  };
  try {
    const client = await connectWithRetry();
    await client.query(query); // No data is returned on a simple delete
    client.release();
    console.log(`Supplier with id ${id} deleted from DB.`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting supplier with id ${id}:`, error);
    return { success: false, error: error.message };
  }
}


async function getEmployees(searchTerm = '') { // Now accepts a searchTerm parameter
  let queryText = 'SELECT E_id, employee_name, role, phone_no, email FROM Employee';
  const values = [];

  // If a search term is provided, add a WHERE clause to the query
  if (searchTerm) {
    queryText += ` WHERE employee_name ILIKE $1 OR role::text ILIKE $1 OR email ILIKE $1`;
    values.push(`%${searchTerm}%`); // Use wildcards for partial matching
  }
  
  queryText += ' ORDER BY E_id';
  
  const query = { text: queryText, values: values };

  try {
    const client = await connectWithRetry();
    const result = await client.query(query);
    client.release();
    return { success: true, data: result.rows };
  } catch (error) {
    return { success: false, error: "Failed to fetch employees." };
  }
}

async function getEmployeeById(id) {
  const query = { text: 'SELECT * FROM Employee WHERE E_id = $1', values: [id] };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query);
    client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) {
    return { success: false, error: `Failed to fetch employee ${id}.` };
  }
}

async function addEmployee(employeeData) {
  const { employee_name, age, gender, type, role, salary, phone_no, email, address } = employeeData;
  const query = {
    text: `INSERT INTO Employee (employee_name, age, gender, type, role, salary, phone_no, email, address)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    values: [employee_name, age, gender, type, role, salary, phone_no, email, address],
  };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query);
    client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) {
    return { success: false, error: 'Failed to add employee.' };
  }
}

async function updateEmployee(id, employeeData) {
  const { employee_name, age, gender, type, role, salary, phone_no, email, address } = employeeData;
  const query = {
    text: `UPDATE Employee SET employee_name = $1, age = $2, gender = $3, type = $4, role = $5, salary = $6, phone_no = $7, email = $8, address = $9
           WHERE E_id = $10 RETURNING *`,
    values: [employee_name, age, gender, type, role, salary, phone_no, email, address, id],
  };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query);
    client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) {
    return { success: false, error: `Failed to update employee ${id}.` };
  }
}

async function deleteEmployee(id) {
  const query = { text: 'DELETE FROM Employee WHERE E_id = $1', values: [id] };
  try {
    const client = await connectWithRetry();
    await client.query(query);
    client.release();
    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to delete employee ${id}.` };
  }
}

// --- PRODUCT FUNCTIONS ---
async function getProducts() {
  const query = 'SELECT * FROM Product ORDER BY product_name';
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows };
  } catch (error) { return { success: false, error: "Failed to fetch products." }; }
}

async function addProduct(data) {
  const { product_name, stock, unit } = data;
  const query = { text: 'INSERT INTO Product (product_name, stock, unit) VALUES ($1, $2, $3) RETURNING *', values: [product_name, stock, unit] };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) { return { success: false, error: 'Failed to add product.' }; }
}

async function updateProduct(product_name, data) {
  const { stock, unit } = data;
  const query = { text: 'UPDATE Product SET stock = $1, unit = $2 WHERE product_name = $3 RETURNING *', values: [stock, unit, product_name] };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) { return { success: false, error: `Failed to update product ${product_name}.` }; }
}

async function deleteProduct(product_name) {
  const query = { text: 'DELETE FROM Product WHERE product_name = $1', values: [product_name] };
  try {
    const client = await connectWithRetry();
    await client.query(query); client.release();
    return { success: true };
  } catch (error) { return { success: false, error: `Failed to delete product ${product_name}.` }; }
}

// --- MATERIALS FUNCTIONS ---
async function getMaterials() {
  const query = 'SELECT * FROM Materials ORDER BY material_name';
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows };
  } catch (error) { return { success: false, error: "Failed to fetch materials." }; }
}

async function addMaterial(data) {
  const { material_name, stock, unit } = data;
  const query = { text: 'INSERT INTO Materials (material_name, stock, unit) VALUES ($1, $2, $3) RETURNING *', values: [material_name, stock, unit] };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) { return { success: false, error: 'Failed to add material.' }; }
}

async function updateMaterial(material_name, data) {
  const { stock, unit } = data;
  const query = { text: 'UPDATE Materials SET stock = $1, unit = $2 WHERE material_name = $3 RETURNING *', values: [stock, unit, material_name] };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) { return { success: false, error: `Failed to update material ${material_name}.` }; }
}

async function deleteMaterial(material_name) {
  const query = { text: 'DELETE FROM Materials WHERE material_name = $1', values: [material_name] };
  try {
    const client = await connectWithRetry();
    await client.query(query); client.release();
    return { success: true };
  } catch (error) { return { success: false, error: `Failed to delete material ${material_name}.` }; }
}

// --- BUYER FUNCTIONS ---
async function getBuyers() {
  const query = 'SELECT * FROM Buyer ORDER BY B_id';
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows };
  } catch (error) { return { success: false, error: "Failed to fetch buyers." }; }
}

async function getBuyerById(id) {
  const query = { text: 'SELECT * FROM Buyer WHERE B_id = $1', values: [id] };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) { return { success: false, error: `Failed to fetch buyer ${id}.` }; }
}

async function addBuyer(data) {
  const { company_name, contact_name, phone_no, email, address } = data;
  const query = { text: 'INSERT INTO Buyer (company_name, contact_name, phone_no, email, address) VALUES ($1, $2, $3, $4, $5) RETURNING *', values: [company_name, contact_name, phone_no, email, address] };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) { return { success: false, error: 'Failed to add buyer.' }; }
}

async function updateBuyer(id, data) {
  const { company_name, contact_name, phone_no, email, address } = data;
  const query = { text: 'UPDATE Buyer SET company_name = $1, contact_name = $2, phone_no = $3, email = $4, address = $5 WHERE B_id = $6 RETURNING *', values: [company_name, contact_name, phone_no, email, address, id] };
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows[0] };
  } catch (error) { return { success: false, error: `Failed to update buyer ${id}.` }; }
}

async function deleteBuyer(id) {
  const query = { text: 'DELETE FROM Buyer WHERE B_id = $1', values: [id] };
  try {
    const client = await connectWithRetry();
    await client.query(query); client.release();
    return { success: true };
  } catch (error) { return { success: false, error: `Failed to delete buyer ${id}.` }; }
}

// --- DEPARTMENT FUNCTIONS ---
async function getDepartments() {
  const query = 'SELECT D_id, department_name FROM Department ORDER BY D_id';
  try {
    const client = await connectWithRetry();
    const result = await client.query(query); client.release();
    return { success: true, data: result.rows };
  } catch (error) { return { success: false, error: "Failed to fetch departments." }; }
}

async function addDepartment(data) {
    const { department_name } = data;
    const query = { text: 'INSERT INTO Department (department_name) VALUES ($1) RETURNING *', values: [department_name] };
    try {
      const client = await connectWithRetry();
      const result = await client.query(query); client.release();
      return { success: true, data: result.rows[0] };
    } catch (error) { return { success: false, error: 'Failed to add department. Name might already exist.' }; }
}

async function updateDepartment(id, data) {
    const { department_name } = data;
    const query = { text: 'UPDATE Department SET department_name = $1 WHERE D_id = $2 RETURNING *', values: [department_name, id] };
    try {
      const client = await connectWithRetry();
      const result = await client.query(query); client.release();
      return { success: true, data: result.rows[0] };
    } catch (error) { return { success: false, error: `Failed to update department ${id}.` }; }
}

async function deleteDepartment(id) {
    const query = { text: 'DELETE FROM Department WHERE D_id = $1', values: [id] };
    try {
      const client = await connectWithRetry();
      await client.query(query); client.release();
      return { success: true };
    } catch (error) { return { success: false, error: `Failed to delete department ${id}.` }; }
}

// async function createSellTransaction(supplierId, items) {
//   const client = await connectWithRetry(); // Get a single client for the entire transaction

//   try {
//     // Start a transaction
//     await client.query('BEGIN');

//     // 1. Create a record in the main Sells table to get a new Bill_id
//     const sellsQuery = {
//       text: 'INSERT INTO Sells (S_id) VALUES ($1) RETURNING Bill_id',
//       values: [supplierId],
//     };
//     const sellsResult = await client.query(sellsQuery);
//     const newBillId = sellsResult.rows[0].bill_id;

//     // 2. Loop through the items and insert them into Sells_Items
//     for (const item of items) {
//       const itemsQuery = {
//         text: 'INSERT INTO Sells_Items (Bill_id, material_name, quantity, cost) VALUES ($1, $2, $3, $4)',
//         values: [newBillId, item.material_name, item.quantity, item.cost],
//       };
//       await client.query(itemsQuery);
      
//       // 3. Update the stock for each material
//       const updateStockQuery = {
//           text: 'UPDATE Materials SET stock = stock + $1 WHERE material_name = $2',
//           values: [item.quantity, item.material_name]
//       };
//       await client.query(updateStockQuery);
//     }

//     // If all queries succeeded, commit the transaction
//     await client.query('COMMIT');
//     console.log(`Successfully created Sell Transaction with Bill_id: ${newBillId}`);
//     return { success: true, billId: newBillId };

//   } catch (error) {
//     // If any query fails, roll back the entire transaction
//     await client.query('ROLLBACK');
//     console.error('Error in createSellTransaction, transaction rolled back:', error);
//     return { success: false, error: 'Failed to create transaction.' };
//   } finally {
//     // ALWAYS release the client back to the pool
//     client.release();
//   }
// }

async function createSellTransaction(supplierId, items) {
  const client = await connectWithRetry();
  try {
    await client.query('BEGIN');

    const sellsQuery = {
      text: 'INSERT INTO Sells (S_id) VALUES ($1) RETURNING Bill_id',
      values: [supplierId],
    };
    const sellsResult = await client.query(sellsQuery);
    const newBillId = sellsResult.rows[0].bill_id;

    for (const item of items) {
      const itemsQuery = {
        text: 'INSERT INTO Sells_Items (Bill_id, material_name, quantity, cost) VALUES ($1, $2, $3, $4)',
        values: [newBillId, item.material_name, item.quantity, item.cost],
      };
      await client.query(itemsQuery);
      // THE 'UPDATE Materials' LINE IS GONE! THE TRIGGER DOES THE WORK.
    }

    await client.query('COMMIT');
    console.log(`Successfully created Sell Transaction with Bill_id: ${newBillId}`);
    return { success: true, billId: newBillId };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createSellTransaction, transaction rolled back:', error);
    return { success: false, error: 'Failed to create transaction.' };
  } finally {
    client.release();
  }
}

// async function createBuyTransaction(buyerId, items) {
//   const client = await connectWithRetry();
//   try {
//     await client.query('BEGIN');
    
//     // 1. Create a record in the Buys table
//     const buysQuery = { text: 'INSERT INTO Buys (B_id) VALUES ($1) RETURNING Bill_id', values: [buyerId] };
//     const buysResult = await client.query(buysQuery);
//     const newBillId = buysResult.rows[0].bill_id;

//     // 2. Loop through items, insert into Buys_Items, and update Product stock
//     for (const item of items) {
//       const itemsQuery = { text: 'INSERT INTO Buys_Items (Bill_id, product_name, quantity, cost) VALUES ($1, $2, $3, $4)', values: [newBillId, item.product_name, item.quantity, item.cost] };
//       await client.query(itemsQuery);
      
//       // 3. DECREASE the stock for each product sold
//       const updateStockQuery = { text: 'UPDATE Product SET stock = stock - $1 WHERE product_name = $2', values: [item.quantity, item.product_name] };
//       await client.query(updateStockQuery);
//     }

//     await client.query('COMMIT');
//     console.log(`Successfully created Buy Transaction with Bill_id: ${newBillId}`);
//     return { success: true, billId: newBillId };
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('Error in createBuyTransaction, transaction rolled back:', error);
//     return { success: false, error: 'Failed to create transaction.' };
//   } finally {
//     client.release();
//   }
// }

async function createBuyTransaction(buyerId, items) {
  // We will call the procedure for each item in the cart.
  // In a real-world scenario with a shopping cart, the procedure would be
  // designed to accept an array of items, but for this project, this is perfect.
  const client = await connectWithRetry();
  let newBillId = null;

  try {
    // We still manage the transaction here so all items succeed or fail together.
    await client.query('BEGIN');

    for (const item of items) {
      // For the first item, we let the procedure create the bill.
      // For subsequent items, we pass the bill_id so they are added to the same bill.
      const query = {
        text: 'CALL process_new_sale($1, $2, $3, $4, $5)',
        values: [buyerId, item.product_name, item.quantity, item.cost, newBillId],
      };
      const result = await client.query(query);
      
      // The procedure returns the new bill_id in the first call
      if (result.rows && result.rows[0].p_bill_id && !newBillId) {
          newBillId = result.rows[0].p_bill_id;
      }
    }
    
    await client.query('COMMIT');
    console.log(`Successfully processed Buy Transaction with Bill_id: ${newBillId}`);
    return { success: true, billId: newBillId };

  } catch (error) {
    await client.query('ROLLBACK');
    // The error message will come from our 'RAISE EXCEPTION' in the procedure!
    console.error('Error in createBuyTransaction, transaction rolled back:', error.message);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

async function createProductionTransaction(departmentId, inputs, outputs) {
  const client = await connectWithRetry();
  try {
    await client.query('BEGIN');

    // Process all INPUTS (consuming materials)
    for (const item of inputs) {
      const inputQuery = { text: 'INSERT INTO Input (D_id, material_name, quantity, unit) VALUES ($1, $2, $3, $4)', values: [departmentId, item.name, item.quantity, item.unit] };
      await client.query(inputQuery);
      
      const updateStockQuery = { text: 'UPDATE Materials SET stock = stock - $1 WHERE material_name = $2', values: [item.quantity, item.name] };
      await client.query(updateStockQuery);
    }

    // Process all OUTPUTS (creating products)
    for (const item of outputs) {
      const outputQuery = { text: 'INSERT INTO Output (D_id, product_name, quantity, unit) VALUES ($1, $2, $3, $4)', values: [departmentId, item.name, item.quantity, item.unit] };
      await client.query(outputQuery);

      const updateStockQuery = { text: 'UPDATE Product SET stock = stock + $1 WHERE product_name = $2', values: [item.quantity, item.name] };
      await client.query(updateStockQuery);
    }

    await client.query('COMMIT');
    console.log(`Successfully created Production Transaction for Department ID: ${departmentId}`);
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createProductionTransaction, transaction rolled back:', error);
    return { success: false, error: 'Failed to create production transaction.' };
  } finally {
    client.release();
  }
}

async function getDashboardStats() {
  const client = await connectWithRetry();
  try {
    // Run all count queries in parallel for efficiency
    const [
      supplierCount,
      employeeCount,
      productCount,
      lowStockCount
    ] = await Promise.all([
      client.query('SELECT COUNT(*) FROM Supplier'),
      client.query('SELECT COUNT(*) FROM Employee'),
      client.query('SELECT COUNT(*) FROM Product'),
      client.query('SELECT COUNT(*) FROM Product WHERE stock <= 10') // Assuming "low stock" is 10 or less
    ]);

    // Construct the result object
    const stats = {
      suppliers: supplierCount.rows[0].count,
      employees: employeeCount.rows[0].count,
      products: productCount.rows[0].count,
      lowStock: lowStockCount.rows[0].count
    };

    return { success: true, data: stats };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: 'Failed to fetch dashboard stats.' };
  } finally {
    client.release();
  }
}

// In database.js, add this new function and export it

async function getRecentActivity() {
  // This query combines the last 5 records from Sells, Buys, and Output tables.
  const query = `
    (SELECT 'Purchase' AS type, s.sell_date AS date, su.company_name AS party, si.material_name AS item
     FROM Sells s
     JOIN Supplier su ON s.S_id = su.S_id
     JOIN Sells_Items si ON s.Bill_id = si.Bill_id
     ORDER BY s.sell_date DESC, s.sell_time DESC
     LIMIT 5)
    UNION ALL
    (SELECT 'Sale' AS type, b.buy_date AS date, bu.company_name AS party, bi.product_name AS item
     FROM Buys b
     JOIN Buyer bu ON b.B_id = bu.B_id
     JOIN Buys_Items bi ON b.Bill_id = bi.Bill_id
     ORDER BY b.buy_date DESC, b.buy_time DESC
     LIMIT 5)
    UNION ALL
    (SELECT 'Production' AS type, o.output_date AS date, d.department_name AS party, o.product_name AS item
     FROM Output o
     JOIN Department d ON o.D_id = d.D_id
     ORDER BY o.output_date DESC, o.output_time DESC
     LIMIT 5)
    ORDER BY date DESC
    LIMIT 10;
  `;
  try {
    const client = await connectWithRetry();
    const result = await client.query(query);
    client.release();
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return { success: false, error: 'Failed to fetch recent activity.' };
  }
}


async function getTransactionHistory(filters = {}) {
    // Base queries for each transaction type
    let sellsQuery = `
        SELECT 'Purchase' AS type, s.Bill_id AS id, s.sell_date AS date, su.company_name AS party, 
               SUM(si.quantity * si.cost) AS total_value
        FROM Sells s
        JOIN Supplier su ON s.S_id = su.S_id
        JOIN Sells_Items si ON s.Bill_id = si.Bill_id
        GROUP BY s.Bill_id, su.company_name
    `;
    let buysQuery = `
        SELECT 'Sale' AS type, b.Bill_id AS id, b.buy_date AS date, bu.company_name AS party,
               SUM(bi.quantity * bi.cost) AS total_value
        FROM Buys b
        JOIN Buyer bu ON b.B_id = bu.B_id
        JOIN Buys_Items bi ON b.Bill_id = bi.Bill_id
        GROUP BY b.Bill_id, bu.company_name
    `;
    // For Production, we'll just log the event without a monetary value for now
    let productionQuery = `
        SELECT 'Production' AS type, o.D_id AS id, o.output_date AS date, d.department_name AS party, 
               NULL AS total_value
        FROM Output o
        JOIN Department d ON o.D_id = d.D_id
        GROUP BY o.D_id, o.output_date, d.department_name
    `;
    
    const { typeFilter } = filters;
    let finalQuery = '';

    // Conditionally combine queries based on the filter
    if (typeFilter === 'purchase') {
        finalQuery = sellsQuery;
    } else if (typeFilter === 'sale') {
        finalQuery = buysQuery;
    } else if (typeFilter === 'production') {
        finalQuery = productionQuery;
    } else { // 'all' or no filter
        finalQuery = `(${sellsQuery}) UNION ALL (${buysQuery}) UNION ALL (${productionQuery})`;
    }

    finalQuery += ' ORDER BY date DESC';

    try {
        const client = await connectWithRetry();
        const result = await client.query(finalQuery);
        client.release();
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        return { success: false, error: 'Failed to fetch transaction history.' };
    }
}

// ADD THIS NEW FUNCTION TO DEMONSTRATE THE CURSOR
async function applyRaiseToRole(role, percentage) {
  try {
    const client = await connectWithRetry();
    await client.query('CALL give_raise_by_role($1, $2)', [role, percentage]);
    client.release();
    return { success: true, message: `Raise applied to all employees with role: ${role}` };
  } catch (error) {
    console.error('Error applying raise:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  testConnection,
  connectWithRetry,
  // Suppliers
  getSuppliers, addSupplier, getSupplierById, updateSupplier, deleteSupplier,
  // Employees
  getEmployees, getEmployeeById, addEmployee, updateEmployee, deleteEmployee,
  // Products
  getProducts, addProduct, updateProduct, deleteProduct,
  // Materials
  getMaterials, addMaterial, updateMaterial, deleteMaterial,
  // Buyers
  getBuyers, getBuyerById, addBuyer, updateBuyer, deleteBuyer,
  // Departments
  getDepartments, addDepartment, updateDepartment, deleteDepartment,

  createSellTransaction , createBuyTransaction ,
  createProductionTransaction ,

  getDashboardStats,getRecentActivity,getTransactionHistory,

  applyRaiseToRole 
};