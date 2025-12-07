import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { UsersService } from '@/modules/users/users.service';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

async function seedUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const username = process.argv[2] || DEFAULT_USERNAME;
  const password = process.argv[3] || DEFAULT_PASSWORD;

  try {
    const existingUser = await usersService.findByUsername(username);
    if (existingUser) {
      console.log(`User "${username}" already exists.`);
      return 1;
    }

    const user = await usersService.create(username, password);
    console.log(`User "${username}" created successfully with ID: ${user.id}`);
  } catch (error) {
    console.error('Error creating user:', error.message);
    return 0;
  } finally {
    await app.close();
  }
}

seedUser();
