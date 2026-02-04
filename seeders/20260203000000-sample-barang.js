'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Barangs', [
            {
                nama_barang: 'Kertas HVS A4 80 gram',
                quantity: 50,
                satuan: 'rim',
                keterangan: 'Kertas HVS ukuran A4 dengan gramatur 80 gram, isi 500 lembar per rim',
                threshold_stok_sedikit: 15,
                threshold_stok_habis: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Pulpen Standard Hitam',
                quantity: 8,
                satuan: 'pcs',
                keterangan: 'Pulpen tinta hitam standard untuk keperluan kantor',
                threshold_stok_sedikit: 20,
                threshold_stok_habis: 10,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Spidol Whiteboard',
                quantity: 3,
                satuan: 'pcs',
                keterangan: 'Spidol untuk papan tulis whiteboard, berbagai warna',
                threshold_stok_sedikit: 10,
                threshold_stok_habis: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Stapler Besar',
                quantity: 25,
                satuan: 'pcs',
                keterangan: 'Stapler ukuran besar untuk menjilid dokumen tebal',
                threshold_stok_sedikit: 8,
                threshold_stok_habis: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Amplop Coklat Folio',
                quantity: 100,
                satuan: 'box',
                keterangan: 'Amplop coklat ukuran folio, isi 100 pcs per box',
                threshold_stok_sedikit: 20,
                threshold_stok_habis: 10,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Tinta Printer Canon Black',
                quantity: 12,
                satuan: 'pcs',
                keterangan: 'Tinta printer Canon warna hitam original',
                threshold_stok_sedikit: 10,
                threshold_stok_habis: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Map Plastik',
                quantity: 150,
                satuan: 'pcs',
                keterangan: 'Map plastik untuk menyimpan dokumen',
                threshold_stok_sedikit: 50,
                threshold_stok_habis: 20,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Correction Tape',
                quantity: 18,
                satuan: 'pcs',
                keterangan: 'Correction tape untuk mengoreksi tulisan',
                threshold_stok_sedikit: 15,
                threshold_stok_habis: 8,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Barangs', null, {});
    }
};
