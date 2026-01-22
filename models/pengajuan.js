'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pengajuan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Pengajuan.init({
    id_pengajuan: DataTypes.INTEGER,
    id_user: DataTypes.INTEGER,
    tanggal_pengajuan: DataTypes.DATE,
    status_pengajuan: DataTypes.STRING,
    catatan_pengajuan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pengajuan',
  });
  return Pengajuan;
};