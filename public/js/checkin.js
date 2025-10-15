let customers = [];
let classes = [];
let attendanceRecords = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    loadClasses();
    loadAttendanceHistory();
    loadAttendanceStats();
    
    setupEventListeners();
});

function setupEventListeners() {
    const customerSelect = document.getElementById('customerSelect');
    const classSelect = document.getElementById('classSelect');
    const checkinBtn = document.getElementById('checkinBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const historyCustomerSelect = document.getElementById('historyCustomerSelect');

    customerSelect.addEventListener('change', onCustomerSelect);
    classSelect.addEventListener('change', onClassSelect);
    checkinBtn.addEventListener('click', performCheckin);
    refreshBtn.addEventListener('click', refreshData);
    historyCustomerSelect.addEventListener('change', filterAttendanceHistory);
}

// Load customers from API (IDs + basic info)
async function loadCustomers() {
    try {
        const response = await fetch('/api/customer/getCustomerIds');
        customers = await response.json();
        
        populateCustomerSelects();
    } catch (error) {
        console.error('Error loading customers:', error);
        showMessage('Error loading customers', 'error');
    }
}

// Load classes from API (IDs + names + instructor)
async function loadClasses() {
    try {
        const response = await fetch('/api/class/getClassIds');
        classes = await response.json();
        
        populateClassSelect();
    } catch (error) {
        console.error('Error loading classes:', error);
        showMessage('Error loading classes', 'error');
    }
}

// Populate customer dropdowns
function populateCustomerSelects() {
    const customerSelect = document.getElementById('customerSelect');
    const historyCustomerSelect = document.getElementById('historyCustomerSelect');
    
    // Clear existing options (except first)
    customerSelect.innerHTML = '<option value="">Choose a customer...</option>';
    historyCustomerSelect.innerHTML = '<option value="">All customers</option>';
    
    customers.forEach(customer => {
        const option1 = document.createElement('option');
        option1.value = customer.customerId;
        option1.textContent = `${customer.customerId}: ${customer.firstName} ${customer.lastName}`;
        customerSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = customer.customerId;
        option2.textContent = `${customer.customerId}: ${customer.firstName} ${customer.lastName}`;
        historyCustomerSelect.appendChild(option2);
    });
}

// Populate class dropdown
function populateClassSelect() {
    const classSelect = document.getElementById('classSelect');
    classSelect.innerHTML = '<option value="">Choose a class...</option>';
    
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.classId || cls._id || '';
        const instructorName = cls.instructorName || `Instructor ${cls.instructorId || ''}`;
        option.textContent = `${cls.classId || ''}: ${cls.className} (${instructorName})`;
        classSelect.appendChild(option);
    });
}

// Handle customer selection
function onCustomerSelect() {
    const customerSelect = document.getElementById('customerSelect');
    const customerInfo = document.getElementById('customerInfo');
    const classSelect = document.getElementById('classSelect');
    const balanceAlert = document.getElementById('balanceAlert');
    const balanceError = document.getElementById('balanceError');
    
    if (customerSelect.value) {
        const selectedId = customerSelect.value;
        // Fetch full customer details for richer info
        fetch(`/api/customer/getCustomer?customerId=${encodeURIComponent(selectedId)}`)
            .then(res => res.json())
            .then(customer => {
                if (customer) {
                    document.getElementById('customerName').textContent = `${customer.firstName} ${customer.lastName}`;
                    document.getElementById('customerEmail').textContent = customer.email || '';
                    document.getElementById('customerPhone').textContent = customer.phone || '';
                    document.getElementById('customerBalance').textContent = customer.classBalance ?? 0;

                    customerInfo.style.display = 'block';
                    classSelect.disabled = false;

                    const bal = Number(customer.classBalance ?? 0);
                    if (bal <= 0) {
                        balanceError.style.display = 'block';
                        balanceAlert.style.display = 'none';
                    } else if (bal <= 3) {
                        balanceAlert.style.display = 'block';
                        balanceError.style.display = 'none';
                        document.getElementById('newBalance').textContent = bal - 1;
                    } else {
                        balanceAlert.style.display = 'none';
                        balanceError.style.display = 'none';
                    }
                    updateCheckinButton();
                }
            })
            .catch(err => {
                console.error('Failed to load customer details', err);
            });
    } else {
        customerInfo.style.display = 'none';
        classSelect.disabled = true;
        classSelect.value = '';
        balanceAlert.style.display = 'none';
        balanceError.style.display = 'none';
        updateCheckinButton();
    }
}

// Handle class selection
function onClassSelect() {
    updateCheckinButton();
}

// Update check-in button state
function updateCheckinButton() {
    const customerSelect = document.getElementById('customerSelect');
    const classSelect = document.getElementById('classSelect');
    const checkinBtn = document.getElementById('checkinBtn');
    const balanceError = document.getElementById('balanceError');
    
    const customerSelected = customerSelect.value !== '';
    const classSelected = classSelect.value !== '';
    const hasBalance = balanceError.style.display === 'none';
    
    checkinBtn.disabled = !(customerSelected && classSelected && hasBalance);
}

// Perform check-in
async function performCheckin() {
    const customerSelect = document.getElementById('customerSelect');
    const classSelect = document.getElementById('classSelect');
    
    const checkinData = {
        customerId: customerSelect.value, // expects custom customerId like Y001
        classId: classSelect.value        // expects custom classId like A001
    };
    
    try {
        const response = await fetch('/api/attendance/checkin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(checkinData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Check-in successful!', 'success');
            
            // Reset form
            customerSelect.value = '';
            classSelect.value = '';
            document.getElementById('customerInfo').style.display = 'none';
            classSelect.disabled = true;
            document.getElementById('balanceAlert').style.display = 'none';
            document.getElementById('balanceError').style.display = 'none';
            updateCheckinButton();
            
            // Refresh data
            loadCustomers();
            loadAttendanceHistory();
            loadAttendanceStats();
        } else {
            showMessage(result.message || 'Check-in failed', 'error');
        }
    } catch (error) {
        console.error('Error during check-in:', error);
        showMessage('Error during check-in', 'error');
    }
}

// Load attendance history
async function loadAttendanceHistory() {
    try {
        const response = await fetch('/api/attendance/getAttendanceRecords');
        attendanceRecords = await response.json();
        
        displayAttendanceHistory();
    } catch (error) {
        console.error('Error loading attendance history:', error);
        document.getElementById('attendanceHistory').innerHTML = '<p>Error loading attendance records</p>';
    }
}

// Display attendance history
function displayAttendanceHistory(filteredRecords = null) {
    const historyContainer = document.getElementById('attendanceHistory');
    const records = filteredRecords || attendanceRecords;
    
    if (records.length === 0) {
        historyContainer.innerHTML = '<p>No attendance records found</p>';
        return;
    }
    
    const recordsHtml = records.map(record => {
        const statusClass = record.status === 'cancelled' ? 'cancelled' : 'checked-in';
        const statusText = record.status === 'cancelled' ? 'CANCELLED' : 'CHECKED IN';
        const dateText = record.datetime || '';
        
        return `
            <div class="attendance-record ${statusClass}">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                    <div style="flex: 1;">
                        <strong>${record.customerName || record.customerId}</strong>
                        <br>
                        Class: ${record.className || record.classId}
                        <br>
                        Instructor: ${record.instructorName || 'TBD'}
                        <br>
                        Date: ${dateText}
                        <br>
                        <span style="color: ${record.status === 'cancelled' ? '#dc3545' : '#28a745'}; font-weight: bold;">
                            ${statusText}
                        </span>
                    </div>
                    ${record.status !== 'cancelled' ? `
                        <div>
                            <button onclick="cancelCheckin(${record.checkinId})" class="btn-danger" style="padding: 5px 10px; font-size: 0.9em;">
                                Cancel Check-in
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    historyContainer.innerHTML = recordsHtml;
}

// Filter attendance history by customer
function filterAttendanceHistory() {
    const historyCustomerSelect = document.getElementById('historyCustomerSelect');
    const customerId = historyCustomerSelect.value;
    
    if (customerId) {
        const filteredRecords = attendanceRecords.filter(record => (record.customerId === customerId) || (record.customer && record.customer._id === customerId));
        displayAttendanceHistory(filteredRecords);
    } else {
        displayAttendanceHistory();
    }
}

// Cancel check-in
async function cancelCheckin(checkinId) {
    if (!confirm('Are you sure you want to cancel this check-in? This will restore the customer\'s class balance.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/attendance/cancelCheckin`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkinId })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Check-in cancelled successfully', 'success');
            loadCustomers();
            loadAttendanceHistory();
            loadAttendanceStats();
        } else {
            showMessage(result.message || 'Error cancelling check-in', 'error');
        }
    } catch (error) {
        console.error('Error cancelling check-in:', error);
        showMessage('Error cancelling check-in', 'error');
    }
}

// Load attendance statistics
async function loadAttendanceStats() {
    try {
        const response = await fetch('/api/attendance/getStats');
        const stats = await response.json();
        
        displayAttendanceStats(stats);
    } catch (error) {
        console.error('Error loading attendance stats:', error);
        document.getElementById('attendanceStats').innerHTML = '<p>Error loading statistics</p>';
    }
}

// Display attendance statistics
function displayAttendanceStats(stats) {
    const statsContainer = document.getElementById('attendanceStats');
    
    const statsHtml = `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-number">${stats.totalCheckins}</span>
                <div>Total Check-ins</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.totalCancellations}</span>
                <div>Total Cancellations</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.totalNoShows}</span>
                <div>No-shows</div>
            </div>
            ${Array.isArray(stats.popularClasses) ? `
            <div class="stat-card" style="grid-column: span 2;">
                <div style="font-weight:600; margin-bottom:8px;">Top Classes</div>
                ${stats.popularClasses.map(pc => `<div>${pc.className || pc.classId}: <strong>${pc.attendanceCount}</strong></div>`).join('')}
            </div>` : ''}
        </div>
    `;
    
    statsContainer.innerHTML = statsHtml;
}

// Refresh all data
function refreshData() {
    showMessage('Refreshing data...', 'info');
    loadCustomers();
    loadClasses();
    loadAttendanceHistory();
    loadAttendanceStats();
}

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}