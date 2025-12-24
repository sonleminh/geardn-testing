import { ConfigService } from '@nestjs/config';
import { createPool } from 'mysql2/promise';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION', // Tên token để inject sau này
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
      console.log('------- DEBUG CONNECTION -------');
      console.log('User:', config.get<string>('DB_USER', 'root'));
      console.log('Pass:', config.get<string>('DB_PASS', 'root'));
      console.log('--------------------------------');
      const pool = createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      return pool;
    },
  },
];
