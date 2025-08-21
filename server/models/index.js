const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://localhost:5432/permit_manager',
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Import models
const User = require('./User')(sequelize, Sequelize);
const County = require('./County')(sequelize, Sequelize);
const Checklist = require('./Checklist')(sequelize, Sequelize);
const Permit = require('./Permit')(sequelize, Sequelize);
const PermitFile = require('./PermitFile')(sequelize, Sequelize);
const PermitChecklist = require('./PermitChecklist')(sequelize, Sequelize);

// Define associations
User.hasMany(Permit, { foreignKey: 'userId', as: 'permits' });
Permit.belongsTo(User, { foreignKey: 'userId', as: 'user' });

County.hasMany(Checklist, { foreignKey: 'countyId', as: 'checklists' });
Checklist.belongsTo(County, { foreignKey: 'countyId', as: 'county' });

County.hasMany(Permit, { foreignKey: 'countyId', as: 'permits' });
Permit.belongsTo(County, { foreignKey: 'countyId', as: 'county' });

Permit.hasMany(PermitFile, { foreignKey: 'permitId', as: 'files' });
PermitFile.belongsTo(Permit, { foreignKey: 'permitId', as: 'permit' });

Permit.belongsToMany(Checklist, { 
  through: PermitChecklist, 
  foreignKey: 'permitId',
  otherKey: 'checklistId',
  as: 'checklists'
});
Checklist.belongsToMany(Permit, { 
  through: PermitChecklist, 
  foreignKey: 'checklistId',
  otherKey: 'permitId',
  as: 'permits'
});

module.exports = {
  sequelize,
  User,
  County,
  Checklist,
  Permit,
  PermitFile,
  PermitChecklist
};
