module.exports = (sequelize, DataTypes) => {
  const County = sequelize.define('County', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100]
      }
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        len: [2, 2]
      }
    },
    stateFull: {
      type: DataTypes.STRING,
      allowNull: false
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
    contactEmail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    processingTime: {
      type: DataTypes.INTEGER, // in days
      defaultValue: 30
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'America/New_York'
    }
  });

  return County;
};
