const { sequelize } = require('./models');

async function syncDatabase() {
  try {
    console.log('🔄 Starting database synchronization...');
    
    // Force sync to ensure all tables are created
    await sequelize.sync({ force: true });
    
    console.log('✅ Database synchronized successfully!');
    console.log('�� All tables have been created.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

syncDatabase();
