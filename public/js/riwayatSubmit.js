// Riwayat Submit Management
let allSubmissions = [];
let currentSubmission = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSubmissions();
});

// Load submissions from API
async function loadSubmissions() {
    try {
        const search = document.getElementById('searchInput').value;
        const status = document.getElementById('statusFilter').value;

        const response = await fetch(`/riwayat-submit/list?search=${encodeURIComponent(search)}&status=${status}`);
        const data = await response.json();

        if (data.success) {
            allSubmissions = data.submissions;
            renderSubmissionsList(allSubmissions);
        } else {
            showError('Gagal memuat data riwayat');
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
        showError('Terjadi kesalahan saat memuat data');
    }
}

// Render submissions list
function renderSubmissionsList(submissions) {
    const tableBody = document.getElementById('submissionsTableBody');
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
                    <div class="font-semibold">${s.nama_sertif}</div>
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
                        Detail
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
        'diterima': '<span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Diterima</span>',
        'ditolak': '<span class="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Ditolak</span>'
    };
    return badges[status] || '';
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Search submissions
function searchSubmissions() {
    loadSubmissions();
}

// View detail
function viewDetail(id) {
    const submission = allSubmissions.find(s => s.id === id);
    if (!submission) return;

    currentSubmission = submission;

    // Populate detail
    document.getElementById('detailNamaSertif').textContent = submission.nama_sertif;
    document.getElementById('detailJumlahJp').textContent = submission.jumlah_jp + ' JP';
    document.getElementById('detailBulanTahun').textContent = `${submission.bulan} ${submission.tahun}`;
    document.getElementById('detailTanggal').textContent = formatDate(submission.createdAt);
    document.getElementById('detailStatus').innerHTML = getStatusBadge(submission.status);

    // Catatan
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

    showModal('detailModal');
}

// Close detail modal
function closeDetailModal() {
    hideModal('detailModal');
    currentSubmission = null;
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
