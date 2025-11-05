window.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBAL REFERENCES ---
    const navList = document.querySelector('.nav-list');
    const viewTitle = document.getElementById('view-title');
    const contentArea = document.getElementById('content-area');
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // --- 2. NAVIGATION SETUP ---
    const views = [
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'employees', name: 'Employees' },
        { id: 'products', name: 'Products & Materials' },
        { id: 'suppliers', name: 'Suppliers & Buyers' },
        { id: 'departments', name: 'Departments' },
        { id: 'transactions', name: 'New Transaction' },
        { id: 'history', name: 'Transaction History' }
    ];

    views.forEach(view => {
        const listItem = document.createElement('li');
        listItem.id = `nav-${view.id}`;
        listItem.textContent = view.name;
        listItem.setAttribute('data-view', view.id);
        navList.appendChild(listItem);
    });

    // --- 3. CORE APP ROUTER ---
    function switchView(viewId) {
        const currentView = views.find(v => v.id === viewId);
        viewTitle.textContent = currentView ? currentView.name : 'Dashboard';
        document.querySelectorAll('.nav-list li').forEach(li => {
            li.classList.toggle('active', li.getAttribute('data-view') === viewId);
        });
        contentArea.innerHTML = '';

        if (viewId === 'dashboard') {
            renderDashboardView();
        } else if (viewId === 'employees') {
            renderEmployeesView();
        } else if (viewId === 'products') {
            renderProductsAndMaterialsView();
        } else if (viewId === 'suppliers') {
            renderContactsView();
        } else if (viewId === 'departments') {
            renderDepartmentsView();
        } else if (viewId === 'transactions') { 
            renderNewTransactionView(); 
        } else if (viewId === 'history') {
            renderTransactionHistoryView();
        } else {
            contentArea.innerHTML = `<p>Content for ${viewId} will be rendered here.</p>`;
        }
    }

    navList.addEventListener('click', (event) => {
        if (event.target && event.target.tagName === 'LI') {
            const viewId = event.target.getAttribute('data-view');
            switchView(viewId);
        }
    });

    // --- 6. INITIAL VIEW ---
    switchView('dashboard');

    // ===================================================================
    // == VIEW RENDERER FUNCTIONS ==
    // ===================================================================

    async function renderContactsView() {
        // 1. Render the main tabbed layout
        contentArea.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Contacts Management</h2>
                <div id="contact-type-specific-actions"></div>
            </div>
            <div class="tab-container">
                <button class="tab-button active" data-tab="suppliers">Suppliers</button>
                <button class="tab-button" data-tab="buyers">Buyers</button>
            </div>
            <div id="contacts-content"></div>
        `;

        // 2. Render the initial tab's content
        await renderSuppliersTable();

        // 3. Add event listeners for tab switching
        document.querySelector('.tab-container').addEventListener('click', async (event) => {
            if (event.target.classList.contains('tab-button')) {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                const tab = event.target.getAttribute('data-tab');
                if (tab === 'suppliers') await renderSuppliersTable();
                else if (tab === 'buyers') await renderBuyersTable();
            }
        });
    }

    // Helper function to render ONLY the Suppliers table
    async function renderSuppliersTable() {
        document.getElementById('contact-type-specific-actions').innerHTML = `<button id="add-supplier-btn" class="btn btn-primary">Add New Supplier</button>`;
        document.getElementById('contacts-content').innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
                    <tbody id="supplier-table-body"></tbody>
                </table>
            </div>
        `;
        const result = await api.getSuppliers();
        const tableBody = document.getElementById('supplier-table-body');
        tableBody.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${item.s_id}</td><td>${item.company_name}</td><td>${item.contact_name}</td><td>${item.email}</td><td>${item.phone_no}</td>
                                <td><button class="btn-action edit" data-id="${item.s_id}">Edit</button><button class="btn-action delete" data-id="${item.s_id}">Delete</button></td>`;
                tableBody.appendChild(row);
            });
        }else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <p style="color: #e74c3c; margin-bottom: 10px;">Error: Could not connect to the database.</p>
                        <button id="retry-fetch-btn" class="btn btn-primary">Retry Connection</button>
                    </td>
                </tr>
            `;
            // Add a one-time event listener to the new button
            document.getElementById('retry-fetch-btn').addEventListener('click', () => {
                switchView('suppliers'); // Simply re-run the view rendering logic
            });
        }
    }

    // Helper function to render ONLY the Buyers table
    async function renderBuyersTable() {
        document.getElementById('contact-type-specific-actions').innerHTML = `<button id="add-buyer-btn" class="btn btn-primary">Add New Buyer</button>`;
        document.getElementById('contacts-content').innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
                    <tbody id="buyer-table-body"></tbody>
                </table>
            </div>
        `;
        const result = await api.getBuyers();
        const tableBody = document.getElementById('buyer-table-body');
        tableBody.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${item.b_id}</td><td>${item.company_name}</td><td>${item.contact_name}</td><td>${item.email}</td><td>${item.phone_no}</td>
                                <td><button class="btn-action edit" data-id="${item.b_id}">Edit</button><button class="btn-action delete" data-id="${item.b_id}">Delete</button></td>`;
                tableBody.appendChild(row);
            });
        }else{
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center">...</td></tr>`;
        }
    }


    // New function for the Departments view
    async function renderDepartmentsView() {
        contentArea.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Departments</h2>
                <button id="add-department-btn" class="btn btn-primary">Add New Department</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Department Name</th><th>Actions</th></tr></thead>
                    <tbody id="department-table-body"></tbody>
                </table>
            </div>
        `;
        const result = await api.getDepartments();
        const tableBody = document.getElementById('department-table-body');
        tableBody.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(dept => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${dept.d_id}</td><td>${dept.department_name}</td>
                                <td><button class="btn-action edit" data-id="${dept.d_id}">Edit</button><button class="btn-action delete" data-id="${dept.d_id}">Delete</button></td>`;
                tableBody.appendChild(row);
            });
        } else {
            if (result.success && result.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3" class="text-center">No departments found.</td></tr>';
            }
            else {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-center">
                            <p style="color: #e74c3c; margin-bottom: 10px;">Error: ${result.error || 'Could not fetch departments.'}</p>
                            <button id="retry-dept-fetch-btn" class="btn btn-primary">Retry</button>
                        </td>
                    </tr>
                `;
                document.getElementById('retry-dept-fetch-btn').addEventListener('click', () => {
                    renderDepartmentsView();
                });
            }
        }
    }
    

    async function renderEmployeesView() {
        // 1. Render the VIEW SHELL (header, search bar, table structure). This runs only ONCE.
        contentArea.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Employee Records</h2>
                <div class="search-container">
                    <input type="text" id="employee-search" placeholder="Search by name, role, or email...">
                </div>
                <button id="add-employee-btn" class="btn btn-primary">Add New Employee</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Phone No.</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="employee-table-body">
                        <!-- Data rows will be populated by the function below -->
                    </tbody>
                </table>
            </div>
        `;

        // 2. Fetch the initial data and populate the table for the first time.
        await fetchAndDisplayEmployees('');

        // 3. Add the search event listener. It now calls the new data-only function.
        const searchInput = document.getElementById('employee-search');
        searchInput.timer = null; 
        searchInput.addEventListener('input', (event) => {
            clearTimeout(searchInput.timer);
            searchInput.timer = setTimeout(async () => {
                // ONLY fetch data and re-draw the table, not the whole view
                await fetchAndDisplayEmployees(event.target.value); 
            }, 300);
        });
    }

    // NEW HELPER FUNCTION: This ONLY handles fetching data and updating the table body.
    async function fetchAndDisplayEmployees(searchTerm) {
        const employeeTableBody = document.getElementById('employee-table-body');
        if (!employeeTableBody) return; // Safety check in case the view has changed

        employeeTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;

        const result = await api.getEmployees(searchTerm);

        employeeTableBody.innerHTML = ''; // Clear "Loading..." message

        if (result.success) {
            if (result.data.length === 0) {
                employeeTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No employees found${searchTerm ? ' for "' + searchTerm + '"' : ''}.</td></tr>`;
            } else {
                result.data.forEach(employee => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${employee.e_id}</td>
                        <td>${employee.employee_name}</td>
                        <td>${employee.role}</td>
                        <td>${employee.phone_no}</td>
                        <td>${employee.email || ''}</td>
                        <td>
                            <button class="btn-action edit" data-id="${employee.e_id}">Edit</button>
                            <button class="btn-action delete" data-id="${employee.e_id}">Delete</button>
                        </td>
                    `;
                    employeeTableBody.appendChild(row);
                });
            }
        } else {
            employeeTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <p style="color: #e74c3c; margin-bottom: 10px;">Error: ${result.error}</p>
                        <button id="retry-fetch-btn" class="btn btn-primary">Retry</button>
                    </td>
                </tr>
            `;
            // We need to re-add the listener in case of an error
            document.getElementById('retry-fetch-btn').addEventListener('click', () => fetchAndDisplayEmployees(searchTerm));
        }
    }

    async function renderProductsAndMaterialsView() {
        // 1. Render the main tabbed layout
        contentArea.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Inventory Management</h2>
                <div id="item-type-specific-actions">
                    <!-- Add New buttons will go here -->
                </div>
            </div>
            <div class="tab-container">
                <button class="tab-button active" data-tab="products">Products</button>
                <button class="tab-button" data-tab="materials">Materials</button>
            </div>
            <div id="inventory-content">
                <!-- Table for the active tab will be rendered here -->
            </div>
        `;

        // 2. Render the initial tab's content
        await renderProductsTable();

        // 3. Add event listeners for tab switching
        document.querySelector('.tab-container').addEventListener('click', async (event) => {
            if (event.target.classList.contains('tab-button')) {
                // Remove active class from all tabs
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                // Add active class to the clicked tab
                event.target.classList.add('active');

                const tab = event.target.getAttribute('data-tab');
                if (tab === 'products') {
                    await renderProductsTable();
                } else if (tab === 'materials') {
                    await renderMaterialsTable();
                }
            }
        });
    }

    // Helper function to render ONLY the Products table
    async function renderProductsTable() {
        document.getElementById('item-type-specific-actions').innerHTML = `
            <button id="add-product-btn" class="btn btn-primary">Add New Product</button>
        `;
        document.getElementById('inventory-content').innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Name</th><th>Stock</th><th>Unit</th><th>Actions</th></tr></thead>
                    <tbody id="product-table-body"><tr><td colspan="4" class="text-center">Loading...</td></tr></tbody>
                </table>
            </div>
        `;
        const result = await api.getProducts();
        const tableBody = document.getElementById('product-table-body');
        tableBody.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${item.product_name}</td><td>${item.stock}</td><td>${item.unit}</td>
                                <td><button class="btn-action edit" data-name="${item.product_name}">Edit</button>
                                    <button class="btn-action delete" data-name="${item.product_name}">Delete</button></td>`;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center">${result.success ? 'No products found.' : result.error}</td></tr>`;
        }
    }

    // Helper function to render ONLY the Materials table
    async function renderMaterialsTable() {
        document.getElementById('item-type-specific-actions').innerHTML = `
            <button id="add-material-btn" class="btn btn-primary">Add New Material</button>
        `;
        document.getElementById('inventory-content').innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Name</th><th>Stock</th><th>Unit</th><th>Actions</th></tr></thead>
                    <tbody id="material-table-body"><tr><td colspan="4" class="text-center">Loading...</td></tr></tbody>
                </table>
            </div>
        `;
        const result = await api.getMaterials();
        const tableBody = document.getElementById('material-table-body');
        tableBody.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${item.material_name}</td><td>${item.stock}</td><td>${item.unit}</td>
                                <td><button class="btn-action edit" data-name="${item.material_name}">Edit</button>
                                    <button class="btn-action delete" data-name="${item.material_name}">Delete</button></td>`;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center">${result.success ? 'No materials found.' : result.error}</td></tr>`;
        }
    }

    async function renderNewTransactionView() {
        // 1. Render the main tabbed layout for all transactions
        contentArea.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Record a Transaction</h2>
            </div>
            <div class="tab-container">
                <button class="tab-button active" data-tab="sells">From Supplier (Sells)</button>
                <button class="tab-button" data-tab="buys">To Buyer (Buys)</button>
                <button class="tab-button" data-tab="production">Internal Production</button>
            </div>
            <div id="transaction-content">
                <!-- Content for the active tab will be rendered here -->
            </div>
        `;

        // 2. Render the initial tab's content
        await renderSellsForm();

        // 3. Add event listeners for tab switching
        document.querySelector('.tab-container').addEventListener('click', async (event) => {
            if (event.target.classList.contains('tab-button')) {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                const tab = event.target.getAttribute('data-tab');

                if (tab === 'sells') {
                    await renderSellsForm();
                } else if (tab === 'buys') {
                    await renderBuysForm();
                } else if (tab === 'production') {
                    await renderProductionForm();
                }
            }
        });
    }

    async function renderTransactionHistoryView(filters = {}) {
        // 1. Render the static HTML, including filter controls
        contentArea.innerHTML = `
            <div class="view-header">
                <h2 class="view-title">Transaction History</h2>
                <div class="filter-container">
                    <label for="transaction-type-filter">Filter by Type:</label>
                    <select id="transaction-type-filter">
                        <option value="all">All Transactions</option>
                        <option value="purchase">Purchases (from Suppliers)</option>
                        <option value="sale">Sales (to Buyers)</option>
                        <option value="production">Production Runs</option>
                    </select>
                </div>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Associated Party</th>
                            <th>Total Value</th>
                        </tr>
                    </thead>
                    <tbody id="history-table-body">
                        <tr><td colspan="4" class="text-center">Loading history...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        // Pre-select the filter dropdown if a filter was passed
        const filterSelect = document.getElementById('transaction-type-filter');
        if (filters.typeFilter) {
            filterSelect.value = filters.typeFilter;
        }
        
        // Add event listener to the filter dropdown
        filterSelect.addEventListener('change', () => {
            renderTransactionHistoryView({ typeFilter: filterSelect.value });
        });

        // 2. Fetch the data from the backend with the current filters
        const historyTableBody = document.getElementById('history-table-body');
        const result = await api.getTransactionHistory(filters);

        // 3. Populate the table with the combined results
        historyTableBody.innerHTML = '';
        if (result.success) {
            if (result.data.length === 0) {
                historyTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No transactions found.</td></tr>';
            } else {
                result.data.forEach(item => {
                    const row = document.createElement('tr');
                    // Format the total_value to show as currency, or 'N/A' if null
                    const totalValue = item.total_value ? `$${parseFloat(item.total_value).toFixed(2)}` : 'N/A';
                    row.innerHTML = `
                        <td><span class="activity-type ${item.type.toLowerCase()}">${item.type}</span></td>
                        <td>${new Date(item.date).toLocaleDateString()}</td>
                        <td>${item.party}</td>
                        <td>${totalValue}</td>
                    `;
                    historyTableBody.appendChild(row);
                });
            }
        } else {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">
                        <p style="color: #e74c3c; margin-bottom: 10px;">Error: ${result.error}</p>
                        <button id="retry-history-fetch-btn" class="btn btn-primary">Retry</button>
                    </td>
                </tr>
            `;
            document.getElementById('retry-history-fetch-btn').addEventListener('click', () => {
                renderTransactionHistoryView(filters);
            });
        }
    }


    // Renamed from renderTransactionsView to be more specific
    async function renderSellsForm() {
        document.getElementById('transaction-content').innerHTML = `
            <div class="transaction-form-container">
                <div class="form-group">
                    <label for="supplier-select">Select a Supplier</label>
                    <select id="supplier-select" name="supplier_id"><option value="">Loading suppliers...</option></select>
                </div>
                <div id="materials-section" class="hidden">
                    <hr><h3>Add Materials to this Bill</h3>
                    <div class="form-group-inline">
                        <div class="form-group"><label for="material-select">Material</label><select id="material-select"></select></div>
                        <div class="form-group"><label for="material-quantity">Quantity</label><input type="number" id="material-quantity" value="1" min="1"></div>
                        <div class="form-group"><label for="material-cost">Cost (per item)</label><input type="number" id="material-cost" step="0.01" min="0" placeholder="0.00"></div>
                        <button id="add-material-to-bill-btn" class="btn btn-secondary">Add Item</button>
                    </div>
                    <h4>Items on this Bill</h4>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Material Name</th><th>Quantity</th><th>Cost</th><th>Actions</th></tr></thead>
                            <tbody id="bill-items-body"></tbody>
                        </table>
                    </div>
                    <div class="form-actions">
                        <button id="submit-sell-transaction-btn" class="btn btn-primary" disabled>Complete Transaction</button>
                    </div>
                </div>
            </div>
        `;
        // --- 2. GET REFERENCES TO NEW ELEMENTS ---
        const supplierSelect = document.getElementById('supplier-select');
        const materialsSection = document.getElementById('materials-section');
        const materialSelect = document.getElementById('material-select');
        const billItemsBody = document.getElementById('bill-items-body');
        const submitTransactionBtn = document.getElementById('submit-sell-transaction-btn');

        // --- 3. STATE MANAGEMENT ---
        // This array will hold the items we add to the bill before submitting
        let billItems = [];

        // --- 4. POPULATE INITIAL DROPDOWNS ---
        const suppliersResult = await api.getSuppliers();
        if (suppliersResult.success) {
            supplierSelect.innerHTML = '<option value="">-- Please select a supplier --</option>';
            suppliersResult.data.forEach(s => {
                const option = document.createElement('option');
                option.value = s.s_id;
                option.textContent = s.company_name;
                supplierSelect.appendChild(option);
            });
        }

        const materialsResult = await api.getMaterials();
        if (materialsResult.success) {
            materialSelect.innerHTML = '<option value="">-- Select a material --</option>';
            materialsResult.data.forEach(m => {
                const option = document.createElement('option');
                option.value = m.material_name;
                option.textContent = m.material_name;
                materialSelect.appendChild(option);
            });
        }

        // --- 5. EVENT LISTENERS ---
        // When a supplier is selected, show the materials section
        supplierSelect.addEventListener('change', () => {
            if (supplierSelect.value) {
                materialsSection.classList.remove('hidden');
            } else {
                materialsSection.classList.add('hidden');
            }
        });

        // When "Add Item" is clicked
        document.getElementById('add-material-to-bill-btn').addEventListener('click', () => {
            const name = materialSelect.value;
            const quantity = document.getElementById('material-quantity').value;
            const cost = document.getElementById('material-cost').value;

            if (!name || quantity <= 0 || cost < 0) {
                alert('Please select a material and enter a valid quantity and cost.');
                return;
            }

            // Add the item to our state array
            billItems.push({ material_name: name, quantity: parseInt(quantity), cost: parseFloat(cost) });
            
            // Re-render the bill items table
            renderBillItems();
        });
        
        // Handler for delete button on bill items
        billItemsBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-item')) {
                const index = event.target.getAttribute('data-index');
                billItems.splice(index, 1); // Remove item from the array by its index
                renderBillItems();
            }
        });

        // --- 6. HELPER FUNCTION TO RENDER THE BILL TABLE ---
        function renderBillItems() {
            billItemsBody.innerHTML = ''; // Clear the table

            if (billItems.length === 0) {
                submitTransactionBtn.disabled = true; // Disable submit if no items
                return;
            }

            billItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.material_name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.cost.toFixed(2)}</td>
                    <td><button class="btn-action delete-item" data-index="${index}">Remove</button></td>
                `;
                billItemsBody.appendChild(row);
            });

            submitTransactionBtn.disabled = false; // Enable submit button
        }

        submitTransactionBtn.addEventListener('click', async () => {
            const selectedSupplierId = supplierSelect.value;
            if (!selectedSupplierId || billItems.length === 0) {
                alert("Please select a supplier and add at least one item.");
                return;
            }

            // Disable the button to prevent double-clicks
            submitTransactionBtn.disabled = true;
            submitTransactionBtn.textContent = 'Processing...';

            const result = await api.createSellTransaction(selectedSupplierId, billItems);

            if (result.success) {
                alert(`Transaction successfully created with Bill ID: ${result.billId}`);
                // Reset the view to start a new transaction
                switchView('transactions'); 
            } else {
                showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`);
                // Re-enable the button if the transaction failed
                submitTransactionBtn.disabled = false;
                submitTransactionBtn.textContent = 'Complete Transaction';
            }
        });
    }

    async function renderBuysForm() {
        document.getElementById('transaction-content').innerHTML = `
            <div class="transaction-form-container">
                <div class="form-group">
                    <label for="buyer-select">Select a Buyer</label>
                    <select id="buyer-select" name="buyer_id"><option value="">Loading buyers...</option></select>
                </div>
                <div id="products-section" class="hidden">
                    <hr><h3>Add Products to this Bill</h3>
                    <div class="form-group-inline">
                        <div class="form-group"><label for="product-select">Product</label><select id="product-select"></select></div>
                        <div class="form-group"><label for="product-quantity">Quantity</label><input type="number" id="product-quantity" value="1" min="1"></div>
                        <div class="form-group"><label for="product-cost">Cost (per item)</label><input type="number" id="product-cost" step="0.01" min="0" placeholder="0.00"></div>
                        <button id="add-product-to-bill-btn" class="btn btn-secondary">Add Item</button>
                    </div>
                    <h4>Items on this Bill</h4>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Product Name</th><th>Quantity</th><th>Cost</th><th>Actions</th></tr></thead>
                            <tbody id="buy-bill-items-body"></tbody>
                        </table>
                    </div>
                    <div class="form-actions">
                        <button id="submit-buy-transaction-btn" class="btn btn-primary" disabled>Complete Transaction</button>
                    </div>
                </div>
            </div>
        `;

        // --- LOGIC FOR THE BUYS FORM ---
        const buyerSelect = document.getElementById('buyer-select');
        const productsSection = document.getElementById('products-section');
        const productSelect = document.getElementById('product-select');
        const buyBillItemsBody = document.getElementById('buy-bill-items-body');
        const submitBuyBtn = document.getElementById('submit-buy-transaction-btn');

        let buyBillItems = [];

        // Populate dropdowns
        const buyersResult = await api.getBuyers();
        if (buyersResult.success) {
            buyerSelect.innerHTML = '<option value="">-- Please select a buyer --</option>';
            buyersResult.data.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b.b_id; opt.textContent = b.company_name;
                buyerSelect.appendChild(opt);
            });
        }

        const productsResult = await api.getProducts();
        if (productsResult.success) {
            productSelect.innerHTML = '<option value="">-- Select a product --</option>';
            productsResult.data.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.product_name; opt.textContent = p.product_name;
                productSelect.appendChild(opt);
            });
        }

        function renderBuyBillItems() {
            buyBillItemsBody.innerHTML = '';
            if (buyBillItems.length === 0) {
                submitBuyBtn.disabled = true;
                return;
            }
            buyBillItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.product_name}</td><td>${item.quantity}</td><td>${item.cost.toFixed(2)}</td>
                    <td><button class="btn-action delete-item" data-index="${index}">Remove</button></td>`;
                buyBillItemsBody.appendChild(row);
            });
            submitBuyBtn.disabled = false;
        }


        // Event Listeners
        buyerSelect.addEventListener('change', () => {
            if (buyerSelect.value) productsSection.classList.remove('hidden');
            else productsSection.classList.add('hidden');
        });

        document.getElementById('add-product-to-bill-btn').addEventListener('click', () => {
            const name = productSelect.value;
            const quantity = document.getElementById('product-quantity').value;
            const cost = document.getElementById('product-cost').value;

            if (!name || quantity <= 0 || cost < 0) {
                alert('Please select a product and enter a valid quantity and cost.');
                return;
            }

            // Add the item to our state array
            buyBillItems.push({ product_name: name, quantity: parseInt(quantity), cost: parseFloat(cost) });
            
            // Re-render the bill items table
            renderBuyBillItems();
        });

        buyBillItemsBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-item')) {
                const index = event.target.getAttribute('data-index');
                buyBillItems.splice(index, 1); // Remove item from the array by its index
                renderBuyBillItems();
            }
        });
        
        submitBuyBtn.addEventListener('click', async () => {
            const selectedBuyerId = buyerSelect.value;
            if (!selectedBuyerId || buyBillItems.length === 0) { 
                alert("Please select a buyer and add at least one item."); 
                return;
            }

            submitBuyBtn.disabled = true;
            submitBuyBtn.textContent = 'Processing...';
            const result = await api.createBuyTransaction(selectedBuyerId, buyBillItems); 

            if (result.success) {
                alert(`Transaction successfully created with Bill ID: ${result.billId}`);
                switchView('transactions'); 
            } else {
                showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`);
                submitBuyBtn.disabled = false;
                submitBuyBtn.textContent = 'Complete Transaction';
            }
        });
    }


    async function renderProductionForm() {
        // 1. Render the static HTML structure
        document.getElementById('transaction-content').innerHTML = `
            <div class="transaction-form-container">
                <div class="form-group">
                    <label for="department-select">Select a Department for this Production Run</label>
                    <select id="department-select"><option value="">Loading departments...</option></select>
                </div>
                <div id="production-section" class="hidden">
                    <div class="production-columns">
                        <!-- Input Column -->
                        <div class="production-column">
                            <hr><h3>Consumed Materials (Input)</h3>
                            <div class="form-group-inline">
                                <div class="form-group" style="flex-grow: 1;"><label for="material-select">Material</label><select id="material-select"></select></div>
                                <div class="form-group"><label for="input-quantity">Qty</label><input type="number" id="input-quantity" value="1" min="1" style="width: 70px;"></div>
                                <button id="add-input-btn" class="btn btn-secondary">Add Input</button>
                            </div>
                            <div class="table-container">
                                <table class="data-table">
                                    <thead><tr><th>Material</th><th>Quantity</th><th>Action</th></tr></thead>
                                    <tbody id="input-items-body"></tbody>
                                </table>
                            </div>
                        </div>
                        <!-- Output Column -->
                        <div class="production-column">
                            <hr><h3>Created Products (Output)</h3>
                            <div class="form-group-inline">
                                <div class="form-group" style="flex-grow: 1;"><label for="product-select">Product</label><select id="product-select"></select></div>
                                <div class="form-group"><label for="output-quantity">Qty</label><input type="number" id="output-quantity" value="1" min="1" style="width: 70px;"></div>
                                <button id="add-output-btn" class="btn btn-secondary">Add Output</button>
                            </div>
                            <div class="table-container">
                                <table class="data-table">
                                    <thead><tr><th>Product</th><th>Quantity</th><th>Action</th></tr></thead>
                                    <tbody id="output-items-body"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button id="submit-production-btn" class="btn btn-primary" disabled>Log Production Run</button>
                    </div>
                </div>
            </div>
        `;

        // --- LOGIC FOR THE PRODUCTION FORM ---
        let inputItems = [];
        let outputItems = [];

        const departmentSelect = document.getElementById('department-select'), productionSection = document.getElementById('production-section'),
            materialSelect = document.getElementById('material-select'), productSelect = document.getElementById('product-select'),
            inputItemsBody = document.getElementById('input-items-body'), outputItemsBody = document.getElementById('output-items-body'),
            submitProductionBtn = document.getElementById('submit-production-btn');

        // Populate dropdowns in parallel
        const [depts, materials, products] = await Promise.all([api.getDepartments(), api.getMaterials(), api.getProducts()]);
        departmentSelect.innerHTML = '<option value="">-- Select a department --</option>';
        if (depts.success) depts.data.forEach(d => departmentSelect.innerHTML += `<option value="${d.d_id}">${d.department_name}</option>`);
        materialSelect.innerHTML = '<option value="">-- Select a material --</option>';
        if (materials.success) materials.data.forEach(m => materialSelect.innerHTML += `<option value="${m.material_name}" data-unit="${m.unit}">${m.material_name}</option>`);
        productSelect.innerHTML = '<option value="">-- Select a product --</option>';
        if (products.success) products.data.forEach(p => productSelect.innerHTML += `<option value="${p.product_name}" data-unit="${p.unit}">${p.product_name}</option>`);

        const checkSubmitButton = () => { submitProductionBtn.disabled = !(departmentSelect.value && inputItems.length > 0 && outputItems.length > 0); };
        
        function renderInputTable() {
            inputItemsBody.innerHTML = '';
            inputItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${item.name}</td><td>${item.quantity} ${item.unit}</td><td><button class="btn-action delete-item" data-type="input" data-index="${index}">Remove</button></td>`;
                inputItemsBody.appendChild(row);
            });
            checkSubmitButton();
        }
        
        function renderOutputTable() {
            outputItemsBody.innerHTML = '';
            outputItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${item.name}</td><td>${item.quantity} ${item.unit}</td><td><button class="btn-action delete-item" data-type="output" data-index="${index}">Remove</button></td>`;
                outputItemsBody.appendChild(row);
            });
            checkSubmitButton();
        }

        departmentSelect.addEventListener('change', () => {
            if (departmentSelect.value) productionSection.classList.remove('hidden');
            else productionSection.classList.add('hidden');
            checkSubmitButton();
        });

        document.getElementById('add-input-btn').addEventListener('click', () => {
            const qty = document.getElementById('input-quantity').value;
            const selectedOption = materialSelect.options[materialSelect.selectedIndex];
            if (!selectedOption.value || qty <= 0) { alert('Please select a material and quantity.'); return; }
            inputItems.push({ name: selectedOption.value, quantity: parseInt(qty), unit: selectedOption.getAttribute('data-unit') });
            renderInputTable();
        });

        document.getElementById('add-output-btn').addEventListener('click', () => {
            const qty = document.getElementById('output-quantity').value;
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            if (!selectedOption.value || qty <= 0) { alert('Please select a product and quantity.'); return; }
            outputItems.push({ name: selectedOption.value, quantity: parseInt(qty), unit: selectedOption.getAttribute('data-unit') });
            renderOutputTable();
        });

        productionSection.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-item')) {
                const type = e.target.getAttribute('data-type');
                const index = e.target.getAttribute('data-index');
                if (type === 'input') { inputItems.splice(index, 1); renderInputTable(); }
                if (type === 'output') { outputItems.splice(index, 1); renderOutputTable(); }
            }
        });

        submitProductionBtn.addEventListener('click', async () => {
            if (!departmentSelect.value || inputItems.length === 0 || outputItems.length === 0) {
                alert('Please select a department and add at least one input and one output.'); return;
            }
            submitProductionBtn.disabled = true;
            submitProductionBtn.textContent = 'Processing...';
            const result = await api.createProductionTransaction(departmentSelect.value, inputItems, outputItems);
            if (result.success) {
                alert('Production run successfully logged.');
                switchView('transactions');
            } else {
                showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`);
                submitProductionBtn.disabled = false;
                submitProductionBtn.textContent = 'Log Production Run';
            }
        });
    }

    async function renderDashboardView() {
        // 1. Render the static HTML, now including a placeholder for the activity list
        contentArea.innerHTML = `
            <div class="dashboard-grid">
                <div class="stat-card"><h3 class="stat-title">Total Employees</h3><p id="stats-employees" class="stat-value">...</p></div>
                <div class="stat-card"><h3 class="stat-title">Total Suppliers</h3><p id="stats-suppliers" class="stat-value">...</p></div>
                <div class="stat-card"><h3 class="stat-title">Product Varieties</h3><p id="stats-products" class="stat-value">...</p></div>
                <div class="stat-card low-stock"><h3 class="stat-title">Products Low on Stock</h3><p id="stats-low-stock" class="stat-value">...</p></div>
            </div>
            <div id="dashboard-details" class="recent-activity-container">
                <h2 class="view-title">Recent Activity</h2>
                <ul id="recent-activity-list" class="recent-activity-list">
                    <li>Loading activity...</li>
                </ul>
            </div>
        `;

        // 2. Fetch BOTH sets of data in parallel for speed
        const [statsResult, activityResult] = await Promise.all([
            api.getDashboardStats(),
            api.getRecentActivity()
        ]);

        // 3. Populate the stat cards (logic is unchanged)
        if (statsResult.success) {
            document.getElementById('stats-employees').textContent = statsResult.data.employees;
            document.getElementById('stats-suppliers').textContent = statsResult.data.suppliers;
            document.getElementById('stats-products').textContent = statsResult.data.products;
            document.getElementById('stats-low-stock').textContent = statsResult.data.lowStock;
        } else { /* handle error */ }

        // 4. Populate the new recent activity list
        const activityList = document.getElementById('recent-activity-list');
        activityList.innerHTML = ''; // Clear "Loading..."
        if (activityResult.success) {
            if (activityResult.data.length === 0) {
                activityList.innerHTML = '<li>No recent activity found.</li>';
            } else {
                activityResult.data.forEach(item => {
                    const li = document.createElement('li');
                    li.classList.add('activity-item');
                    li.innerHTML = `
                        <span class="activity-type ${item.type.toLowerCase()}">${item.type}</span>
                        <span class="activity-details"><strong>${item.item}</strong> associated with ${item.party}</span>
                        <span class="activity-date">${new Date(item.date).toLocaleDateString()}</span>
                    `;
                    activityList.appendChild(li);
                });
            }
        } else {
            activityList.innerHTML = `<li>Error loading activity: ${activityResult.error}</li>`;
        }
    }
    // ===================================================================
    // == MODAL CONTROL LOGIC ==
    // ===================================================================

    function showModal(title, bodyHtml) {
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHtml;
        modalContainer.classList.add('visible');
    }

    function hideModal() {
        modalContainer.classList.remove('visible');
        modalBody.innerHTML = ''; // Clear the body for next time
    }

    // Event listener to close the modal with the 'X' button
    modalCloseBtn.addEventListener('click', hideModal);

    // Event listener to close the modal by clicking the backdrop
    modalContainer.addEventListener('click', (event) => {
        if (event.target === modalContainer) {
            hideModal();
        }
    });

    /**
     * Shows a confirmation modal and returns a Promise that resolves when the user clicks a button.
     * @param {string} title - The title of the confirmation.
     * @param {string} message - The question to ask the user.
     * @returns {Promise<boolean>} - Resolves to `true` if confirmed, `false` otherwise.
     */
    function showConfirmationModal(title, message) {
        return new Promise((resolve) => {
            const bodyHtml = `
                <p>${message}</p>
                <div class="form-actions" style="margin-top: 24px;">
                    <button id="confirm-cancel-btn" class="btn btn-secondary">Cancel</button>
                    <button id="confirm-ok-btn" class="btn btn-primary" style="background-color: #e74c3c;">Confirm</button>
                </div>
            `;
            showModal(title, bodyHtml);

            const okBtn = document.getElementById('confirm-ok-btn');
            const cancelBtn = document.getElementById('confirm-cancel-btn');

            // Create a cleanup function to remove listeners
            const cleanup = () => {
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            const handleOk = () => {
                cleanup();
                hideModal();
                resolve(true);
            };

            const handleCancel = () => {
                cleanup();
                hideModal();
                resolve(false);
            };

            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);
        });
    }


    // ===================================================================
    // == EVENT LISTENERS FOR DYNAMIC CONTENT ==
    // ===================================================================
    // We use event delegation on the contentArea to handle clicks for buttons
    // that are created dynamically (like our "Add New Supplier" button).
    contentArea.addEventListener('click', async (event) => {
        const target = event.target;
        // Corrected Context Detection
        const isSupplierContext = (!!target.closest('#contacts-content') || target.id === 'add-supplier-btn') && !!document.querySelector('.tab-button[data-tab="suppliers"].active');
        const isBuyerContext = (!!target.closest('#contacts-content') || target.id === 'add-buyer-btn') && !!document.querySelector('.tab-button[data-tab="buyers"].active');
        const isEmployeeContext = !!document.getElementById('employee-table-body');
        const isDepartmentContext = !!document.getElementById('department-table-body') && !isEmployeeContext;
        const isProductContext = (!!target.closest('#inventory-content') || target.id === 'add-product-btn') && !!document.querySelector('.tab-button[data-tab="products"].active');
        const isMaterialContext = (!!target.closest('#inventory-content') || target.id === 'add-material-btn') && !!document.querySelector('.tab-button[data-tab="materials"].active');

        // ===============================================
        // ========= SUPPLIER/BUYER ACTIONS (Shared Logic) =========
        // ===============================================

        // This is the complete, unabridged block for BOTH Suppliers and Buyers

        if (isSupplierContext || isBuyerContext) {
            const entity = isSupplierContext ? 'supplier' : 'buyer';
            const refreshView = isSupplierContext ? renderSuppliersTable : renderBuyersTable;
            const entityIdKey = isSupplierContext ? 's_id' : 'b_id';

            if (target.id === `add-${entity}-btn`) {
                const formHtml = `
                    <form id="${entity}-form">
                        <div class="form-group"><label>Company Name</label><input type="text" name="company_name" required></div>
                        <div class="form-group"><label>Contact Name</label><input type="text" name="contact_name"></div>
                        <div class="form-group"><label>Phone Number</label><input type="tel" name="phone_no" required></div>
                        <div class="form-group"><label>Email</label><input type="email" name="email"></div>
                        <div class="form-group"><label>Address</label><textarea name="address" rows="3"></textarea></div>
                        <div class="form-actions"><button type="submit" class="btn btn-primary">Save ${entity.charAt(0).toUpperCase() + entity.slice(1)}</button></div>
                    </form>
                `;
                showModal(`Add New ${entity.charAt(0).toUpperCase() + entity.slice(1)}`, formHtml);

                document.getElementById(`${entity}-form`).addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());
                    const result = await api[entity === 'supplier' ? 'addSupplier' : 'addBuyer'](data);
                    if (result.success) { hideModal(); refreshView(); } 
                    else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`); }
                });
            } 
            else if (target.classList.contains('edit')) {
                const entityId = target.getAttribute('data-id');
                const result = await api[entity === 'supplier' ? 'getSupplierById' : 'getBuyerById'](entityId);
                
                if (result.success) {
                    const item = result.data;
                    const formHtml = `
                        <form id="${entity}-form" data-edit-id="${item[entityIdKey]}">
                            <div class="form-group"><label>Company Name</label><input type="text" name="company_name" value="${item.company_name || ''}" required></div>
                            <div class="form-group"><label>Contact Name</label><input type="text" name="contact_name" value="${item.contact_name || ''}"></div>
                            <div class="form-group"><label>Phone Number</label><input type="tel" name="phone_no" value="${item.phone_no || ''}" required></div>
                            <div class="form-group"><label>Email</label><input type="email" name="email" value="${item.email || ''}"></div>
                            <div class="form-group"><label>Address</label><textarea name="address" rows="3">${item.address || ''}</textarea></div>
                            <div class="form-actions"><button type="submit" class="btn btn-primary">Update ${entity.charAt(0).toUpperCase() + entity.slice(1)}</button></div>
                        </form>
                    `;
                    showModal(`Edit ${entity.charAt(0).toUpperCase() + entity.slice(1)}`, formHtml);

                    document.getElementById(`${entity}-form`).addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const editId = e.target.getAttribute('data-edit-id');
                        const formData = new FormData(e.target);
                        const data = Object.fromEntries(formData.entries());
                        const updateResult = await api[entity === 'supplier' ? 'updateSupplier' : 'updateBuyer'](editId, data);
                        if (updateResult.success) { hideModal(); refreshView(); } 
                        else {showModal('Operation Failed', `<p style="color: #e74c3c;">${updateResult.error}</p>`);}
                    });
                } else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`);}
            } 
            else if (target.classList.contains('delete')) {
                const entityId = target.getAttribute('data-id');
                const userConfirmed = await showConfirmationModal('Confirm Deletion', `Are you sure you want to delete this ${entity}? This action cannot be undone.`);
                if (userConfirmed) {
                    const result = await api[entity === 'supplier' ? 'deleteSupplier' : 'deleteBuyer'](entityId);
                    if (result.success) {
                        refreshView();
                    } else {
                        showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`);
                    }
                }
            }
        }


        // ===============================================
        // ========= DEPARTMENT ACTIONS =========
        // ===============================================

        else if (isDepartmentContext) {
            if (target.id === 'add-department-btn') {
                const formHtml = `
                    <form id="department-form">
                        <div class="form-group">
                            <label for="department-name">Department Name</label>
                            <input type="text" id="department-name" name="department_name" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Save Department</button>
                        </div>
                    </form>
                `;
                showModal('Add New Department', formHtml);

                document.getElementById('department-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());
                    const result = await api.addDepartment(data);
                    if (result.success) { hideModal(); renderDepartmentsView(); } 
                    else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`);}
                });
            }
            else if (target.classList.contains('edit')) {
                // NOTE: The getDepartmentById function does not exist, as it has only two fields.
                // We can get the data directly from the table row for efficiency.
                const deptId = target.getAttribute('data-id');
                const deptName = target.closest('tr').querySelector('td:nth-child(2)').textContent;
                
                const formHtml = `
                    <form id="department-form" data-edit-id="${deptId}">
                        <div class="form-group">
                            <label for="department-name">Department Name</label>
                            <input type="text" id="department-name" name="department_name" value="${deptName}" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Update Department</button>
                        </div>
                    </form>
                `;
                showModal('Edit Department', formHtml);

                document.getElementById('department-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const editId = e.target.getAttribute('data-edit-id');
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());
                    const result = await api.updateDepartment(editId, data);
                    if (result.success) { hideModal(); renderDepartmentsView(); } 
                    else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`); }
                });
            }
            else if (target.classList.contains('delete')) {
                const deptId = target.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this department?")) {
                    const result = await api.deleteDepartment(deptId);
                    if (result.success) { renderDepartmentsView(); } 
                    else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`); }
                }
            }
        }

        // ===============================================
        // ========= E M P L O Y E E   A C T I O N S =========
        // ===============================================

        else if (isEmployeeContext) {
            // --- ACTION: ADD EMPLOYEE ---
            if (target.id === 'add-employee-btn') {
                const formHtml = `
                    <form id="employee-form">
                        <div class="form-group"><label>Full Name</label><input type="text" name="employee_name" required></div>
                        <div class="form-group"><label>Age</label><input type="number" name="age"></div>
                        <div class="form-group"><label>Gender</label><select name="gender"><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
                        <div class="form-group"><label>Type</label><select name="type"><option value="PERMANENT">Permanent</option><option value="TEMPORARY">Temporary</option></select></div>
                        <div class="form-group"><label>Role</label><select name="role"><option value="PRODUCTION MANAGER">Production Manager</option><option value="QUALITY CONTROLLER">Quality Controller</option><option value="MACHINE OPERATOR">Machine Operator</option><option value="PRODUCTION SUPERVISOR">Production Supervisor</option><option value="INVENTORY CONTROLLER">Inventory Controller</option></select></div>
                        <div class="form-group"><label>Salary</label><input type="number" step="0.01" name="salary" required></div>
                        <div class="form-group"><label>Phone Number</label><input type="tel" name="phone_no" required></div>
                        <div class="form-group"><label>Email</label><input type="email" name="email"></div>
                        <div class="form-group"><label>Address</label><textarea name="address" rows="3"></textarea></div>
                        <div class="form-actions"><button type="submit" class="btn btn-primary">Save Employee</button></div>
                    </form>
                `;
                showModal('Add New Employee', formHtml);

                const employeeForm = document.getElementById('employee-form');
                employeeForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(employeeForm);
                    const employeeData = Object.fromEntries(formData.entries());
                    const result = await api.addEmployee(employeeData);
                    if (result.success) { hideModal(); switchView('employees'); } 
                    else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`); }
                });
            } 
            // --- ACTION: EDIT EMPLOYEE ---
            else if (target.classList.contains('edit')) {
                const employeeId = target.getAttribute('data-id');
                const result = await api.getEmployeeById(employeeId);
                if (result.success) {
                    const emp = result.data;
                    const formHtml = `
                        <form id="employee-form" data-edit-id="${emp.e_id}">
                            <div class="form-group"><label>Full Name</label><input type="text" name="employee_name" value="${emp.employee_name || ''}" required></div>
                            <div class="form-group"><label>Age</label><input type="number" name="age" value="${emp.age || ''}"></div>
                            <div class="form-group"><label>Gender</label><select name="gender"><option value="MALE" ${emp.gender === 'MALE' ? 'selected' : ''}>Male</option><option value="FEMALE" ${emp.gender === 'FEMALE' ? 'selected' : ''}>Female</option><option value="OTHER" ${emp.gender === 'OTHER' ? 'selected' : ''}>Other</option></select></div>
                            <div class="form-group"><label>Type</label><select name="type"><option value="PERMANENT" ${emp.type === 'PERMANENT' ? 'selected' : ''}>Permanent</option><option value="TEMPORARY" ${emp.type === 'TEMPORARY' ? 'selected' : ''}>Temporary</option></select></div>
                            <div class="form-group"><label>Role</label><select name="role">
                                <option value="PRODUCTION MANAGER" ${emp.role === 'PRODUCTION MANAGER' ? 'selected' : ''}>Production Manager</option>
                                <option value="QUALITY CONTROLLER" ${emp.role === 'QUALITY CONTROLLER' ? 'selected' : ''}>Quality Controller</option>
                                <option value="MACHINE OPERATOR" ${emp.role === 'MACHINE OPERATOR' ? 'selected' : ''}>Machine Operator</option>
                                <option value="PRODUCTION SUPERVISOR" ${emp.role === 'PRODUCTION SUPERVISOR' ? 'selected' : ''}>Production Supervisor</option>
                                <option value="INVENTORY CONTROLLER" ${emp.role === 'INVENTORY CONTROLLER' ? 'selected' : ''}>Inventory Controller</option>
                            </select></div>
                            <div class="form-group"><label>Salary</label><input type="number" step="0.01" name="salary" value="${emp.salary || ''}" required></div>
                            <div class="form-group"><label>Phone Number</label><input type="tel" name="phone_no" value="${emp.phone_no || ''}" required></div>
                            <div class="form-group"><label>Email</label><input type="email" name="email" value="${emp.email || ''}"></div>
                            <div class="form-group"><label>Address</label><textarea name="address" rows="3">${emp.address || ''}</textarea></div>
                            <div class="form-actions"><button type="submit" class="btn btn-primary">Update Employee</button></div>
                        </form>
                    `;
                    showModal('Edit Employee', formHtml);

                    const employeeForm = document.getElementById('employee-form');
                    employeeForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const editId = employeeForm.getAttribute('data-edit-id');
                        const formData = new FormData(employeeForm);
                        const employeeData = Object.fromEntries(formData.entries());
                        const updateResult = await api.updateEmployee(editId, employeeData);
                        if (updateResult.success) { hideModal(); switchView('employees'); } 
                        else { showModal('Operation Failed', `<p style="color: #e74c3c;">${updateResult.error}</p>`); }
                    });
                } else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`); }
            } 
            // --- ACTION: DELETE EMPLOYEE ---
            else if (target.classList.contains('delete')) {
                const employeeId = target.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
                    const result = await api.deleteEmployee(employeeId);
                    if (result.success) { switchView('employees'); } 
                    else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`); }
                }
            }
        }
        // ============================================================
        // ========= INVENTORY (PRODUCTS & MATERIALS) ACTIONS =========
        // ============================================================
        else if (isProductContext || isMaterialContext) {
            const isProductsTab = document.querySelector('.tab-button[data-tab="products"].active');
            const isMaterialsTab = document.querySelector('.tab-button[data-tab="materials"].active');

            // --- PRODUCT ACTIONS ---
            if (isProductsTab) {
                if (target.id === 'add-product-btn') {
                    const formHtml = `
                        <form id="product-form">
                            <div class="form-group"><label>Product Name</label><input type="text" name="product_name" required></div>
                            <div class="form-group"><label>Stock</label><input type="number" name="stock" value="0" required></div>
                            <div class="form-group"><label>Unit</label><select name="unit"><option value="k.g">k.g</option><option value="liter">liter</option></select></div>
                            <div class="form-actions"><button type="submit" class="btn btn-primary">Save Product</button></div>
                        </form>
                    `;
                    showModal('Add New Product', formHtml);
                    document.getElementById('product-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const data = Object.fromEntries(formData.entries());
                        const result = await api.addProduct(data);
                        if (result.success) { hideModal(); renderProductsTable(); } 
                        else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`);}
                    });
                }
                else if (target.classList.contains('delete')) {
                    const productName = target.getAttribute('data-name');
                     const userConfirmed = await showConfirmationModal('Confirm Deletion', `Are you sure you want to delete product: ${productName}? This action cannot be undone.`);
                    if (userConfirmed) {
                        const result = await api.deleteProduct(productName);
                        if (result.success) { renderProductsTable(); } 
                        else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`);}
                    }
                }
                // Note: Update for Products/Materials is not implemented as per ERD (only stock/unit can change, which is more of a transaction).
                // If you need to edit the NAME, the primary key, it requires a more complex delete/re-create logic.
            }
            
            // --- MATERIAL ACTIONS ---
            if (isMaterialsTab) {
                if (target.id === 'add-material-btn') {
                    const formHtml = `
                        <form id="material-form">
                            <div class="form-group"><label>Material Name</label><input type="text" name="material_name" required></div>
                            <div class="form-group"><label>Stock</label><input type="number" name="stock" value="0" required></div>
                            <div class="form-group"><label>Unit</label><select name="unit"><option value="k.g">k.g</option><option value="liter">liter</option></select></div>
                            <div class="form-actions"><button type="submit" class="btn btn-primary">Save Material</button></div>
                        </form>
                    `;
                    showModal('Add New Material', formHtml);
                    document.getElementById('material-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const data = Object.fromEntries(formData.entries());
                        const result = await api.addMaterial(data);
                        if (result.success) { hideModal(); renderMaterialsTable(); } 
                        else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`);}
                    });
                }
                else if (target.classList.contains('delete')) {
                    const materialName = target.getAttribute('data-name');
                    const userConfirmed = await showConfirmationModal('Confirm Deletion', `Are you sure you want to delete material ${materialName}? This action cannot be undone.`);
                    if (userConfirmed) {
                        const result = await api.deleteMaterial(materialName);
                        if (result.success) { renderMaterialsTable(); } 
                        else { showModal('Operation Failed', `<p style="color: #e74c3c;">${result.error}</p>`);}
                    }
                }
            }
        }
    });
});



















