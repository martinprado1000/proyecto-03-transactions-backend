import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Document as DocumentMongoose, Model } from 'mongoose';

import { TransactionsRepositoryInterface } from 'src/transactions/interfaces/transactions-repository.interface';
import { Transaction } from 'src/transactions/schemas/transactions.schema';
import {
  CreateTransactionDto,
  FilterTransactionsDto,
  UpdateTransactionDto,
  PaginationAndFilterTransactionsDto,
} from './dto';


interface MonthlySummary {
  month: string;
  year: number;
  income: number;
  egress: number;
}

@Injectable()
export class TransactionsRepository implements TransactionsRepositoryInterface {
  constructor(
    @InjectModel(Transaction.name)
    private transactionsModel: Model<Transaction>,
  ) {}

  // -----------FIND ALL---------------------------------------------------------------------------------
  async findAll(limit: number, offset: number): Promise<Transaction[]> {
    return await this.transactionsModel.find();
  }

  // -----------FIND ALL WITC FILTERS--------------------------------------------------------------------
  async findAllWithFilter(
    limit: number,
    offset: number,
    filter: FilterTransactionsDto,
  ): Promise<Transaction[]> {
    return await this.transactionsModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .sort({ date: -1 });
  }

  // -----------FIND ALL WITC FILTERS POPULATE--------------------------------------------------------------------
  async findAllWithFilterPopulate(
    limit: number,
    offset: number,
    filter: FilterTransactionsDto,
  ): Promise<Transaction[]> {
    const transactions = await this.transactionsModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .populate('userId', 'email')
      .sort({ date: -1 });

    //console.log(transactions)
    return transactions;
  }

  // -----------FIND BY ID-------------------------------------------------------------------------------
  async findById(id: string): Promise<DocumentMongoose | null> {
    return await this.transactionsModel.findById(id).lean();
  }

  //-----------FIND BY USER ID---------------------------------------------------------------------------
  async findByUserId(userId: string): Promise<Transaction[]> {
    return await this.transactionsModel.find({ userId });
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

  // -----------RETURN DATE AND AMOUNT----------------------------------------
  // Busca todo y retorna solo el dia y el monto
  async findStatisticsAll() {
    return await this.transactionsModel.find().select('date amount -_id');
    // Busca y retorna date, amount y NO el _id que (-)
  }

  // -----------RETURN DATE AND AMOUNT FOR MOUNTH----------------------------------------
  // Busca todo y retorna solo el dia y el monto
  async findStatisticsMonth(type: 'income' | 'egress' | 'all' = 'all') {
    const today = new Date();

    // Fecha de hace 30 días
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    // Filtro base
    const filter: any = {
      date: { $gte: last30Days, $lte: today },
    };

    // Filtro adicional según el tipo
    if (type === 'income') {
      filter.amount = { $gt: 0 }; // solo positivos
    } else if (type === 'egress') {
      filter.amount = { $lt: 0 }; // solo negativos
    }
    return await this.transactionsModel
      .find(filter) // busca las fechas que empiezan con "2025-08"
      .select('date amount -_id'); // Selecciona date, amount y NO el _id que (-)
  }

// -----------RETURN INCOME/EGRESS BY MONTH (LAST 6 MONTHS)----------------------------
async findStatisticsLast6Months() {
  const today = new Date();
  
  // Fecha de hace 6 meses (no 30 días)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  sixMonthsAgo.setDate(1); // Primer día del mes para incluir mes completo
  sixMonthsAgo.setHours(0, 0, 0, 0); // Inicio del día

  return await this.transactionsModel.aggregate([
    {
      $match: {
        date: { 
          $gte: sixMonthsAgo, // Desde hace 6 meses
          $lte: today         // Hasta hoy
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" }
        },
        totalIncome: {
          $sum: {
            $cond: [{ $gt: ["$amount", 0] }, "$amount", 0]
          }
        },
        totalEgress: {
          $sum: {
            $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        month: {
          $let: {
            vars: {
              monthsInString: [
                "", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ]
            },
            in: {
              $arrayElemAt: ["$$monthsInString", "$_id.month"]
            }
          }
        },
        year: "$_id.year",
        income: { $round: ["$totalIncome", 2] },
        egress: { $round: ["$totalEgress", 2] }
      }
    },
    {
      $sort: { year: 1, month: 1 }
    }
  ]);
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
