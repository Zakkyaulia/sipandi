'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Barangs', [
            {
                nama_barang: 'Kertas HVS A4 80 gram',
                quantity: 50,
                satuan: 'rim',
                keterangan: 'Kertas HVS ukuran A4 dengan gramatur 80 gram, isi 500 lembar per rim',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Pulpen Standard Hitam',
                quantity: 8,
                satuan: 'pcs',
                keterangan: 'Pulpen tinta hitam standard untuk keperluan kantor',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Spidol Whiteboard',
                quantity: 3,
                satuan: 'pcs',
                keterangan: 'Spidol untuk papan tulis whiteboard, berbagai warna',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Stapler Besar',
                quantity: 25,
                satuan: 'pcs',
                keterangan: 'Stapler ukuran besar untuk menjilid dokumen tebal',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Amplop Coklat Folio',
                quantity: 100,
                satuan: 'box',
                keterangan: 'Amplop coklat ukuran folio, isi 100 pcs per box',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Tinta Printer Canon Black',
                quantity: 12,
                satuan: 'pcs',
                keterangan: 'Tinta printer Canon warna hitam original',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Map Plastik',
                quantity: 150,
                satuan: 'pcs',
                keterangan: 'Map plastik untuk menyimpan dokumen',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nama_barang: 'Correction Tape',
                quantity: 18,
                satuan: 'pcs',
                keterangan: 'Correction tape untuk mengoreksi tulisan',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Barangs', null, {});
    }
};
