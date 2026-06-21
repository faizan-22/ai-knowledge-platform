/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          email: loginDto.email,
        },
      });

      if (!user) {
        throw new Error('User Not Found!');
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new Error('Invalid password!');
      }

      const tokenPayload = { sub: user.id, email: user.email };
      const token = await this.jwtService.signAsync(tokenPayload);
      return {
        access_token: token,
        token_type: 'bearer',
        message: `Logged in with ${user.email}`,
      };
    } catch (err) {
      this.logger.error(err);
    }
  }

  async signup(signUpDto: SignUpDto) {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(signUpDto.password, salt);
      const { password, ...userData } = signUpDto;
      void password;

      await this.databaseService.user.create({
        data: { ...userData, passwordHash: hashedPassword },
      });

      return `User created successfully with email ${userData.email}`;
    } catch (err) {
      this.logger.error(err);
    }
  }
}
