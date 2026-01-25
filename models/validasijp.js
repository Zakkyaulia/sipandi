'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ValidasiJp extends Model {
    static associate(models) {
      // Define association here if needed
      ValidasiJp.belongsTo(models.User, { foreignKey: 'id_user' });
    }
  }
  ValidasiJp.init({
    id_validasiJp: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user: DataTypes.INTEGER,
    nama_sertif: DataTypes.STRING,
    jumlah_jp: DataTypes.INTEGER, // Di Kabad ini 'JP'
    catatan: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('pending', 'diterima', 'ditolak'),
      defaultValue: 'pending'
    },
    // Tambahan dari Kabad
    file_sertif: DataTypes.STRING,
    tanggal_mulai: DataTypes.DATEONLY,
    tanggal_selesai: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'ValidasiJp',
  });
  return ValidasiJp;
};