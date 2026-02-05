// Riwayat Pengajuan - User
let allPengajuans = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    // Ambil parameter status dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');

    // Jika ada parameter status, set nilai dropdown filter
    if (statusParam) {
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.value = statusParam;
        }
    }

    // Load data (fungsi loadRiwayat biasanya akan membaca value dari dropdown)
    loadRiwayat();
});

// Load riwayat from API
async function loadRiwayat() {
    try {
        const search = document.getElementById('searchInput').value;
        const status = document.getElementById('statusFilter').value;

        const response = await fetch(`/user/riwayat-pengajuan/list?search=${encodeURIComponent(search)}&status=${status}`);
        const data = await response.json();

        if (data.success) {
            allPengajuans = data.pengajuans;
            renderPengajuanList(allPengajuans);
        } else {
            showError('Gagal memuat riwayat pengajuan');
        }
    } catch (error) {
        console.error('Error loading riwayat:', error);
        showError('Terjadi kesalahan saat memuat riwayat');
    }
}

// Render pengajuan list
function renderPengajuanList(pengajuans) {
    const list = document.getElementById('pengajuanList');

    if (pengajuans.length === 0) {
        list.innerHTML = `
            <div class="bg-white rounded-xl shadow-md p-12 text-center">
                <svg class="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-500 text-lg font-semibold">Belum ada riwayat pengajuan</p>
                <p class="text-gray-400 text-sm mt-2">Pengajuan yang Anda buat akan muncul di sini</p>
            </div>
        `;
        return;
    }

    list.innerHTML = pengajuans.map(p => {
        const statusBadge = getStatusBadge(p.status);
        const tanggal = formatDate(p.tanggal_pengajuan);
        const itemsPreview = p.items.slice(0, 3).map(item => item.nama_barang).join(', ');
        const moreItems = p.items.length > 3 ? ` +${p.items.length - 3} lainnya` : '';

        return `
            <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
                <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 class="text-lg font-bold text-gray-800">Pengajuan #${p.id}</h3>
                                ${statusBadge}
                            </div>
                            <p class="text-sm text-gray-500">
                                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                ${tanggal}
                            </p>
                        </div>
                    </div>

                    <div class="mb-4">
                        <p class="text-xs font-bold text-gray-500 uppercase mb-2">Barang yang Diajukan</p>
                        <p class="text-sm text-gray-700">${itemsPreview}${moreItems}</p>
                        <p class="text-xs text-gray-500 mt-1">Total: ${p.items.length} item</p>
                    </div>

                    ${p.catatan_user ? `
                        <div class="mb-4 bg-gray-50 p-3 rounded-lg">
                            <p class="text-xs font-bold text-gray-500 uppercase mb-1">Catatan Anda</p>
                            <p class="text-sm text-gray-700">${p.catatan_user}</p>
                        </div>
                    ` : ''}

                    ${p.catatan_admin ? `
                        <div class="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p class="text-xs font-bold text-blue-700 uppercase mb-1">Catatan Admin</p>
                            <p class="text-sm text-gray-700">${p.catatan_admin}</p>
                        </div>
                    ` : ''}

                    <button onclick="viewDetail(${p.id})" 
                        class="w-full bg-gradient-to-r from-sipandi-green-600 to-emerald-600 hover:from-sipandi-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-bold text-sm shadow-md transition-all">
                        Lihat Detail
                    </button>
                </div>
            </div>
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
    loadRiwayat();
}

// View detail
function viewDetail(id) {
    const pengajuan = allPengajuans.find(p => p.id === id);
    if (!pengajuan) return;

    // Populate modal
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
                        <p class="text-sm text-gray-600">Diminta: ${item.jumlah_diminta} ${item.satuan}</p>
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

    // Tanggal Diproses
    if (pengajuan.tanggal_diproses) {
        document.getElementById('detailTanggalDiproses').classList.remove('hidden');
        document.getElementById('detailTanggalDiprosesText').textContent = formatDateTime(pengajuan.tanggal_diproses);
    } else {
        document.getElementById('detailTanggalDiproses').classList.add('hidden');
    }

    showModal('detailModal');
}

// Close detail modal
function closeDetailModal() {
    hideModal('detailModal');
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
