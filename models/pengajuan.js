'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pengajuan extends Model {
    static associate(models) {
      // Pengajuan belongs to User (submitter)
      Pengajuan.belongsTo(models.User, {
        foreignKey: 'id_user',
        as: 'user'
      });

      // Pengajuan belongs to User (processor/admin)
      Pengajuan.belongsTo(models.User, {
        foreignKey: 'diproses_oleh',
        as: 'admin'
      });

      // Pengajuan has many PengajuanItems
      Pengajuan.hasMany(models.PengajuanItem, {
        foreignKey: 'id_pengajuan',
        as: 'items'
      });
    }
  }

  Pengajuan.init({
    id_pengajuan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tanggal_pengajuan: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status_pengajuan: {
      type: DataTypes.ENUM('diajukan', 'disetujui', 'ditolak'),
      allowNull: false,
      defaultValue: 'diajukan'
    },
    catatan_user: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    catatan_admin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tanggal_diproses: {
      type: DataTypes.DATE,
      allowNull: true
    },
    diproses_oleh: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Pengajuan',
    tableName: 'Pengajuans',
    timestamps: true
  });

  return Pengajuan;
};