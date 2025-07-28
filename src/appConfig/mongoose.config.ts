import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongooseConfigFactory = (configService: ConfigService): MongooseModuleOptions => ({
  uri: configService.get<string>('database.uri'),
  // auth: {
  //   username: configService.get<string>('database.username'),
  //   password: configService.get<string>('database.password'),
  // },
});