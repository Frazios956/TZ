import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  await app.listen(3000, '0.0.0.0');
  console.log('✅ Backend is running on: http://0.0.0.0:3000');
}

bootstrap().catch(error => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});