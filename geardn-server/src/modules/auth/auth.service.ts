import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Request } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ITokenPayload } from 'src/interfaces/ITokenPayload';
import { IUser } from 'src/interfaces/IUser';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersRepository } from '../users/user.repository';
import { UsersService } from '../users/users.service';
import { Request as expressRequest, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository, private readonly usersService: UsersService,
     private readonly jwtService: JwtService,
     private readonly configService: ConfigService,
  ) {}

storeToken(
    res: Response,
    tokenName: string,
    token: string,
    expiresInHours: number,
  ) {
    const expires = new Date();
    expires.setHours(expires.getHours() + expiresInHours);

    res.cookie(tokenName, token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      expires: expires,
      path: '/',
    });
  }

   async generaTokens(data: ITokenPayload) {
    try {
      const [AT, RT] = await Promise.all([
        this.jwtService.signAsync(data, {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '2h',
        }),
        this.jwtService.signAsync(data, {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '2d',
        }),
      ]);
      return {
        access_token: AT,
        refresh_token: RT,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

   async validateUser(email: string, password: string) {
    const userData = await this.usersService.findAndVerify({
      email,
      password,
    });
    return userData;
  }

  async signUp(dto: CreateUserDto) {
    try {
      return this.usersService.createUser(dto);
    } catch (error) {
      throw error;
    }
  }

  async login(user: IUser, res: Response) {
    try {
      const { access_token, refresh_token } = await this.generaTokens({
        id: user.id
        // role: user.role,
      });

      this.storeToken(res, 'access_token', access_token, 2);
      this.storeToken(res, 'refresh_token', refresh_token, 48);
      return user;
    } catch (error) {
      throw error;
    }
  }

   async refreshToken(@Request() req: expressRequest, res: Response) {
    const tokens = req.headers.cookie;
    if (!tokens) {
      throw new HttpException(
        'Refresh token is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const refreshToken = tokens
      ?.split('; ')
      ?.find((tokens) => tokens.startsWith('refresh_token='))
      ?.split('=')[1];
    // if (!refreshToken) {
    //   throw new HttpException(
    //     'Refresh token has expired or does not exist',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });
      const { id, email, name, role, ...rest } = payload;
      const newAccessToken = await this.jwtService.signAsync(
        { id, email, name, role },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '2h',
        },
      );
      this.storeToken(res, 'access_token', newAccessToken, 2);

      return {
        access_token: newAccessToken,
      };
    } catch {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  async logout(req: expressRequest, res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('GC');
    return { message: 'Logout successful!' };
  }
}
