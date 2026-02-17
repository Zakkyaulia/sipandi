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
    const list = document.getElementById('submissionsList');

    if (submissions.length === 0) {
        list.innerHTML = `
            <div class="col-span-full bg-white rounded-xl shadow-md p-12 text-center">
                <svg class="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-500 text-lg font-semibold">Belum ada riwayat submit</p>
                <p class="text-gray-400 text-sm mt-2">Submit JP Anda akan muncul di sini</p>
            </div>
        `;
        return;
    }

    list.innerHTML = submissions.map(s => {
        const statusBadge = getStatusBadge(s.status);
        const tanggal = formatDate(s.createdAt);
        const bulanTahun = `${s.bulan} ${s.tahun}`;

        return `
            <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col">
                <div class="p-6 flex flex-col flex-grow">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h3 class="text-lg font-bold text-gray-800 mb-2">${s.nama_sertif}</h3>
                            <p class="text-sm text-gray-500 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                ${tanggal}
                            </p>
                        </div>
                        ${statusBadge}
                    </div>

                    <div class="mb-4 flex-grow space-y-3">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-xs text-gray-500 mb-1">Jumlah JP</p>
                                    <p class="text-2xl font-black text-sipandi-green-600">${s.jumlah_jp}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 mb-1">Periode</p>
                                    <p class="text-sm font-bold text-gray-800">${bulanTahun}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onclick="viewDetail(${s.id})" 
                        class="w-full mt-auto bg-gradient-to-r from-sipandi-green-600 to-emerald-600 hover:from-sipandi-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        Lihat Detail
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Get status badge
function getStatusBadge(status) {
    // Ubah status ke huruf kecil semua agar cocok dengan key di bawah
    const statusKey = status ? status.toLowerCase() : '';

    const badges = {
        'pending': '<span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Diajukan</span>',
        'disetujui': '<span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Disetujui</span>',
        'ditolak': '<span class="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Ditolak</span>'
    };

    // Kembalikan badge sesuai status, jika tidak ada tampilkan warna abu-abu (default)
    return badges[statusKey] || `<span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">${status || 'Unknown'}</span>`;
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
