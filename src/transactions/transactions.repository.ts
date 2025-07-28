import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Document as DocumentMongoose, Model } from 'mongoose';

import { TransactionsRepositoryInterface } from 'src/transactions/interfaces/transactions-repository.interface';
import { Transaction } from 'src/transactions/schemas/transactions.schema';
import {
  CreateTransactionDto,
  FilterTransactionsDto,
  UpdateTransactionDto,
  PaginationAndFilterTransactionsDto
} from './dto';

@Injectable()
export class TransactionsRepository implements TransactionsRepositoryInterface {
  constructor(
    @InjectModel(Transaction.name)
    private transactionsModel: Model<Transaction>,
  ) {}

  // -----------FIND ALL---------------------------------------------------------------------------------
  async findAll(
    limit: number,
    offset: number,
  ): Promise<Transaction[]> {
    return await this.transactionsModel.find().skip(offset).limit(limit).sort({ date: -1 }); // Ordenado por fecha descendente
  }

  // -----------FIND ALL WITC FILTERS--------------------------------------------------------------------
  async findAllWithFilter(
    limit: number,
    offset: number,
    filter: FilterTransactionsDto,
  ): Promise<Transaction[]> {
    return await this.transactionsModel.find(filter).skip(offset).limit(limit).sort({ date: -1 });
  }

  // -----------FIND BY ID-------------------------------------------------------------------------------
  async findById(id: string): Promise<DocumentMongoose | null> {
    return await this.transactionsModel.findById(id).lean();
  }

  //-----------FIND BY USER ID---------------------------------------------------------------------------
  async findByUserId(userId: string): Promise<Transaction[]> {
    return await this.transactionsModel.find({userId})
  }

  // -----------CREATE------------------------------------------------------------------------------------
  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return await this.transactionsModel.create(createTransactionDto);
  }

  // -----------UPDATE-------------------------------------------------------------------------------
  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    return await this.transactionsModel.findByIdAndUpdate(
      id,
      updateTransactionDto,
      {
        new: true,
      },
    );
  }

  // -----------DELETE-------------------------------------------------------------------------------
  async delete(id: string): Promise<DocumentMongoose | null> {
    return await this.transactionsModel.findByIdAndDelete(id);
  }

  // -----------DELETE ALL TRANSACTIONS---------------------------------------------------------------------
  async deleteAllExpenses() {
    await this.transactionsModel.deleteMany();
  }
  // -----------DELETE COLLECTION TRANSACTIONS--------------------------------------------------------------
  async deleteExpensesCollection() {
    await this.transactionsModel.collection.drop();
  }
}
