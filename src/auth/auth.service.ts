/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

import * as bcrypt from 'bcrypt';

import { LoginUserDto, RegisterUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JWTpayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Prisma Client connected');
  }
  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.user.findUnique({
        where: {
          email: loginUserDto.email,
        },
      });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User does not exist',
        });
      }

      if (!bcrypt.compareSync(loginUserDto.password, user.password)) {
        throw new RpcException({
          status: 400,
          message: 'Incorrect password',
        });
      }

      const { password: __, ...rest } = user;
      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (err) {
      return {
        status: 400,
        message: err.message,
      };
    }
  }

  async register(registerUserDTO: RegisterUserDto) {
    const { email, username, password } = registerUserDTO;

    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const newUser = await this.user.create({
        data: {
          email: email,
          username: username,
          password: bcrypt.hashSync(password, 10),
        },
      });

      const { password: __, ...rest } = newUser;
      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (err) {
      return {
        status: 400,
        message: err.message,
      };
    }
  }
  async verifyToken(token: string) {
    try {
      const { iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecretKey,
      });
      return {
        user,
        token: await this.signJWT(user),
      };
    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 401,
        message: 'Invalid token',
      });
    }
  }

  async signJWT(payload: JWTpayload) {
    return this.jwtService.signAsync(payload);
  }
}
