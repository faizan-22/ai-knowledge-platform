import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth.guard';

@Module({
  providers: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
