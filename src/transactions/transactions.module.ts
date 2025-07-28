import { Module, forwardRef } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { TansactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionSchema } from './schemas/transactions.schema';
import { TransactionsRepository } from './transactions.repository';
import { TRANSACTIONS_REPOSITORY_INTERFACE } from './interfaces/transactions-repository.interface';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [TansactionsController],
  providers: [
    TransactionsService,
    TransactionsRepository,
    {
      provide: TRANSACTIONS_REPOSITORY_INTERFACE,
      useClass: TransactionsRepository,
    },
  ],
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    ConfigModule,
    forwardRef(() => AuthModule),
    UsersModule,
    //AuditLogsModule,
    //SendEmailModule,
  ],
})
export class TansactionsModule {}
