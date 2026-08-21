// dues.js – Simplified Expense Tracker (only expenses, no advances)
let expenses = [];

// Helper: Get today's date in YYYY-MM-DD format
function todayStr() {
    return new Date().toISOString().split('T')[0];
}

// Load from localStorage
function loadExpenses() {
    const stored = localStorage.getItem('dairycare_expenses');
    if (stored) {
        try { expenses = JSON.parse(stored); } catch (e) { expenses = []; }
    } else { expenses = []; }
}

// Save to localStorage
function saveExpenses() {
    localStorage.setItem('dairycare_expenses', JSON.stringify(expenses));
}

// Render filtered expenses
function renderExpenses() {
    const start = document.getElementById('filterStart').value;
    const end = document.getElementById('filterEnd').value;
    let filtered = expenses.filter(e => {
        if (start && e.date < start) return false;
        if (end && e.date > end) return false;
        return true;
    });
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    const tbody = document.getElementById('expenseBody');
    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">ਕੋਈ ਖਰਚਾ ਨਹੀਂ</td></tr>';
        document.getElementById('totalExpense').innerText = '₹0.00';
        return;
    }
    let html = '';
    filtered.forEach(exp => {
        html += `<tr>
            <td>${exp.date}</td>
            <td>${exp.item || '-'}</td>
            <td>₹${exp.amount.toFixed(2)}</td>
            <td>${exp.note || '-'}</td>
            <td><button class="btn-edit" data-id="${exp.id}">✏️</button> <button class="btn-delete" data-id="${exp.id}">🗑️</button></td>
        </tr>`;
    });
    tbody.innerHTML = html;
    document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', editExpense));
    document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', deleteExpense));

    // update total expense
    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('totalExpense').innerText = '₹' + total.toFixed(2);
}

// Add or Update expense (with proper validation and ID handling)
function addExpense() {
    const date = document.getElementById('expenseDate').value;
    const amountInput = document.getElementById('expenseAmount').value;
    const itemInput = document.getElementById('expenseItem').value.trim();
    const note = document.getElementById('expenseNote').value.trim();

    // Mandatory Validation
    if (!date) {
        alert('ਤਾਰੀਖ਼ ਚੁਣੋ');
        return;
    }
    if (amountInput === '' || isNaN(amountInput) || parseFloat(amountInput) <= 0) {
        alert('ਰਕਮ ਸਹੀ ਭਰੋ (0 ਤੋਂ ਵੱਧ)');
        return;
    }
    if (!itemInput) {
        alert('ਸਮਾਨ / ਕੰਮ ਦਾ ਨਾਮ ਭਰੋ');
        return;
    }

    const amount = parseFloat(amountInput);
    // ✅ ID ਬਣਾਉਣ ਸਮੇਂ String ਵੀ ਵਰਤ ਸਕਦੇ ਹੋ, ਪਰ ਹੁਣ ਅਸੀਂ ਹੇਠਾਂ ਤੁਲਨਾ String ਨਾਲ ਕਰਾਂਗੇ
    const entry = { id: editMode ? editId : Date.now() + Math.random(), date, amount, item: itemInput, note };

    if (editMode) {
        // ✅ ID ਨੂੰ String ਵਿੱਚ ਬਦਲ ਕੇ ਤੁਲਨਾ ਕਰੋ (strict equality ਲਈ ਸੁਰੱਖਿਅਤ)
        expenses = expenses.map(x => String(x.id) === String(editId) ? entry : x);
        editMode = false;
        editId = null;
        document.getElementById('saveExpenseBtn').innerText = '➕ ਖਰਚਾ ਸੇਵ ਕਰੋ';
    } else {
        expenses.push(entry);
    }

    saveExpenses();
    renderExpenses();

    // Clear amount, item, note only (date stays as is)
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseItem').value = '';
    document.getElementById('expenseNote').value = '';
}

let editMode = false;
let editId = null;

function editExpense(e) {
    const id = e.currentTarget.getAttribute('data-id'); // String
    // ✅ String ਵਿੱਚ ਤੁਲਨਾ ਕਰੋ
    const exp = expenses.find(x => String(x.id) === String(id));
    if (!exp) return;

    editMode = true;
    editId = exp.id; // Save the original (number/string) as is

    document.getElementById('expenseDate').value = exp.date;
    document.getElementById('expenseAmount').value = exp.amount;
    document.getElementById('expenseItem').value = exp.item;
    document.getElementById('expenseNote').value = exp.note || '';

    document.getElementById('saveExpenseBtn').innerText = '✏️ ਅੱਪਡੇਟ ਕਰੋ';
}

function deleteExpense(e) {
    if (!confirm('ਕੀ ਇਹ ਖਰਚਾ ਮਿਟਾਉਣਾ ਹੈ?')) return;
    const id = e.currentTarget.getAttribute('data-id'); // String
    // ✅ String ਵਿੱਚ ਫਿਲਟਰ ਕਰੋ
    expenses = expenses.filter(x => String(x.id) !== String(id));
    saveExpenses();
    renderExpenses();
}

function deleteAll() {
    if (confirm('ਸਾਰੇ ਖਰਚੇ ਮਿਟਾਉਣ ਨਾਲ ਡਾਟਾ 0 ਹੋ ਜਾਵੇਗਾ। ਪੱਕਾ ਹੈ?')) {
        expenses = [];
        saveExpenses();
        renderExpenses();
    }
}

function applyFilters() { renderExpenses(); }
function resetFilters() {
    document.getElementById('filterStart').value = '';
    document.getElementById('filterEnd').value = '';
    renderExpenses();
}

// Helper to reset the form completely (used by clear button)
function resetForm() {
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseItem').value = '';
    document.getElementById('expenseNote').value = '';
    editMode = false;
    editId = null;
    document.getElementById('saveExpenseBtn').innerText = '➕ ਖਰਚਾ ਸੇਵ ਕਰੋ';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('expenseDate').value = todayStr();
    loadExpenses();
    renderExpenses();
    document.getElementById('applyFilterBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilters);
    document.getElementById('saveExpenseBtn').addEventListener('click', addExpense);
    document.getElementById('clearExpenseFormBtn').addEventListener('click', resetForm);
    document.getElementById('deleteAllBtn').addEventListener('click', deleteAll);
});
