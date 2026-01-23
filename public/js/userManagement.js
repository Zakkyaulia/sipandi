// Global variables
let currentDeleteId = null;
let currentResetId = null;

// Load users on page load
document.addEventListener('DOMContentLoaded', function () {
    loadUsers();
});

// Load users from API
async function loadUsers() {
    const search = document.getElementById('searchInput').value;
    const role = document.getElementById('roleFilter').value;
    const status = document.getElementById('statusFilter').value;

    try {
        const response = await fetch(`/admin/users/list?search=${search}&role=${role}&status=${status}`);
        const data = await response.json();

        if (data.success) {
            displayUsers(data.users);
        } else {
            showToast('Error loading users', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error loading users', 'error');
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">Tidak ada data user</td></tr>';
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.name}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.username}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
          ${user.role.toUpperCase()}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          ${user.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button onclick="openEditModal(${user.id})" class="text-blue-600 hover:text-blue-900">Edit</button>
        <button onclick="openResetModal(${user.id}, '${user.name}')" class="text-orange-600 hover:text-orange-900">Reset</button>
        <button onclick="openDeleteModal(${user.id}, '${user.name}')" class="text-red-600 hover:text-red-900">Hapus</button>
      </td>
    `;
        tbody.appendChild(row);
    });
}

// Search users
function searchUsers() {
    loadUsers();
}

// Add User Modal
function openAddModal() {
    document.getElementById('addModal').classList.remove('hidden');
    document.getElementById('addUserForm').reset();
}

function closeAddModal() {
    document.getElementById('addModal').classList.add('hidden');
}

async function addUser(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/admin/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showToast('User berhasil ditambahkan', 'success');
            closeAddModal();
            loadUsers();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error menambahkan user', 'error');
    }
}

// Edit User Modal
async function openEditModal(userId) {
    try {
        const response = await fetch(`/admin/users/list`);
        const data = await response.json();
        const user = data.users.find(u => u.id === userId);

        if (user) {
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editName').value = user.name;
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editRole').value = user.role;
            document.getElementById('editStatus').value = user.status;
            document.getElementById('editModal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error loading user data', 'error');
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

async function updateUser(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const userId = data.id;
    delete data.id;

    try {
        const response = await fetch(`/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showToast('User berhasil diupdate', 'success');
            closeEditModal();
            loadUsers();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error mengupdate user', 'error');
    }
}

// Delete User Modal
function openDeleteModal(userId, userName) {
    currentDeleteId = userId;
    document.getElementById('deleteUserName').textContent = userName;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    currentDeleteId = null;
}

async function confirmDelete() {
    if (!currentDeleteId) return;

    try {
        const response = await fetch(`/admin/users/${currentDeleteId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showToast('User berhasil dihapus', 'success');
            closeDeleteModal();
            loadUsers();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error menghapus user', 'error');
    }
}

// Reset Password Modal
function openResetModal(userId, userName) {
    currentResetId = userId;
    document.getElementById('resetUserId').value = userId;
    document.getElementById('resetUserName').textContent = userName;
    document.getElementById('resetPasswordForm').reset();
    document.getElementById('newPasswordDisplay').classList.add('hidden');
    document.getElementById('resetModal').classList.remove('hidden');
}

function closeResetModal() {
    document.getElementById('resetModal').classList.add('hidden');
    currentResetId = null;
}

async function resetPassword(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const userId = formData.get('id');
    const password = formData.get('password');

    try {
        const response = await fetch(`/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (result.success) {
            showToast('Password berhasil direset', 'success');
            document.getElementById('newPasswordText').textContent = result.newPassword;
            document.getElementById('newPasswordDisplay').classList.remove('hidden');
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error mereset password', 'error');
    }
}

// Generate Password Functions
async function generatePasswordAdd() {
    try {
        const response = await fetch('/admin/users/generate-password', {
            method: 'POST'
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('addPassword').value = result.password;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function generatePasswordReset() {
    try {
        const response = await fetch('/admin/users/generate-password', {
            method: 'POST'
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('resetPassword').value = result.password;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Copy password to clipboard
function copyPassword() {
    const password = document.getElementById('newPasswordText').textContent;
    navigator.clipboard.writeText(password).then(() => {
        showToast('Password berhasil dicopy', 'success');
    });
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
