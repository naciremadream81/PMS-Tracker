const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

const createDemoUser = async () => {
  try {
    console.log('Creating demo user...');

    // Check if demo user already exists
    const existingUser = await User.findOne({ where: { email: 'demo@example.com' } });
    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('demo123', 12);

    // Create demo user
    const demoUser = await User.create({
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      password: hashedPassword,
      phone: '(555) 123-4567',
      company: 'Demo Construction Co.',
      role: 'user',
      isActive: true
    });

    console.log('Demo user created successfully:', {
      id: demoUser.id,
      email: demoUser.email,
      name: `${demoUser.firstName} ${demoUser.lastName}`
    });

  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await sequelize.close();
  }
};

createDemoUser();
