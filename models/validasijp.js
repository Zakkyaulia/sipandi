'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ValidasiJp extends Model {
    static associate(models) {
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
    jumlah_jp: DataTypes.INTEGER,
    catatan: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('pending', 'diterima', 'ditolak'),
      defaultValue: 'pending'
    },
    // KOLOM BARU
    file_sertif: DataTypes.STRING,
    bulan: DataTypes.STRING,
    tahun: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ValidasiJp',
  });
  return ValidasiJp;
};