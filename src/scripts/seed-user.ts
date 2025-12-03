import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';

  try {
    const existingUser = await usersService.findByUsername(username);
    if (existingUser) {
      console.log(`User "${username}" already exists.`);
      await app.close();
      return;
    }

    const user = await usersService.create(username, password);
    console.log(`User "${username}" created successfully with ID: ${user.id}`);
  } catch (error) {
    console.error('Error creating user:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();

