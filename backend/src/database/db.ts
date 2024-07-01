import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD as string,
  {
    host: '127.0.0.1',
    dialect: 'postgres',
    port: parseInt(process.env.DB_PORT as string, 10),
    logging: false, // Disable logging (optional)
  }
);

export default sequelize;
