import { Document as DocumentMongoose } from 'mongoose';
import { CreateTransactionDto, FilterTransactionsDto, UpdateTransactionDto } from "src/transactions/dto";
import { Transaction } from '../schemas/transactions.schema';

export const TRANSACTIONS_REPOSITORY_INTERFACE = 'TransactionsRepositoryInterface';

export interface TransactionsRepositoryInterface {
  findAll(limit:number, offset:number):Promise<Transaction[]>;
  findAllWithFilter(limit:number, offset:number, filter: FilterTransactionsDto):Promise<Transaction[]>;
  findAllWithFilterPopulate(limit:number, offset:number, filter: FilterTransactionsDto):Promise<Transaction[]>;
  findById(id: string): Promise<DocumentMongoose | null>;
  findByUserId(email: string): Promise<Transaction[] | null>;
  create(createExpensesDto: CreateTransactionDto): Promise<Transaction>;
  update(id: string, updateExpensesDto: UpdateTransactionDto): Promise<Transaction | null>;
  delete(is:string): Promise<DocumentMongoose | null>;
  deleteAllExpenses():void;
  deleteExpensesCollection():void;
  findStatisticsAll: any;
  findStatisticsMonth: any;
  findStatisticsLast6Months: any;
  }