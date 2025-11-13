const { Sequelize, DataTypes } = require('sequelize');
const { dbStorage, nodeEnv } = require('./config');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbStorage,
  logging: nodeEnv === 'development' ? console.log : false,
});

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' }
}, { tableName: 'users', timestamps: true });

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING(80), allowNull: false },
  lastName: { type: DataTypes.STRING(80), allowNull: false },
  carnet: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: 'students', timestamps: true });

module.exports = { sequelize, User, Student };
