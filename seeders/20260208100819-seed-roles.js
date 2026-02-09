'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
    await queryInterface.bulkInsert('Roles', [
      {
        name: 'admin',
        display_name: 'Administrator',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'asn',
        display_name: 'Aparatur Sipil Negara (ASN)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'admin_atk',
        display_name: 'Admin ATK',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'admin_validasi_jp',
        display_name: 'Admin Validasi JP',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'asn2',
        display_name: 'Aparatur Sipil Negara (ASN) 2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
