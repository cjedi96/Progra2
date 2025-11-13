const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./db');
const { seedAdminUser, seedAdminPass, seedAdminRole } = require('./config');

(async () => {
  try {
    await sequelize.sync({ alter: true });

    // Seed 10 generic users: user01..user10 / pass1234
    const genericUsers = Array.from({ length: 10 }).map((_, i) => {
      const n = (i + 1).toString().padStart(2, '0');
      return { username: `user${n}`, password: 'pass1234', role: 'user' };
    });

    for (const gu of genericUsers) {
      const exists = await User.findOne({ where: { username: gu.username } });
      if (!exists) {
        const passwordHash = await bcrypt.hash(gu.password, 10);
        await User.create({ username: gu.username, passwordHash, role: gu.role });
        console.log('Seeded user:', gu.username);
      }
    }

    // Optional admin
    if (seedAdminUser && seedAdminPass) {
      const exists = await User.findOne({ where: { username: seedAdminUser } });
      if (!exists) {
        const passwordHash = await bcrypt.hash(seedAdminPass, 10);
        await User.create({ username: seedAdminUser, passwordHash, role: seedAdminRole || 'admin' });
        console.log('Seeded admin user:', seedAdminUser);
      } else {
        console.log('Admin already exists, skipping seed');
      }
    } else {
      console.log('No seed admin configured. Set SEED_ADMIN_USER and SEED_ADMIN_PASS to seed an admin.');
    }

    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error('Migration error:', e);
    process.exit(1);
  }
})();
