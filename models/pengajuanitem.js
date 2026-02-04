'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PengajuanItem extends Model {
        static associate(models) {
            // PengajuanItem belongs to Pengajuan
            PengajuanItem.belongsTo(models.Pengajuan, {
                foreignKey: 'id_pengajuan',
                as: 'pengajuan'
            });

            // PengajuanItem belongs to Barang
            PengajuanItem.belongsTo(models.Barang, {
                foreignKey: 'id_barang',
                as: 'barang'
            });
        }
    }

    PengajuanItem.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_pengajuan: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_barang: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        jumlah_diminta: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        jumlah_disetujui: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    }, {
        sequelize,
        modelName: 'PengajuanItem',
        tableName: 'PengajuanItems',
        timestamps: true
    });

    return PengajuanItem;
};
