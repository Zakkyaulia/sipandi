'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        // 1. Fetch Users
        const users = await queryInterface.sequelize.query(
            `SELECT id_user, nip FROM Users;`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        const userMap = {};
        users.forEach(u => userMap[u.nip] = u.id_user);

        // 2. Fetch Roles
        const roles = await queryInterface.sequelize.query(
            `SELECT id, name FROM Roles;`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        const roleMap = {};
        roles.forEach(r => roleMap[r.name] = r.id);

        // 3. Define Assignments Logic
        const userRolesData = [];

        const addRole = (nip, roleName) => {
            if (userMap[nip] && roleMap[roleName]) {
                userRolesData.push({
                    userId: userMap[nip],
                    roleId: roleMap[roleName],
                    createdAt: now,
                    updatedAt: now
                });
            }
        };

        // --- ASSIGNMENTS ---

        // 1. Rafi (Super) - ALL ROLES (000...1)
        if (userMap['000000000000000001']) {
            addRole('000000000000000001', 'admin');
            addRole('000000000000000001', 'asn');
            addRole('000000000000000001', 'admin_atk');
            addRole('000000000000000001', 'admin_validasi_jp');
            addRole('000000000000000001', 'asn2');
        }

        // 2. Dimas (Admin Only) (000...2)
        if (userMap['000000000000000002']) {
            addRole('000000000000000002', 'admin');
        }

        // 3. Zakky (2 Roles: ASN + Admin ATK) (000...3)
        if (userMap['000000000000000003']) {
            addRole('000000000000000003', 'asn');
            addRole('000000000000000003', 'admin_atk');
        }

        // 4. Hasbi (2 Roles: ASN + Admin JP) (000...4)
        if (userMap['000000000000000004']) {
            addRole('000000000000000004', 'asn');
            addRole('000000000000000004', 'admin_validasi_jp');
        }

        // 5. Aufa (2 Roles: ASN2 + Admin ATK) (000...5)
        if (userMap['000000000000000005']) {
            addRole('000000000000000005', 'asn2');
            addRole('000000000000000005', 'admin_atk');
        }

        // 6. Davyd (2 Roles: ASN2 + Admin JP) (000...6)
        if (userMap['000000000000000006']) {
            addRole('000000000000000006', 'asn2');
            addRole('000000000000000006', 'admin_validasi_jp');
        }

        // 7. Ardra (2 Roles: ASN + ASN2 - Unique scenario) (000...7)
        if (userMap['000000000000000007']) {
            addRole('000000000000000007', 'asn');
            addRole('000000000000000007', 'asn2');
        }

        // Clean existing UserRoles
        try {
            await queryInterface.bulkDelete('UserRoles', null, {});
        } catch (e) {
            console.log("UserRoles table might be empty.");
        }

        // Bulk Insert
        if (userRolesData.length > 0) {
            await queryInterface.bulkInsert('UserRoles', userRolesData, {});
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('UserRoles', null, {});
    }
};
