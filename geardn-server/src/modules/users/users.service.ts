import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { UsersRepository } from './user.repository';
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAllUsers() {
    return this.usersRepository.findAll();
  }
}
