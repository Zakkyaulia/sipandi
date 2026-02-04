'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Barang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Barang has many PengajuanItems
      Barang.hasMany(models.PengajuanItem, {
        foreignKey: 'id_barang',
        as: 'pengajuan_items'
      });
    }
  }
  Barang.init({
    id_barang: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nama_barang: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    satuan: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'pcs'
    },

    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    threshold_stok_sedikit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    threshold_stok_habis: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    status_stok: {
      type: DataTypes.VIRTUAL,
      get() {
        const qty = this.getDataValue('quantity');
        const thresholdSedikit = this.getDataValue('threshold_stok_sedikit');
        const thresholdHabis = this.getDataValue('threshold_stok_habis');

        if (qty <= thresholdHabis) {
          return 'Perbarui Stok';
        } else if (qty <= thresholdSedikit) {
          return 'Stok Sedikit';
        } else {
          return 'Tersedia';
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Barang',
    tableName: 'Barangs',
    timestamps: true
  });
  return Barang;
};