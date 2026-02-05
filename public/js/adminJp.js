// Admin JP Management
let allSubmissions = [];
let currentSubmission = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadJp();
});

// Load JP submissions from API
async function loadJp() {
    try {
        const search = document.getElementById('searchInput').value;
        const status = document.getElementById('statusFilter').value;
        const bidang = document.getElementById('bidangFilter').value;
        const bulan = document.getElementById('bulanFilter').value;
        const tahun = document.getElementById('tahunFilter').value;

        const response = await fetch(`/admin/jp/list?search=${encodeURIComponent(search)}&status=${status}&bidang=${encodeURIComponent(bidang)}&bulan=${bulan}&tahun=${tahun}`);
        const data = await response.json();

        if (data.success) {
            allSubmissions = data.submissions;
            renderJpList(allSubmissions);
        } else {
            showError('Gagal memuat data JP');
        }
    } catch (error) {
        console.error('Error loading JP:', error);
        showError('Terjadi kesalahan saat memuat data');
    }
}

// Render JP list
function renderJpList(submissions) {
    const tableBody = document.getElementById('jpTableBody');
    const emptyState = document.getElementById('emptyState');

    if (submissions.length === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tableBody.innerHTML = submissions.map((s, index) => {
        const statusBadge = getStatusBadge(s.status);
        const tanggal = formatDate(s.createdAt);
        const bulanTahun = `${s.bulan} ${s.tahun}`;

        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${tanggal}</td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="font-semibold">${s.user.nama}</div>
                    <div class="text-xs text-gray-500">${s.user.nip}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                    <div class="max-w-xs truncate">${s.user.unit_kerja}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                    <div class="max-w-xs">${s.nama_sertif}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-full bg-sipandi-green-100 text-sipandi-green-700 font-bold">
                        ${s.jumlah_jp}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">${bulanTahun}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <button onclick="viewDetail(${s.id})" 
                        class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sipandi-green-600 to-emerald-600 hover:from-sipandi-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        ${s.status === 'pending' ? 'Proses' : 'Detail'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Pending</span>',
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

// Search JP
function searchJp() {
    loadJp();
}

// View detail
function viewDetail(id) {
    const submission = allSubmissions.find(s => s.id === id);
    if (!submission) return;

    currentSubmission = submission;

    // Populate user info
    document.getElementById('detailNama').textContent = submission.user.nama;
    document.getElementById('detailNIP').textContent = submission.user.nip;
    document.getElementById('detailBidang').textContent = submission.user.unit_kerja;
    document.getElementById('detailTanggal').textContent = formatDate(submission.createdAt);

    // Populate JP info
    document.getElementById('detailNamaSertif').textContent = submission.nama_sertif;
    document.getElementById('detailJumlahJp').textContent = submission.jumlah_jp + ' JP';
    document.getElementById('detailBulanTahun').textContent = `${submission.bulan} ${submission.tahun}`;
    document.getElementById('detailStatus').innerHTML = getStatusBadge(submission.status);

    // Catatan User
    if (submission.catatan) {
        document.getElementById('detailCatatanDiv').classList.remove('hidden');
        document.getElementById('detailCatatan').textContent = submission.catatan;
    } else {
        document.getElementById('detailCatatanDiv').classList.add('hidden');
    }

    // File Sertifikat
    if (submission.file_sertif) {
        document.getElementById('detailFileDiv').classList.remove('hidden');
        document.getElementById('detailFileLink').href = submission.file_sertif;
    } else {
        document.getElementById('detailFileDiv').classList.add('hidden');
    }

    // Show action form or close button based on status
    if (submission.status === 'pending') {
        document.getElementById('actionForm').classList.remove('hidden');
        document.getElementById('closeButton').classList.add('hidden');
    } else {
        document.getElementById('actionForm').classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
    }

    showModal('detailModal');
}

// Approve JP
async function approveJp() {
    if (!currentSubmission) return;

    const catatan = document.getElementById('catatanAdmin').value.trim();

    // Confirm
    const result = await Swal.fire({
        title: 'Setujui Submit JP?',
        text: 'JP akan disetujui dan user akan menerima notifikasi',
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
        const response = await fetch(`/admin/jp/approve/${currentSubmission.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ catatan_admin: catatan || null })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess(data.message);
            closeDetailModal();
            loadJp();
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Error approving JP:', error);
        showError('Terjadi kesalahan saat menyetujui JP');
    }
}

// Reject JP
async function rejectJp() {
    if (!currentSubmission) return;

    const catatan = document.getElementById('catatanAdmin').value.trim();

    if (!catatan) {
        showError('Harap berikan catatan alasan penolakan');
        return;
    }

    // Confirm
    const result = await Swal.fire({
        title: 'Tolak Submit JP?',
        text: 'JP akan ditolak dan user akan menerima notifikasi',
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
        const response = await fetch(`/admin/jp/reject/${currentSubmission.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ catatan_admin: catatan })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess(data.message);
            closeDetailModal();
            loadJp();
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Error rejecting JP:', error);
        showError('Terjadi kesalahan saat menolak JP');
    }
}

// Close detail modal
function closeDetailModal() {
    hideModal('detailModal');
    currentSubmission = null;
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
