// Admin Pengajuan Management
let allPengajuans = [];
let currentPengajuan = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPengajuan();
});

// Load pengajuan from API
async function loadPengajuan() {
    try {
        const search = document.getElementById('searchInput').value;
        const status = document.getElementById('statusFilter').value;
        const bidang = document.getElementById('bidangFilter').value;

        const response = await fetch(`/admin/pengajuan/list?search=${encodeURIComponent(search)}&status=${status}&bidang=${encodeURIComponent(bidang)}`);
        const data = await response.json();

        if (data.success) {
            allPengajuans = data.pengajuans;
            renderPengajuanList(allPengajuans);
        } else {
            showError('Gagal memuat data pengajuan');
        }
    } catch (error) {
        console.error('Error loading pengajuan:', error);
        showError('Terjadi kesalahan saat memuat data');
    }
}

// Render pengajuan list
function renderPengajuanList(pengajuans) {
    const tableBody = document.getElementById('pengajuanTableBody');
    const emptyState = document.getElementById('emptyState');

    if (pengajuans.length === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tableBody.innerHTML = pengajuans.map((p, index) => {
        const statusBadge = getStatusBadge(p.status);
        const tanggal = formatDate(p.tanggal_pengajuan);
        const itemsPreview = p.items.slice(0, 2).map(item => item.nama_barang).join(', ');
        const moreItems = p.items.length > 2 ? ` +${p.items.length - 2}` : '';

        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${tanggal}</td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="font-semibold">${p.user.nama}</div>
                    <div class="text-xs text-gray-500">${p.user.nip}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                    <div class="max-w-xs truncate">${p.user.unit_kerja}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                    <div class="max-w-xs">${itemsPreview}${moreItems}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sipandi-green-100 text-sipandi-green-700 font-bold">
                        ${p.total_items}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <button onclick="viewDetail(${p.id})" 
                        class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sipandi-green-600 to-emerald-600 hover:from-sipandi-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        ${p.status === 'diajukan' ? 'Proses' : 'Detail'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        'diajukan': '<span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Diajukan</span>',
        'disetujui': '<span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Disetujui</span>',
        'ditolak': '<span class="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Ditolak</span>'
    };
    return badges[status] || '';
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Format datetime
function formatDateTime(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Search pengajuan
function searchPengajuan() {
    loadPengajuan();
}

// View detail
function viewDetail(id) {
    const pengajuan = allPengajuans.find(p => p.id === id);
    if (!pengajuan) return;

    currentPengajuan = pengajuan;

    // Populate user info
    document.getElementById('detailNama').textContent = pengajuan.user.nama;
    document.getElementById('detailNIP').textContent = pengajuan.user.nip;
    document.getElementById('detailBidang').textContent = pengajuan.user.unit_kerja;
    document.getElementById('detailTanggal').textContent = formatDate(pengajuan.tanggal_pengajuan);
    document.getElementById('detailStatus').innerHTML = getStatusBadge(pengajuan.status);

    // Items
    const itemsContainer = document.getElementById('detailItems');
    itemsContainer.innerHTML = pengajuan.items.map(item => {
        const disetujuiText = item.jumlah_disetujui !== null
            ? `<span class="text-green-600 font-bold">${item.jumlah_disetujui} ${item.satuan} disetujui</span>`
            : '';

        return `
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="font-bold text-gray-800">${item.nama_barang}</p>
                        <div class="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>Diminta: ${item.jumlah_diminta} ${item.satuan}</span>
                            <span>Stok: ${item.stok_tersedia} ${item.satuan}</span>
                        </div>
                        ${disetujuiText ? `<p class="text-sm mt-1">${disetujuiText}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Catatan User
    if (pengajuan.catatan_user) {
        document.getElementById('detailCatatanUser').classList.remove('hidden');
        document.getElementById('detailCatatanUserText').textContent = pengajuan.catatan_user;
    } else {
        document.getElementById('detailCatatanUser').classList.add('hidden');
    }

    // Catatan Admin
    if (pengajuan.catatan_admin) {
        document.getElementById('detailCatatanAdmin').classList.remove('hidden');
        document.getElementById('detailCatatanAdminText').textContent = pengajuan.catatan_admin;
    } else {
        document.getElementById('detailCatatanAdmin').classList.add('hidden');
    }

    // Show action form or close button based on status
    if (pengajuan.status === 'diajukan') {
        document.getElementById('actionForm').classList.remove('hidden');
        document.getElementById('closeButton').classList.add('hidden');
        renderApprovalItems(pengajuan.items);
    } else {
        document.getElementById('actionForm').classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
    }

    showModal('detailModal');
}

// Render approval items with input
function renderApprovalItems(items) {
    const container = document.getElementById('approvalItems');

    container.innerHTML = items.map(item => `
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="flex justify-between items-center mb-2">
                <div class="flex-1">
                    <p class="font-bold text-gray-800">${item.nama_barang}</p>
                    <p class="text-sm text-gray-600">Diminta: ${item.jumlah_diminta} ${item.satuan} | Stok: ${item.stok_tersedia} ${item.satuan}</p>
                </div>
            </div>
            <div>
                <label class="text-xs font-bold text-gray-500 uppercase">Jumlah Disetujui <span class="text-red-500">*</span></label>
                <input type="number" 
                    id="approve_${item.id}" 
                    min="0" 
                    max="${Math.min(item.jumlah_diminta, item.stok_tersedia)}" 
                    value="${Math.min(item.jumlah_diminta, item.stok_tersedia)}"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-sipandi-green-500 focus:border-transparent transition-all outline-none">
                <p class="text-xs text-gray-500 mt-1">Maksimal: ${Math.min(item.jumlah_diminta, item.stok_tersedia)} ${item.satuan}</p>
            </div>
        </div>
    `).join('');
}

// Approve pengajuan
async function approvePengajuan() {
    if (!currentPengajuan) return;

    // Collect approval data
    const items = currentPengajuan.items.map(item => {
        const input = document.getElementById(`approve_${item.id}`);
        const jumlahDisetujui = parseInt(input.value);

        if (isNaN(jumlahDisetujui) || jumlahDisetujui < 0) {
            throw new Error(`Jumlah disetujui untuk ${item.nama_barang} tidak valid`);
        }

        if (jumlahDisetujui > item.jumlah_diminta) {
            throw new Error(`Jumlah disetujui untuk ${item.nama_barang} melebihi jumlah diminta`);
        }

        if (jumlahDisetujui > item.stok_tersedia) {
            throw new Error(`Jumlah disetujui untuk ${item.nama_barang} melebihi stok tersedia`);
        }

        return {
            id: item.id,
            jumlah_disetujui: jumlahDisetujui
        };
    });

    const catatan = document.getElementById('catatanAdmin').value.trim();

    // Confirm
    const result = await Swal.fire({
        title: 'Setujui Pengajuan?',
        text: 'Stok barang akan dikurangi sesuai jumlah yang disetujui',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#dc2626',
        confirmButtonText: 'Ya, Setujui',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'bg-sipandi-green-600 hover:bg-sipandi-green-700 text-white px-5 py-2.5 rounded-lg font-medium mx-1',
            cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium mx-1'
        }
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`/admin/pengajuan/approve/${currentPengajuan.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, catatan_admin: catatan || null })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess(data.message);
            closeDetailModal();
            loadPengajuan();
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Error approving pengajuan:', error);
        showError('Terjadi kesalahan saat menyetujui pengajuan');
    }
}

// Reject pengajuan
async function rejectPengajuan() {
    if (!currentPengajuan) return;

    const catatan = document.getElementById('catatanAdmin').value.trim();

    if (!catatan) {
        showError('Harap berikan catatan alasan penolakan');
        return;
    }

    // Confirm
    const result = await Swal.fire({
        title: 'Tolak Pengajuan?',
        text: 'Pengajuan akan ditolak dan user akan menerima notifikasi',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Tolak',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium mx-1',
            cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium mx-1'
        }
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`/admin/pengajuan/reject/${currentPengajuan.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ catatan_admin: catatan })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess(data.message);
            closeDetailModal();
            loadPengajuan();
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Error rejecting pengajuan:', error);
        showError('Terjadi kesalahan saat menolak pengajuan');
    }
}

// Close detail modal
function closeDetailModal() {
    hideModal('detailModal');
    currentPengajuan = null;
    document.getElementById('catatanAdmin').value = '';
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('div');

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95', 'opacity-0', 'translate-y-4');
    }, 10);
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('div');

    modal.classList.add('opacity-0');
    modalContent.classList.add('scale-95', 'opacity-0', 'translate-y-4');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
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
            popup: 'rounded-2xl'
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
            popup: 'rounded-2xl',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium'
        }
    });
}
