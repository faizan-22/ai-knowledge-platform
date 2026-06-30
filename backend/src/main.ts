import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  if (!process.env.SECRET) {
    throw new Error('SECRET is required!');
  }
  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV is required!');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required!');
  }

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'AI-KNOWLEDGE-PLATFORM',
      colors: true,
      compact: false,
      timestamp: true,
    }),
  });

  const config = new DocumentBuilder()
    .setTitle('AI Knowledge Platform')
    .setDescription('AI Knowledge Platform API Description')
    .setVersion('1.0')
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          password: {
            tokenUrl: '/auth/swagger-login',
            scopes: {},
          },
        },
      },
      'oauth2-login',
    )
    .addTag('AI KNOWLEDGE PLATFORM')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
