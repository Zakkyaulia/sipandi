'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('PengajuanItems', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            id_pengajuan: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Pengajuans',
                    key: 'id_pengajuan'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            id_barang: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Barangs',
                    key: 'id_barang'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            jumlah_diminta: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            jumlah_disetujui: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('PengajuanItems');
    }
};
