'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add catatan_user column
    await queryInterface.addColumn('Pengajuans', 'catatan_user', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add catatan_admin column
    await queryInterface.addColumn('Pengajuans', 'catatan_admin', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add tanggal_diproses column
    await queryInterface.addColumn('Pengajuans', 'tanggal_diproses', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add diproses_oleh column
    await queryInterface.addColumn('Pengajuans', 'diproses_oleh', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id_user'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns in reverse order
    await queryInterface.removeColumn('Pengajuans', 'diproses_oleh');
    await queryInterface.removeColumn('Pengajuans', 'tanggal_diproses');
    await queryInterface.removeColumn('Pengajuans', 'catatan_admin');
    await queryInterface.removeColumn('Pengajuans', 'catatan_user');
  }
};
