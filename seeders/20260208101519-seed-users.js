'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync('123456', 10);
    const now = new Date();

    // 1. Insert Users (Only Users, No Roles here)
    // NIP format: 00000000000000000X (18 digits)
    const usersData = [
      {
        nama: 'Rafi Super',
        nip: '000000000000000001',
        password: passwordHash,
        email: 'rafi@sipandi.com',
        unit_kerja: 'Tata Laksana',
        createdAt: now,
        updatedAt: now
      },
      {
        nama: 'Dimas Admin',
        nip: '000000000000000002',
        password: passwordHash,
        email: 'dimas@sipandi.com',
        unit_kerja: 'Kelembagaan',
        createdAt: now,
        updatedAt: now
      },
      {
        nama: 'Zakky ASN',
        nip: '000000000000000003',
        password: passwordHash,
        email: 'zakky@sipandi.com',
        unit_kerja: 'RBAK',
        createdAt: now,
        updatedAt: now
      },
      {
        nama: 'Hasbi ATK',
        nip: '000000000000000004',
        password: passwordHash,
        email: 'hasbi@sipandi.com',
        unit_kerja: 'Tata Laksana',
        createdAt: now,
        updatedAt: now
      },
      {
        nama: 'Aufa JP',
        nip: '000000000000000005',
        password: passwordHash,
        email: 'aufa@sipandi.com',
        unit_kerja: 'Kelembagaan',
        createdAt: now,
        updatedAt: now
      },
      {
        nama: 'Davyd Pensiun',
        nip: '000000000000000006',
        password: passwordHash,
        email: 'davyd@sipandi.com',
        unit_kerja: 'RBAK',
        createdAt: now,
        updatedAt: now
      },
      {
        nama: 'Ardra Multi',
        nip: '000000000000000007',
        password: passwordHash,
        email: 'ardra@sipandi.com',
        unit_kerja: 'Tata Laksana',
        createdAt: now,
        updatedAt: now
      },
    ];

    // Clean existing users first
    try {
      await queryInterface.bulkDelete('Users', null, {});
    } catch (e) {
      console.log("Users table might be empty or not exist yet.");
    }

    await queryInterface.bulkInsert('Users', usersData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
