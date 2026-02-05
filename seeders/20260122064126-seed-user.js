'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);

    await queryInterface.bulkInsert('Users', [
      {
        nama: 'Administrator Utama',
        nip: 'admin', // Tetap string pendek untuk admin utama
        password: password,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Budi ASN Dummy',
        nip: '111111111111111111', // 18 Karakter
        password: password,
        role: 'asn',
        unit_kerja: 'Tata Laksana',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Andi Admin ATK',
        nip: '222222222222222222', // 18 Karakter
        password: password,
        role: 'admin_atk',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama: 'Siti Admin JP',
        nip: '333333333333333333', // 18 Karakter
        password: password,
        role: 'admin_validasi_jp',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};