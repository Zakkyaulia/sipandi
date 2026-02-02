let isEditMode = false;
let currentDetailUser = null;

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});

async function loadUsers() {
    const search = document.getElementById('searchInput').value;
    const role = document.getElementById('roleFilter').value;
    const container = document.getElementById('userCardContainer');

    try {
        const response = await fetch(`/admin/users/list?search=${search}&role=${role}`);
        const data = await response.json();

        if (data.success) {
            renderCards(data.users);
        }
    } catch (error) {
        showToast('Gagal memuat data', 'error');
    }
}

function renderCards(users) {
    const container = document.getElementById('userCardContainer');
    container.innerHTML = '';

    if (users.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10 font-medium">Tidak ada karyawan ditemukan.</p>`;
        return;
    }

    users.forEach(user => {
        const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

        const card = document.createElement('div');
        card.className = "bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-md hover:shadow-xl transition-all flex flex-col justify-between border border-green-200 hover:border-green-400";

        card.innerHTML = `
            <div class="flex flex-col items-center text-center gap-4">
                <div class="w-20 h-20 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-3xl bg-gradient-to-b from-[#2E7D32] to-[#43A047] shadow-lg">
                    ${initials}
                </div>
                <div class="w-full">
                    <h3 class="font-bold text-lg text-green-800 truncate" title="${user.name}">${user.name}</h3>
                    <p class="text-sm text-gray-600 font-semibold mt-2 uppercase tracking-wide">${user.role.replace(/_/g, ' ').toUpperCase()}</p>
                </div>
            </div>
            <div class="mt-6 pt-6 border-t border-dashed border-green-200 flex justify-center">
                <button onclick="openDetailModal(${JSON.stringify(user).replace(/"/g, '&quot;')})" 
                    class="text-white px-8 py-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5" style="background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    DETAIL
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function searchUsers() {
    loadUsers();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('roleFilter').value = 'all';

    // Add animation to refresh button
    const refreshBtn = document.querySelector('button[onclick="resetFilters()"]');
    if (refreshBtn) {
        const icon = refreshBtn.querySelector('.refresh-icon');
        if (icon) {
            icon.style.animation = 'spin 0.6s linear';
            setTimeout(() => {
                icon.style.animation = 'none';
            }, 600);
        }
    }

    loadUsers();
}

// MODAL LOGIC
// MODAL LOGIC SHARED ANIMATION
function toggleModalAnimation(modalId, show) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('div'); // Inner card

    if (show) {
        modal.classList.remove('hidden');
        void modal.offsetWidth; // Force reflow
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');

        modalContent.classList.remove('scale-95', 'opacity-0', 'translate-y-4');
        modalContent.classList.add('scale-100', 'opacity-100', 'translate-y-0');
    } else {
        modalContent.classList.remove('scale-100', 'opacity-100', 'translate-y-0');
        modalContent.classList.add('scale-95', 'opacity-0', 'translate-y-4');

        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

function openAddModal() {
    isEditMode = false;
    document.getElementById('modalTitle').innerText = "Tambah Karyawan Baru";
    document.getElementById('userForm').reset();
    document.getElementById('editUserId').value = '';
    document.getElementById('passwordField').classList.remove('hidden');

    // Enable Name & NIP for new users
    const nameInput = document.getElementById('formName');
    const usernameInput = document.getElementById('formUsername');

    nameInput.disabled = false;
    usernameInput.disabled = false;

    nameInput.classList.remove('bg-gray-200', 'cursor-not-allowed', 'text-gray-500');
    usernameInput.classList.remove('bg-gray-200', 'cursor-not-allowed', 'text-gray-500');
    nameInput.classList.add('bg-gray-50', 'text-gray-800');
    usernameInput.classList.add('bg-gray-50', 'text-gray-800');

    toggleModalAnimation('formModal', true);
}

function openAddModal() {
    isEditMode = false;
    document.getElementById('modalTitle').innerText = "Tambah Karyawan Baru";
    document.getElementById('userForm').reset();
    document.getElementById('editUserId').value = '';
    document.getElementById('passwordField').classList.remove('hidden');

    // Enable Name & NIP for new users
    const nameInput = document.getElementById('formName');
    const usernameInput = document.getElementById('formUsername');
    const emailInput = document.getElementById('formEmail');

    nameInput.disabled = false;
    usernameInput.disabled = false;
    emailInput.disabled = false;

    nameInput.classList.remove('bg-gray-200', 'cursor-not-allowed', 'text-gray-500');
    usernameInput.classList.remove('bg-gray-200', 'cursor-not-allowed', 'text-gray-500');
    emailInput.classList.remove('bg-gray-200', 'cursor-not-allowed', 'text-gray-500');

    nameInput.classList.add('bg-gray-50', 'text-gray-800');
    usernameInput.classList.add('bg-gray-50', 'text-gray-800');
    emailInput.classList.add('bg-gray-50', 'text-gray-800');

    toggleModalAnimation('formModal', true);
}

// Menyimpan data awal user saat edit mode aktif
let originalUserData = null;

function openEditModal(user) {
    isEditMode = true;
    originalUserData = { ...user }; // Simpan salinan data asli untuk perbandingan

    document.getElementById('modalTitle').innerText = "Edit Data Karyawan";
    document.getElementById('editUserId').value = user.id;
    document.getElementById('formRole').value = user.role;
    document.getElementById('formUnitKerja').value = user.unit_kerja || "";
    document.getElementById('formEmail').value = user.email || "";
    document.getElementById('passwordField').classList.add('hidden');

    // Disable Name, NIP, & Email for editing
    const nameInput = document.getElementById('formName');
    const usernameInput = document.getElementById('formUsername');
    const emailInput = document.getElementById('formEmail');

    nameInput.value = user.name;
    usernameInput.value = user.username;

    nameInput.disabled = true;
    usernameInput.disabled = true;
    emailInput.disabled = true;

    nameInput.classList.remove('bg-gray-50', 'text-gray-800');
    usernameInput.classList.remove('bg-gray-50', 'text-gray-800');
    emailInput.classList.remove('bg-gray-50', 'text-gray-800');

    nameInput.classList.add('bg-gray-200', 'cursor-not-allowed', 'text-gray-500');
    usernameInput.classList.add('bg-gray-200', 'cursor-not-allowed', 'text-gray-500');
    emailInput.classList.add('bg-gray-200', 'cursor-not-allowed', 'text-gray-500');

    toggleModalAnimation('formModal', true);
}

function openDetailModal(user) {
    currentDetailUser = user;
    document.getElementById('detailName').textContent = user.name;
    document.getElementById('detailRole').textContent = user.role.replace(/_/g, ' ').toUpperCase();
    document.getElementById('detailNIP').textContent = user.username;
    document.getElementById('detailUnitKerja').textContent = user.unit_kerja || "-";
    document.getElementById('detailEmail').textContent = user.email || "-";

    toggleModalAnimation('detailModal', true);
}

function closeDetailModal() {
    toggleModalAnimation('detailModal', false);
}

function closeModal() {
    toggleModalAnimation('formModal', false);
}

async function handleSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;

    const newName = document.getElementById('formName').value;
    const newUsername = document.getElementById('formUsername').value;
    const newRole = document.getElementById('formRole').value;
    const newUnitKerja = document.getElementById('formUnitKerja').value;
    const newEmail = document.getElementById('formEmail').value;
    const newPassword = document.getElementById('formPassword').value;

    // VALIDATION: Check for changes (Only in Edit Mode)
    if (isEditMode && originalUserData) {
        const isNameChanged = newName !== originalUserData.name;
        const isUsernameChanged = newUsername !== originalUserData.username;
        const isRoleChanged = newRole !== originalUserData.role;
        const isUnitKerjaChanged = newUnitKerja !== (originalUserData.unit_kerja || "");
        // Email is disabled in edit mode, so no need to check change
        const isPasswordFilled = newPassword && newPassword.trim() !== "";

        if (!isNameChanged && !isUsernameChanged && !isRoleChanged && !isUnitKerjaChanged && !isPasswordFilled) {
            showStatusModal('warning', 'Tidak Ada Perubahan', 'Anda belum melakukan perubahan apapun. Silakan ubah data terlebih dahulu sebelum menyimpan.');
            return;
        }
    }

    const payload = {
        name: newName,
        username: newUsername,
        password: newPassword,
        role: newRole,
        unit_kerja: newUnitKerja,
        email: newEmail
    };

    const url = isEditMode ? `/admin/users/${id}` : '/admin/users/create';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.success) {
            closeModal(); // Tutup form modal
            showStatusModal('success', 'Berhasil!', isEditMode ? 'Data karyawan berhasil diperbarui.' : 'Karyawan baru berhasil ditambahkan.');
            loadUsers(); // Refresh data
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Terjadi kesalahan sistem', 'error');
    }
}

// Toast Notification using SweetAlert2
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

// Styled SweetAlert Mixin for General Messages
const StyledSwal = Swal.mixin({
    customClass: {
        confirmButton: 'bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 px-6 rounded-lg mx-1 shadow-md transition-all',
        cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white text-sm font-bold py-2.5 px-6 rounded-lg mx-1 shadow-md transition-all',
        popup: 'rounded-2xl font-sans',
        title: 'text-xl font-bold text-gray-800',
        htmlContainer: 'text-gray-600'
    },
    buttonsStyling: false
});

// Styled SweetAlert Mixin for Destructive Actions (Delete)
const ConfirmSwal = Swal.mixin({
    customClass: {
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2.5 px-6 rounded-lg mx-1 shadow-md transition-all',
        cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-bold py-2.5 px-6 rounded-lg mx-1 shadow-md transition-all',
        popup: 'rounded-2xl font-sans',
        title: 'text-xl font-bold text-gray-800',
        htmlContainer: 'text-gray-600'
    },
    buttonsStyling: false
});

function showToast(msg, type = 'success') {
    Toast.fire({
        icon: type,
        title: msg
    });
}

// GENERIC STATUS MODAL (Success / Warning)
function showStatusModal(type, title, message) {
    StyledSwal.fire({
        icon: type,
        title: title,
        text: message,
        confirmButtonText: 'Oke'
    });
}

async function deleteUser(id, name) {
    const result = await ConfirmSwal.fire({
        title: 'Hapus Akun?',
        html: `Apakah anda yakin ingin menghapus akun <b>${name}</b>?<br><span class="text-sm text-red-500 mt-2 block">Tindakan ini tidak dapat dibatalkan.</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        reverseButtons: true
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`/admin/users/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                StyledSwal.fire({
                    title: 'Berhasil Dihapus!',
                    text: `Akun ${name} telah berhasil dihapus dari sistem.`,
                    icon: 'success'
                });
                loadUsers();
            } else {
                StyledSwal.fire({
                    title: 'Gagal!',
                    text: data.message || 'Gagal menghapus pengguna.',
                    icon: 'error'
                });
            }
        } catch (error) {
            StyledSwal.fire({
                title: 'Error!',
                text: 'Terjadi kesalahan sistem.',
                icon: 'error'
            });
        }
    }
}

// Helper for confirmation status which was previously separate
function showConfirmationModal(type, title, message, onConfirm) {
    StyledSwal.fire({
        title: title,
        html: message,
        icon: type,
        showCancelButton: true,
        confirmButtonText: 'Ya, Lanjutkan',
        cancelButtonText: 'Batal',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            onConfirm();
        }
    });
}

async function generatePassword() {
    try {
        const res = await fetch('/admin/users/generate-password', { method: 'POST' });
        const data = await res.json();
        if (data.success) document.getElementById('formPassword').value = data.password;
    } catch (e) { }
}

function triggerEditFromDetail() {
    if (currentDetailUser) {
        closeDetailModal();
        setTimeout(() => {
            openEditModal(currentDetailUser);
        }, 300);
    }
}

function deleteUserFromDetail() {
    if (currentDetailUser) {
        closeDetailModal();
        setTimeout(() => {
            deleteUser(currentDetailUser.id, currentDetailUser.name);
        }, 300); // Wait for modal to close
    }
}