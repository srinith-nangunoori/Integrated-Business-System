const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Supplier Functions
  getSuppliers: () => ipcRenderer.invoke('get-suppliers'),
  addSupplier: (data) => ipcRenderer.invoke('add-supplier', data),
  getSupplierById: (id) => ipcRenderer.invoke('get-supplier-by-id', id),
  updateSupplier: (id, data) => ipcRenderer.invoke('update-supplier', id, data),
  deleteSupplier: (id) => ipcRenderer.invoke('delete-supplier', id),

  // Employee Functions
  getEmployees: (searchTerm) => ipcRenderer.invoke('get-employees', searchTerm),
  getEmployeeById: (id) => ipcRenderer.invoke('get-employee-by-id', id),
  addEmployee: (data) => ipcRenderer.invoke('add-employee', data),
  updateEmployee: (id, data) => ipcRenderer.invoke('update-employee', id, data),
  deleteEmployee: (id) => ipcRenderer.invoke('delete-employee', id),

  // Product Functions
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (data) => ipcRenderer.invoke('add-product', data),
  updateProduct: (name, data) => ipcRenderer.invoke('update-product', name, data),
  deleteProduct: (name) => ipcRenderer.invoke('delete-product', name),

  // Materials Functions
  getMaterials: () => ipcRenderer.invoke('get-materials'),
  addMaterial: (data) => ipcRenderer.invoke('add-material', data),
  updateMaterial: (name, data) => ipcRenderer.invoke('update-material', name, data),
  deleteMaterial: (name) => ipcRenderer.invoke('delete-material', name),

  // Buyer Functions
  getBuyers: () => ipcRenderer.invoke('get-buyers'),
  getBuyerById: (id) => ipcRenderer.invoke('get-buyer-by-id', id),
  addBuyer: (data) => ipcRenderer.invoke('add-buyer', data),
  updateBuyer: (id, data) => ipcRenderer.invoke('update-buyer', id, data),
  deleteBuyer: (id) => ipcRenderer.invoke('delete-buyer', id),
  
  // Department Functions
  getDepartments: () => ipcRenderer.invoke('get-departments'),
  addDepartment: (data) => ipcRenderer.invoke('add-department', data),
  updateDepartment: (id, data) => ipcRenderer.invoke('update-department', id, data),
  deleteDepartment: (id) => ipcRenderer.invoke('delete-department', id),

  createSellTransaction: (supplierId, items) => ipcRenderer.invoke('create-sell-transaction', supplierId, items),
  createBuyTransaction: (buyerId, items) => ipcRenderer.invoke('create-buy-transaction', buyerId, items),
  createProductionTransaction: (departmentId, inputs, outputs) => ipcRenderer.invoke('create-production-transaction', departmentId, inputs, outputs),
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  getRecentActivity: () => ipcRenderer.invoke('get-recent-activity'),
  getTransactionHistory: (filters) => ipcRenderer.invoke('get-transaction-history', filters)
});