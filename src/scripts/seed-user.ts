import { DataSource, DataSourceOptions } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/modules/users/entities/user.entity';
import databaseConfig from '@/config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BCRYPT_SALT_ROUNDS } from '@/shared/constants/settings';
import { createQuestion } from '@/scripts/utils/create-question';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

async function seedUser() {
  // Extract config service from ConfigModule
  const configModule =  ConfigModule.forRoot({
    load: [databaseConfig],
  });

  const configProviders = (await configModule)?.providers;
  const configService = (configProviders as  Array<{useFactory: () => DataSourceOptions}>)[0];

  // Get database configuration
  const databaseSetupConfig = configService.useFactory();

  const dataSource = new DataSource(databaseSetupConfig);

  try {
    await dataSource.initialize();
    const userRepository = dataSource.getRepository(User);

    // Prompt for username and password
    const username = await createQuestion(
      `Enter username (default: ${DEFAULT_USERNAME}): `,
    );
    const finalUsername = username.trim() || DEFAULT_USERNAME;

    const password = await createQuestion(
      `Enter password (default: ${DEFAULT_PASSWORD}): `,
    );
    const finalPassword = password.trim() || DEFAULT_PASSWORD;

    const existingUser = await userRepository.findOne({
      where: { username: finalUsername },
    });
    if (existingUser) {
      console.log(`\n✗ User "${finalUsername}" already exists.\n`);
      return 1;
    }

    const hashedPassword = await bcrypt.hash(finalPassword, BCRYPT_SALT_ROUNDS);
    const user = userRepository.create({
      username: finalUsername,
      password: hashedPassword,
    });
    await userRepository.save(user);

    console.log(
      `\n✓ User "${finalUsername}" created successfully with ID: ${user.id}\n`,
    );
  } catch (error) {
    console.error('\n✗ Error creating user:', error.message, '\n');
    return 0;
  } finally {
    await dataSource.destroy();
  }
}

seedUser();
