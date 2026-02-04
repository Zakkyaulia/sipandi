// Submit JP Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('submitJpForm');
    form.addEventListener('submit', handleSubmit);
});

async function handleSubmit(e) {
    e.preventDefault();

    const namaSertif = document.getElementById('namaSertif').value.trim();
    const jumlahJp = document.getElementById('jumlahJp').value;
    const bulan = document.getElementById('bulan').value;
    const tahun = document.getElementById('tahun').value;
    const fileSertif = document.getElementById('fileSertif').files[0];
    const catatan = document.getElementById('catatan').value.trim();

    // Validation
    if (!namaSertif || !jumlahJp || !bulan || !tahun || !fileSertif) {
        showError('Semua field wajib diisi');
        return;
    }

    if (parseInt(jumlahJp) <= 0) {
        showError('Jumlah JP harus lebih dari 0');
        return;
    }

    // File size validation (5MB)
    if (fileSertif.size > 5 * 1024 * 1024) {
        showError('Ukuran file maksimal 5MB');
        return;
    }

    // File type validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(fileSertif.type)) {
        showError('Format file harus PDF, JPG, atau PNG');
        return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('nama_sertif', namaSertif);
    formData.append('jumlah_jp', jumlahJp);
    formData.append('bulan', bulan);
    formData.append('tahun', tahun);
    formData.append('file_sertif', fileSertif);
    formData.append('catatan', catatan);

    try {
        const response = await fetch('/submit-jp/create', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            await showSuccess(data.message);
            document.getElementById('submitJpForm').reset();

            // Redirect to riwayat after 1.5 seconds
            setTimeout(() => {
                window.location.href = '/riwayat-submit';
            }, 1500);
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Error submitting JP:', error);
        showError('Terjadi kesalahan saat submit JP');
    }
}

// Show success message
function showSuccess(message) {
    return Swal.fire({
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
