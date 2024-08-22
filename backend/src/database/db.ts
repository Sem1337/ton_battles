import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);


const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 6432,
    logging: false, // Disable logging (optional)
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync('/root/.postgresql/root.crt').toString(),
      },
    },
    pool: {
      max: 100,  // 200 * CPU - max_connections,  (200 * CPU - 50) conn_max for db user,  ((200 * CPU - 100) / nodesCount)  current value
      min: 0,
      acquire: 45000,
      idle: 10000,
    },
  }
);

export default sequelize;
