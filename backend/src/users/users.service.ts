/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<any> {
    try {
      return await this.databaseService.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  async findOne(userId: number): Promise<any> {
    try {
      return await this.databaseService.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  async update(
    userId: number,
    updateUserDto: Prisma.UserUpdateInput,
  ): Promise<any> {
    try {
      return await this.databaseService.user.update({
        where: {
          id: userId,
        },
        data: updateUserDto,
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  async remove(userId: number): Promise<any> {
    try {
      return await this.databaseService.user.delete({
        where: {
          id: userId,
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }
}
