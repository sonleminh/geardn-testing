import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}
  async signUp(email: string, fullName: string, password: string) {
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

  async login(user: ILoginResponse, res: Response) {
    try {
      const { access_token, refresh_token } = await this.generaTokens({
        id: user.id,
        role: user.role,
      });

      this.storeToken(res, 'access_token', access_token, 2);
      this.storeToken(res, 'refresh_token', refresh_token, 48);
      return user;
    } catch (error) {
      throw error;
    }
  }
}
