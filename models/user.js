'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many Pengajuan (as submitter)
      User.hasMany(models.Pengajuan, {
        foreignKey: 'id_user',
        as: 'pengajuans'
      });

      // User has many Pengajuan (as processor/admin)
      User.hasMany(models.Pengajuan, {
        foreignKey: 'diproses_oleh',
        as: 'processed_pengajuans'
      });
    }
  }

  User.init({
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nip: {
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'asn', 'admin_atk', 'admin_validasi_jp', 'asn2'),
      defaultValue: 'asn'
    },
    unit_kerja: {
      type: DataTypes.ENUM('Tata Laksana', 'Kelembagaan', 'RBAK'),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users'
  });

  return User;
};
