const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./src/js/database.js');

// ===================================================================
// == 1. SET THE APPLICATION ICON (CRITICAL FOR MACOS) ==
// ===================================================================
// Define the icon path
const iconPath = path.join(__dirname, 'src/assets/logo-modified.png');
// Set the Dock icon BEFORE the app is ready
if (process.platform === 'darwin') { // 'darwin' is the name for macOS
    app.dock.setIcon(iconPath);
}


// ===================================================================
// == 2. IPC HANDLERS (The "Backend" Logic) ==
// ===================================================================

ipcMain.handle('get-suppliers', async () => {
  const result = await db.getSuppliers();
  return result;
});
ipcMain.handle('add-supplier', async (event, supplierData) => {
  const result = await db.addSupplier(supplierData);
  return result;
});
// --- NEW HANDLER FOR GETTING A SINGLE SUPPLIER ---
ipcMain.handle('get-supplier-by-id', async (event, id) => {
  const result = await db.getSupplierById(id);
  return result;
});
// --- NEW HANDLER FOR UPDATING A SUPPLIER ---
ipcMain.handle('update-supplier', async (event, id, supplierData) => {
  const result = await db.updateSupplier(id, supplierData);
  return result;
});
// --- NEW HANDLER FOR DELETING A SUPPLIER ---
ipcMain.handle('delete-supplier', async (event, id) => {
  const result = await db.deleteSupplier(id);
  return result;
});

// --- NEW HANDLERS FOR EMPLOYEE CRUD ---
ipcMain.handle('get-employees', async (event, searchTerm) => {
  return await db.getEmployees(searchTerm);
});

ipcMain.handle('get-employee-by-id', async (event, id) => {
  return await db.getEmployeeById(id);
});

ipcMain.handle('add-employee', async (event, data) => {
  return await db.addEmployee(data);
});

ipcMain.handle('update-employee', async (event, id, data) => {
  return await db.updateEmployee(id, data);
});

ipcMain.handle('delete-employee', async (event, id) => {
  return await db.deleteEmployee(id);
});

ipcMain.handle('get-products', async () => await db.getProducts());
ipcMain.handle('add-product', async (event, data) => await db.addProduct(data));
ipcMain.handle('update-product', async (event, name, data) => await db.updateProduct(name, data));
ipcMain.handle('delete-product', async (event, name) => await db.deleteProduct(name));

ipcMain.handle('get-materials', async () => await db.getMaterials());
ipcMain.handle('add-material', async (event, data) => await db.addMaterial(data));
ipcMain.handle('update-material', async (event, name, data) => await db.updateMaterial(name, data));
ipcMain.handle('delete-material', async (event, name) => await db.deleteMaterial(name));

// --- NEW HANDLERS FOR BUYERS ---
ipcMain.handle('get-buyers', async () => await db.getBuyers());
ipcMain.handle('get-buyer-by-id', async (event, id) => await db.getBuyerById(id));
ipcMain.handle('add-buyer', async (event, data) => await db.addBuyer(data));
ipcMain.handle('update-buyer', async (event, id, data) => await db.updateBuyer(id, data));
ipcMain.handle('delete-buyer', async (event, id) => await db.deleteBuyer(id));

// --- NEW HANDLERS FOR DEPARTMENTS ---
ipcMain.handle('get-departments', async () => await db.getDepartments());
ipcMain.handle('add-department', async (event, data) => await db.addDepartment(data));
ipcMain.handle('update-department', async (event, id, data) => await db.updateDepartment(id, data));
ipcMain.handle('delete-department', async (event, id) => await db.deleteDepartment(id));

ipcMain.handle('create-sell-transaction', async (event, supplierId, items) => {
  return await db.createSellTransaction(supplierId, items);
});
ipcMain.handle('create-buy-transaction', async (event, buyerId, items) => {
  return await db.createBuyTransaction(buyerId, items);
});
ipcMain.handle('create-production-transaction', async (event, departmentId, inputs, outputs) => {
  return await db.createProductionTransaction(departmentId, inputs, outputs);
});
ipcMain.handle('get-dashboard-stats', async () => {
  return await db.getDashboardStats();
});
ipcMain.handle('get-recent-activity', async () => {
  return await db.getRecentActivity();
});
ipcMain.handle('get-transaction-history', async (event, filters) => {
  return await db.getTransactionHistory(filters);
});

// ===================================================================
// == 3. WINDOW CREATION ==
// ===================================================================
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    // The 'icon' property is kept for Windows/Linux compatibility
    icon: iconPath, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.loadFile('src/index.html');
}

// ===================================================================
// == 4. APP LIFECYCLE MANAGEMENT ==
// ===================================================================
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});