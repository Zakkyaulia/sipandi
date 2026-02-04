'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status column to Pengajuans table
    await queryInterface.addColumn('Pengajuans', 'status', {
      type: Sequelize.ENUM('diajukan', 'disetujui', 'ditolak'),
      allowNull: false,
      defaultValue: 'diajukan',
      after: 'tanggal_pengajuan'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove status column from Pengajuans table
    await queryInterface.removeColumn('Pengajuans', 'status');
  }
};
