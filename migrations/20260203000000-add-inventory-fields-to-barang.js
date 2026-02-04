'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Barangs', 'satuan', {
            type: Sequelize.STRING(50),
            allowNull: true,
            defaultValue: 'pcs',
            comment: 'Unit barang (pcs, box, rim, dll)'
        });

        await queryInterface.addColumn('Barangs', 'kategori', {
            type: Sequelize.STRING(100),
            allowNull: true,
            comment: 'Kategori/jenis barang'
        });

        await queryInterface.addColumn('Barangs', 'keterangan', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Deskripsi detail barang'
        });

        await queryInterface.addColumn('Barangs', 'threshold_stok_sedikit', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 10,
            comment: 'Batas stok untuk status Stok Sedikit'
        });

        await queryInterface.addColumn('Barangs', 'threshold_stok_habis', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 5,
            comment: 'Batas stok untuk status Stok Habis'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Barangs', 'satuan');
        await queryInterface.removeColumn('Barangs', 'kategori');
        await queryInterface.removeColumn('Barangs', 'keterangan');
        await queryInterface.removeColumn('Barangs', 'threshold_stok_sedikit');
        await queryInterface.removeColumn('Barangs', 'threshold_stok_habis');
    }
};
