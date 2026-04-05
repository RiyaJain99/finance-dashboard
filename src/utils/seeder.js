import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Record from '../models/Record.js';
import logger from '../utils/logger.js';

const USERS = [
  { name: 'Admin User', email: 'admin@example.com', password: 'Admin123!', role: 'admin', status: 'active' },
  { name: 'Analyst User', email: 'analyst@example.com', password: 'Analyst123!', role: 'analyst', status: 'active' },
  { name: 'Viewer User', email: 'viewer@example.com', password: 'Viewer123!', role: 'viewer', status: 'active' },
];

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Rental Income', 'Bonus'],
  expense: ['Rent', 'Groceries', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare', 'Dining'],
};

const randomBetween = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);

const generateRecords = (userId, count = 50) => {
  return Array.from({ length: count }, (_, i) => {
    const type = Math.random() > 0.4 ? 'expense' : 'income';
    return {
      amount: type === 'income' ? randomBetween(500, 5000) : randomBetween(10, 800),
      type,
      category: randomItem(CATEGORIES[type]),
      date: daysAgo(Math.floor(Math.random() * 180)),
      notes: `Auto-generated record #${i + 1}`,
      createdBy: userId,
    };
  });
};

const seed = async () => {
  const args = process.argv.slice(2);
  const destroy = args.includes('--destroy');

  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('Connected to database');

  if (destroy) {
    await Promise.all([User.deleteMany(), Record.deleteMany()]);
    logger.info('Cleared all existing data');
  }

  // Pre-hash passwords to bypass Mongoose middleware for bulk speed
  const usersToInsert = await Promise.all(
    USERS.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 12) }))
  );

  const createdUsers = await User.insertMany(usersToInsert);
  logger.info(`Seeded ${createdUsers.length} users`);

  const adminUser = createdUsers.find((u) => u.role === 'admin');
  const analystUser = createdUsers.find((u) => u.role === 'analyst');

  const records = [
    ...generateRecords(adminUser._id, 60),
    ...generateRecords(analystUser._id, 40),
  ];

  await Record.insertMany(records);
  logger.info(`Seeded ${records.length} financial records`);

  logger.info('\n─── Seed Credentials ───────────────────────────');
  USERS.forEach((u) => logger.info(`${u.role.padEnd(10)} │ ${u.email} │ ${u.password}`));
  logger.info('────────────────────────────────────────────────\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  logger.error('Seed failed:', err);
  process.exit(1);
});
