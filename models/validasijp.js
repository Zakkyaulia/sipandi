'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ValidasiJp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ValidasiJp.init({
    id_validasiJp: DataTypes.INTEGER,
    id_user: DataTypes.INTEGER,
    nama_sertif: DataTypes.STRING,
    jumlah_jp: DataTypes.INTEGER,
    catatan: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('pending', 'diterima', 'ditolak'),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'ValidasiJp',
  });
  return ValidasiJp;
};