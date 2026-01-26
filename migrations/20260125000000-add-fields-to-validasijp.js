'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ValidasiJps', 'file_sertif', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('ValidasiJps', 'bulan', {
      type: Sequelize.STRING, // Akan menyimpan "Januari", "Februari", dst.
      allowNull: true
    });
    await queryInterface.addColumn('ValidasiJps', 'tahun', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ValidasiJps', 'file_sertif');
    await queryInterface.removeColumn('ValidasiJps', 'bulan');
    await queryInterface.removeColumn('ValidasiJps', 'tahun');
  }
};