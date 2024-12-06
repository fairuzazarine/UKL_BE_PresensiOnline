'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class presensi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
    }
  }
  presensi.init({
    id_presensi: DataTypes.STRING,
    id_user: DataTypes.STRING,
    date: DataTypes.DATE,
    time: DataTypes.TIME,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'presensi',
  });
  return presensi;
};