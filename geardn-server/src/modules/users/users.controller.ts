import { Body, Controller, Post, Res, HttpStatus, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';

@Controller('users') // Đường dẫn gốc là /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; full_name: string; password: string },
  ) {
    return this.usersService.registerUser(
      body.email,
      body.full_name,
      body.password,
    );
  }

  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
