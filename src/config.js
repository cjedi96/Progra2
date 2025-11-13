require('dotenv').config();
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  jwtExpires: process.env.JWT_EXPIRES || '1d',
  dbStorage: process.env.DATABASE_STORAGE || './data/db.sqlite',
  seedAdminUser: process.env.SEED_ADMIN_USER,
  seedAdminPass: process.env.SEED_ADMIN_PASS,
  seedAdminRole: process.env.SEED_ADMIN_ROLE || 'admin',
};
