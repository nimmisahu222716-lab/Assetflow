const app = require('./app');
const connectDB = require('./config/db');
const seedDatabase = require('./seed/seedData');

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Auto-seed database if empty
  const User = require('./models/User');
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Database empty. Running seed setup...');
    await seedDatabase();
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AssetFlow ERP Backend Server running on http://localhost:${PORT}`);
  });
});
