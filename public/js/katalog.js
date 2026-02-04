// Global variables
let allBarangs = [];
let cart = [];
let currentBarangId = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadKatalog();
});

// Load katalog from API
async function loadKatalog() {
    try {
        const response = await fetch('/user/katalog/list');
        const data = await response.json();

        if (data.success) {
            allBarangs = data.barangs;
            renderKatalog(allBarangs);
        } else {
            showError('Gagal memuat katalog');
        }
    } catch (error) {
        console.error('Error loading katalog:', error);
        showError('Terjadi kesalahan saat memuat katalog');
    }
}

// Render katalog grid
function renderKatalog(barangs) {
    const grid = document.getElementById('katalogGrid');

    if (barangs.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p class="text-lg font-semibold text-gray-500">Tidak ada barang tersedia</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = barangs.map(barang => `
        <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
            <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-800 flex-1">${barang.nama_barang}</h3>
                    ${getStatusBadge(barang.status_stok)}
                </div>

                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Stok:</span>
                        <span class="font-bold text-gray-800">${barang.quantity} ${barang.satuan}</span>
                    </div>
                    ${barang.keterangan !== '-' ? `
                    <div class="text-xs text-gray-500 italic">
                        ${barang.keterangan}
                    </div>
                    ` : ''}
                </div>

                <button 
                    onclick="openAjukanModal(${barang.id})" 
                    ${!barang.tersedia ? 'disabled' : ''}
                    class="w-full ${barang.tersedia ? 'bg-gradient-to-r from-sipandi-green-600 to-emerald-600 hover:from-sipandi-green-700 hover:to-emerald-700' : 'bg-gray-300 cursor-not-allowed'} text-white py-3 rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    ${barang.tersedia ? 'Ajukan Barang' : 'Stok Habis'}
                </button>
            </div>
        </div>
    `).join('');
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        'Tersedia': '<span class="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">Tersedia</span>',
        'Stok Sedikit': '<span class="px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">Stok Sedikit</span>',
        'Perbarui Stok': '<span class="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">Perbarui Stok</span>'
    };
    return badges[status] || '';
}

// Search barang
function searchBarang() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let filtered = allBarangs;

    if (searchTerm) {
        filtered = filtered.filter(b =>
            b.nama_barang.toLowerCase().includes(searchTerm)
        );
    }

    renderKatalog(filtered);
}

// Open ajukan modal
function openAjukanModal(id) {
    const barang = allBarangs.find(b => b.id === id);
    if (!barang) return;

    currentBarangId = id;
    document.getElementById('modalNamaBarang').textContent = barang.nama_barang;
    document.getElementById('modalStok').textContent = barang.quantity;
    document.getElementById('modalSatuan').textContent = barang.satuan;
    document.getElementById('modalJumlah').value = 1;
    document.getElementById('modalJumlah').max = barang.quantity;

    showModal('ajukanModal');
}

// Close ajukan modal
function closeAjukanModal() {
    hideModal('ajukanModal');
    currentBarangId = null;
}

// Add to cart
function addToCart() {
    const jumlah = parseInt(document.getElementById('modalJumlah').value);
    const barang = allBarangs.find(b => b.id === currentBarangId);

    if (!barang) return;

    if (jumlah <= 0) {
        showError('Jumlah harus lebih dari 0');
        return;
    }

    if (jumlah > barang.quantity) {
        showError('Jumlah melebihi stok tersedia');
        return;
    }

    // Check if item already in cart
    const existingIndex = cart.findIndex(item => item.id_barang === currentBarangId);
    if (existingIndex >= 0) {
        cart[existingIndex].jumlah_diminta = jumlah;
        showSuccess('Jumlah barang diperbarui di keranjang');
    } else {
        cart.push({
            id_barang: currentBarangId,
            nama_barang: barang.nama_barang,
            satuan: barang.satuan,
            jumlah_diminta: jumlah
        });
        showSuccess('Barang ditambahkan ke keranjang');
    }

    updateCartSummary();
    closeAjukanModal();
}

// Update cart summary
function updateCartSummary() {
    const cartSummary = document.getElementById('cartSummary');
    const cartCount = document.getElementById('cartCount');

    if (cart.length > 0) {
        cartSummary.classList.remove('hidden');
        cartCount.textContent = cart.length;
    } else {
        cartSummary.classList.add('hidden');
    }
}

// View cart
function viewCart() {
    if (cart.length === 0) {
        showError('Keranjang kosong');
        return;
    }

    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex-1">
                <p class="font-bold text-gray-800">${item.nama_barang}</p>
                <p class="text-sm text-gray-600">${item.jumlah_diminta} ${item.satuan}</p>
            </div>
            <button onclick="removeFromCart(${index})" class="text-red-600 hover:text-red-800 p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>
    `).join('');

    showModal('cartModal');
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartSummary();
    viewCart();
    if (cart.length === 0) {
        closeCartModal();
    }
}

// Clear cart
function clearCart() {
    Swal.fire({
        title: 'Kosongkan Keranjang?',
        text: 'Semua barang akan dihapus dari keranjang',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kosongkan',
        cancelButtonText: 'Batal',
        buttonsStyling: false,
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium mx-1',
            cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium mx-1'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            cart = [];
            updateCartSummary();
            showSuccess('Keranjang dikosongkan');
        }
    });
}

// Close cart modal
function closeCartModal() {
    hideModal('cartModal');
}

// Submit pengajuan
async function submitPengajuan() {
    if (cart.length === 0) {
        showError('Keranjang kosong');
        return;
    }

    const catatan = document.getElementById('catatanPengajuan').value;

    try {
        const response = await fetch('/user/pengajuan/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                catatan_user: catatan
            })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess(data.message);
            cart = [];
            updateCartSummary();
            closeCartModal();
            document.getElementById('catatanPengajuan').value = '';

            // Redirect to riwayat after 1.5 seconds
            setTimeout(() => {
                window.location.href = '/user/riwayat-pengajuan';
            }, 1500);
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Error submitting pengajuan:', error);
        showError('Terjadi kesalahan saat mengajukan barang');
    }
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
