const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    console.log('Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin@2024!', 12);

    // Create admin user
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@pms-tracker.com',
      password: hashedPassword,
      phone: '(555) 999-0000',
      company: 'PMS Tracker System Admin',
      role: 'admin',
      isActive: true
    });

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      name: `${adminUser.firstName} ${adminUser.lastName}`,
      role: adminUser.role
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await sequelize.close();
  }
};

createAdminUser();
