// Global variables
let allBarangs = [];
let currentBarangId = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBarangs();
});

// Load all barangs from API
async function loadBarangs() {
    try {
        const response = await fetch('/admin/inventory/list');
        const data = await response.json();

        if (data.success) {
            allBarangs = data.barangs;
            renderBarangs(allBarangs);
        } else {
            showError('Gagal memuat data barang');
        }
    } catch (error) {
        console.error('Error loading barangs:', error);
        showError('Terjadi kesalahan saat memuat data');
    }
}

// Render barangs to table
function renderBarangs(barangs) {
    const tbody = document.getElementById('barangTableBody');

    if (barangs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="text-lg font-semibold">Tidak ada data barang</p>
                    <p class="text-sm">Silakan tambah barang baru</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = barangs.map(barang => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-900">${barang.nama_barang}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-900">${barang.quantity}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">${barang.satuan}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${getStatusBadge(barang.status_stok)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">${formatDate(barang.updatedAt)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="viewDetail(${barang.id})" 
                        class="text-blue-600 hover:text-blue-800 transition-colors p-1.5 hover:bg-blue-50 rounded-lg"
                        title="Lihat Detail">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </button>
                    <button onclick="openEditModal(${barang.id})" 
                        class="text-yellow-600 hover:text-yellow-800 transition-colors p-1.5 hover:bg-yellow-50 rounded-lg"
                        title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteBarang(${barang.id})" 
                        class="text-red-600 hover:text-red-800 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                        title="Hapus">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'Tersedia': '<span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">Tersedia</span>',
        'Stok Sedikit': '<span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800">Stok Sedikit</span>',
        'Perbarui Stok': '<span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">Perbarui Stok</span>'
    };
    return badges[status] || '<span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-800">-</span>';
}

// Format date to Indonesian format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

// Search and filter barangs
function searchBarang() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    let filtered = allBarangs;

    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(b =>
            b.nama_barang.toLowerCase().includes(searchTerm)
        );
    }

    // Filter by status
    if (statusFilter !== 'all') {
        const statusMap = {
            'tersedia': 'Tersedia',
            'stok_sedikit': 'Stok Sedikit',
            'perbarui_stok': 'Perbarui Stok'
        };
        filtered = filtered.filter(b => b.status_stok === statusMap[statusFilter]);
    }

    renderBarangs(filtered);
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    renderBarangs(allBarangs);
}

// Open add modal
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Tambah Barang Baru';
    document.getElementById('barangForm').reset();
    document.getElementById('editBarangId').value = '';

    showModal();
}

// Open edit modal
function openEditModal(id) {
    const barang = allBarangs.find(b => b.id === id);
    if (!barang) return;

    document.getElementById('modalTitle').textContent = 'Edit Data Barang';
    document.getElementById('editBarangId').value = barang.id;
    document.getElementById('formNamaBarang').value = barang.nama_barang;
    document.getElementById('formQuantity').value = barang.quantity;
    document.getElementById('formSatuan').value = barang.satuan;
    document.getElementById('formThresholdHabis').value = barang.threshold_stok_habis;
    document.getElementById('formThresholdSedikit').value = barang.threshold_stok_sedikit;
    document.getElementById('formKeterangan').value = barang.keterangan;

    showModal();
}

// Show modal
function showModal() {
    const modal = document.getElementById('formModal');
    const modalContent = modal.querySelector('div');

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95', 'opacity-0', 'translate-y-4');
    }, 10);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('formModal');
    const modalContent = modal.querySelector('div');

    modal.classList.add('opacity-0');
    modalContent.classList.add('scale-95', 'opacity-0', 'translate-y-4');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Handle form submit
async function handleSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('editBarangId').value;
    const formData = {
        nama_barang: document.getElementById('formNamaBarang').value,
        quantity: document.getElementById('formQuantity').value,
        satuan: document.getElementById('formSatuan').value || 'pcs',
        threshold_stok_habis: document.getElementById('formThresholdHabis').value,
        threshold_stok_sedikit: document.getElementById('formThresholdSedikit').value,
        keterangan: document.getElementById('formKeterangan').value
    };

    // Validate thresholds
    if (parseInt(formData.threshold_stok_habis) >= parseInt(formData.threshold_stok_sedikit)) {
        showError('Threshold stok habis harus lebih kecil dari threshold stok sedikit');
        return;
    }

    try {
        const url = id ? `/admin/inventory/${id}` : '/admin/inventory/create';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showSuccess(data.message);
            closeModal();
            loadBarangs();
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showError('Terjadi kesalahan saat menyimpan data');
    }
}

// View detail
function viewDetail(id) {
    const barang = allBarangs.find(b => b.id === id);
    if (!barang) return;

    currentBarangId = id;

    document.getElementById('detailNamaBarang').textContent = barang.nama_barang;
    document.getElementById('detailQuantity').textContent = barang.quantity;
    document.getElementById('detailSatuan').textContent = barang.satuan;
    document.getElementById('detailThresholdHabis').textContent = barang.threshold_stok_habis;
    document.getElementById('detailThresholdSedikit').textContent = barang.threshold_stok_sedikit;
    document.getElementById('detailKeterangan').textContent = barang.keterangan || '-';
    document.getElementById('detailCreatedAt').textContent = formatDate(barang.createdAt);
    document.getElementById('detailUpdatedAt').textContent = formatDate(barang.updatedAt);

    showDetailModal();
}

// Show detail modal
function showDetailModal() {
    const modal = document.getElementById('detailModal');
    const modalContent = modal.querySelector('div');

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95', 'opacity-0', 'translate-y-4');
    }, 10);
}

// Close detail modal
function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    const modalContent = modal.querySelector('div');

    modal.classList.add('opacity-0');
    modalContent.classList.add('scale-95', 'opacity-0', 'translate-y-4');

    setTimeout(() => {
        modal.classList.add('hidden');
        currentBarangId = null;
    }, 300);
}

// Delete barang
async function deleteBarang(id) {
    const barang = allBarangs.find(b => b.id === id);
    if (!barang) return;

    const result = await Swal.fire({
        title: 'Hapus Barang?',
        html: `Apakah Anda yakin ingin menghapus barang <strong>${barang.nama_barang}</strong>?<br><span class="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan.</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
            popup: 'rounded-2xl font-sans',
            title: 'text-lg font-bold text-gray-800',
            htmlContainer: 'text-gray-600',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors mx-1',
            cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium transition-colors mx-1'
        }
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/admin/inventory/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                showSuccess(data.message);
                loadBarangs();
            } else {
                showError(data.message);
            }
        } catch (error) {
            console.error('Error deleting barang:', error);
            showError('Terjadi kesalahan saat menghapus barang');
        }
    }
}

// Show success message
function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: message,
        timer: 2000,
        showConfirmButton: false,
        buttonsStyling: false,
        customClass: {
            popup: 'rounded-2xl font-sans'
        }
    });
}

// Show error message
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
        buttonsStyling: false,
        customClass: {
            popup: 'rounded-2xl font-sans',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors'
        }
    });
}
