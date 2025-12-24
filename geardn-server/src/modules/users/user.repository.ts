import { Inject } from '@nestjs/common';
import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class UsersRepository {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly connection: Pool,
  ) {}

  async findAll() {
    const [rows] = await this.connection.query<RowDataPacket[]>(
      'SELECT id, email, full_name, created_at FROM users',
    );
    return rows;
  }

  async findByEmail(email: string) {
    const [rows] = await this.connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );
    return rows[0];
  }

  async findById(id: number) {
    const [rows] = await this.connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id],
    );
    return rows[0];
  }

  async create(email: string, fullName: string, passwordHash: string) {
    const [result] = await this.connection.query<ResultSetHeader>(
      'INSERT INTO users (email, full_name, password) VALUES (?, ?, ?)',
      [email, fullName, passwordHash],
    );
    return result.insertId;
  }
}
