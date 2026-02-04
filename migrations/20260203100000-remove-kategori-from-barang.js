'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Barangs', 'kategori');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('Barangs', 'kategori', {
            type: Sequelize.STRING(100),
            allowNull: true,
            comment: 'Kategori/jenis barang'
        });
    }
};
