'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ValidasiJps', 'file_sertif', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('ValidasiJps', 'tanggal_mulai', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
    await queryInterface.addColumn('ValidasiJps', 'tanggal_selesai', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ValidasiJps', 'file_sertif');
    await queryInterface.removeColumn('ValidasiJps', 'tanggal_mulai');
    await queryInterface.removeColumn('ValidasiJps', 'tanggal_selesai');
  }
};