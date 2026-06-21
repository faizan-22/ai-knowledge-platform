import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  if (!process.env.SECRET) {
    throw new Error('SECRET is required!');
  }
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'AI-KNOWLEDGE-PLATFORM',
      colors: true,
      compact: false,
      timestamp: true,
    }),
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
