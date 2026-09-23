import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppModule } from './app.module';
import { hashPassword } from './auth/password';
import { User } from './users/user.schema';

const PASSWORD = 'password123';

const USERS = [
  ['Aarti Rao', 'aarti@example.com'],
  ['Dev Menon', 'dev@example.com'],
  ['Kiran Shah', 'kiran@example.com'],
  ['Meera Iyer', 'meera@example.com'],
  ['Rohit Nair', 'rohit@example.com'],
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const now = new Date();

  await userModel.init();
  await userModel.collection.drop();
  await userModel.syncIndexes();
  await userModel.insertMany(
    await Promise.all(
      USERS.map(async ([name, email]) => ({
        name,
        email,
        password_hash: await hashPassword(PASSWORD),
        initials: name
          .split(' ')
          .map((part) => part[0])
          .join(''),
        created_at: now,
      })),
    ),
  );

  await app.close();
  console.log(
    `Seeded ${USERS.length} users into '${userModel.db.name}'. Password for all: ${PASSWORD}`,
  );
}

void seed();
