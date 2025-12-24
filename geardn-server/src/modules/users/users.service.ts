import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { UsersRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

    async createUser(dto: CreateUserDto) {
      const { email, fullName, password } = dto;
      const existingUser = await this.usersRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email da ton tai!');
      }
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const newUserId = await this.usersRepository.create(
        email,
        fullName,
        hashedPassword,
      );
  
      return {
        id: newUserId,
        email,
        fullName,
        message: 'User created successfully',
      };
    }

  async getAllUsers() {
    return this.usersRepository.findAll();
  }

  async findAndVerify(authCredentialsDto: { email: string; password: string }) {
    try {
      const { email, password } = authCredentialsDto;
      const user = await this.usersRepository.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid user or password');
      }
      const compare = await bcrypt.compare(password, user.password);
      if (!compare) {
        throw new UnauthorizedException('Invalid user or password');
      }
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    return this.usersRepository.findById(id);
  }

  async getProfile(user: { id: number }) {
  const userFound = await this.usersRepository.findById(user.id);
  
  if (!userFound) return null;

  // Xóa password khỏi object trước khi trả về
  const { password, ...result } = userFound; 
  return result;
}
}
