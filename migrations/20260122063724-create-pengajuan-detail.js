'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PengajuanDetails', {
      id_pengajuan: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Pengajuans',
          key: 'id_pengajuan'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_barang: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Barangs',
          key: 'id_barang'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      jumlah: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('PengajuanDetails');
  }
};
