'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ValidasiJps', {
      id_validasiJp: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_user: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id_user'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nama_sertif: {
        type: Sequelize.STRING,
        allowNull: false
      },
      jumlah_jp: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      catatan: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('pending', 'disetujui', 'ditolak'),
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
    await queryInterface.dropTable('ValidasiJps');
  }
};
