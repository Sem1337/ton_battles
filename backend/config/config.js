import dotenv from 'dotenv';

dotenv.config();

export default {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'testdb',
    host: process.env.DB_HOST || 'test',
    dialect: 'postgres',
    port: 6432,
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(path.resolve(__dirname, '/root/.postgresql/root.crt')).toString(),
      },
    },
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'testdb',
    host: process.env.DB_HOST || 'test',
    dialect: 'postgres',
    port: 6432,
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(path.resolve(__dirname, '/root/.postgresql/root.crt')).toString(),
      },
    },
  },
  production: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'testdb',
    host: process.env.DB_HOST || 'test',
    dialect: 'postgres',
    port: 6432,
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(path.resolve(__dirname, '/root/.postgresql/root.crt')).toString(),
      },
    },
  }
};