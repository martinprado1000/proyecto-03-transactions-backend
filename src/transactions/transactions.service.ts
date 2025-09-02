import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Transaction } from './schemas/transactions.schema';
import { Model, Document as DocumentMongoose, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  FilterTransactionsDto,
  PaginationAndFilterTransactionsDto,
  ResponseTransactionDto,
} from './dto';
import {
  TRANSACTIONS_REPOSITORY_INTERFACE,
  TransactionsRepositoryInterface,
} from './interfaces/transactions-repository.interface';
import { UsersService } from 'src/users/users.service';
import { response } from 'express';
import { ResponseTransactionPopulateDto } from './dto/response-transaction-populate.dto';

export interface MonthlySummary {
  month: string;
  year: number;
  income: number;
  egress: number;
}

@Injectable()
export class TransactionsService {
  private defaultLimit: number;

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,

    @Inject(TRANSACTIONS_REPOSITORY_INTERFACE)
    private readonly transactionRepository: TransactionsRepositoryInterface,

    private readonly usersService: UsersService,

    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('pagination.defaultLimit', 3);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return await this.transactionRepository.findAll(limit, offset);
  }

  //----------------------------------------------------------------------------------------------------
  async findAllWithFilter(
    paginationAndFilterTransactionsDto: PaginationAndFilterTransactionsDto,
  ) {
    const filter = this.validateFilters(paginationAndFilterTransactionsDto);

    const { limit = this.defaultLimit, offset = 0 } =
      paginationAndFilterTransactionsDto;

    try {
      return await this.transactionRepository.findAllWithFilterPopulate(
        limit,
        offset,
        filter,
      );
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }

  //----------------------------------------------------------------------------------------------------
  // async findAllWithFilterResponse(
  //   paginationAndFilterTransactionsDto: PaginationAndFilterTransactionsDto,
  // ): Promise<ResponseTransactionDto[]> {
  //   const transactions = await this.findAllWithFilter(
  //     paginationAndFilterTransactionsDto,
  //   );

  //   //console.log(transactions)
  //   const transactionsPlain = plainToInstance(
  //     ResponseTransactionDto,
  //     transactions.map((transaction) => transaction.toObject()),
  //     {
  //       excludeExtraneousValues: true,
  //     },
  //   );
  //   //console.log(transactionsPlain);
  //   return transactionsPlain;
  // }

  //----------------------------------------------------------------------------------------------------
  async findAllWithFilterResponsePopulate(
    paginationAndFilterTransactionsDto: PaginationAndFilterTransactionsDto,
  ) {
    const transactions = await this.findAllWithFilter(
      paginationAndFilterTransactionsDto,
    );
    //console.log(transactions)

    const transactionsPlain = plainToInstance(
      ResponseTransactionPopulateDto,
      transactions.map((transaction) => transaction.toObject()),
      {
        excludeExtraneousValues: true,
      },
    );
    //console.log(transactionsPlain)
    return transactionsPlain;
  }

  async findByTerm(term: string) {
    let transaction: DocumentMongoose | null | Transaction[] = null;

    if (isValidObjectId(term)) {
      // Busca por id de transaccion
      transaction = await this.transactionRepository.findById(term);
    } else {
      const user = await this.usersService.findOneResponse(term); // Busca el usuario por el email
      if (user)
        transaction = await this.transactionRepository.findByUserId(user.id); // Busca transacciones por email
    }

    if (!transaction)
      throw new NotFoundException(`No se encontró la transaccion: ${term}`);

    return transaction;
  }

  // async findAllWithFilterByEmail(
  //   paginationAndFilterTransactionsDto: PaginationAndFilterTransactionsDto,
  // ) {
  //   const {
  //     limit = this.defaultLimit,
  //     offset = 0,
  //     startDate,
  //     endDate,
  //     userId,
  //     category,
  //     meansOfPayment,
  //     area,
  //     isActive,
  //   } = paginationAndFilterTransactionsDto;
  //   const filter: any = {};
  //   if (startDate && endDate) {
  //     const start = new Date(startDate);
  //     const end = new Date(endDate);
  //     if (start > end) {
  //       throw new BadRequestException(
  //         'La fecha de inicio no puede ser posterior a la fecha de fin',
  //       );
  //     }
  //   }
  //   if (startDate || endDate) {
  //     filter.date = {};
  //     if (startDate) filter.date.$gte = new Date(startDate); // $gte: "mayor o igual que".  "greater than or equal to"
  //     if (endDate) filter.date.$lte = new Date(endDate); // $lte: "menor o igual que".  "less than or equal to"
  //   }
  //   if (userId) filter.userId = userId;
  //   if (category) filter.category = category;
  //   if (meansOfPayment) filter.meansOfPayment = meansOfPayment;
  //   if (area) filter.area = area;
  //   return await this.transactionRepository.findAllWithFilter(
  //     limit,
  //     offset,
  //     filter,
  //   );
  // }

  // async findOne(term: string) {
  //   const transaction = await this.transactionRepository.findById(term);
  //   if (!transaction)
  //     throw new NotFoundException(`No se encontró la transacción: ${term}`);
  //   return transaction;
  // }

  async create(createTransactionDto: CreateTransactionDto) {
    try {
      const trasaction =
        await this.transactionRepository.create(createTransactionDto);
      const trasactionResponse: ResponseTransactionDto = plainToInstance(
        ResponseTransactionDto,
        trasaction.toObject(),
        {
          excludeExtraneousValues: true,
        },
      );
      return trasactionResponse;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    try {
      return await this.transactionRepository.update(id, updateTransactionDto);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    try {
      await this.transactionRepository.delete(id);
    } catch (error) {
      this.handleDBErrors(error);
    }
    return `Tansacción con id: ${id} eliminada`; // No retorna nada si en el controller esta el @HttpCode(204)
  }

  async findStatisticsAll() {
    try {
      return await this.transactionRepository.findStatisticsAll();
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }

  async findStatisticsMonth() {
    try {
      const income =
        await this.transactionRepository.findStatisticsMonth('income');
      const egress =
        await this.transactionRepository.findStatisticsMonth('egress');
      const all = await this.transactionRepository.findStatisticsMonth('all');
      const sixMonth = await this.getIncomeEgressLast6Months();

      const today = new Date();
      const last30Days = new Date();
      last30Days.setDate(today.getDate() - 29); // 30 días exactos

      // Generar array con todos los días de los últimos 30
      const allDays: string[] = [];
      for (
        let d = new Date(last30Days);
        d <= today;
        d.setDate(d.getDate() + 1)
      ) {
        allDays.push(new Date(d).toISOString().split('T')[0]); // YYYY-MM-DD
      }

      // Función para completar y sumar transacciones por día
      const fillMissingDays = (
        transactions: { date: Date; amount: number }[],
      ) => {
        const map = new Map<string, number>();

        transactions.forEach((t) => {
          const day = new Date(t.date).toISOString().split('T')[0];
          map.set(day, (map.get(day) || 0) + t.amount); // acumula en vez de sobrescribir
        });

        return allDays.map((day) => ({
          date: day,
          amount: map.get(day) || 0,
        }));
      };

      const incomeFilled = fillMissingDays(income);
      const egressFilled = fillMissingDays(egress);
      const allFilled = fillMissingDays(all);

      // console.log('Income:', incomeFilled);
      // console.log('Egress:', egressFilled);
      // console.log('Egress:', allFilled);
      // console.log('sixMonth:', sixMonth)

      return { income: incomeFilled, egress: egressFilled, all: allFilled, sixMonth: sixMonth };
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }



async getIncomeEgressLast6Months(): Promise<MonthlySummary[]> {

  const results = await this.transactionRepository.findStatisticsLast6Months();
  console.log(results)
  
  const months: MonthlySummary[] = [];
  const currentDate = new Date();
  
  // Meses en inglés para comparación
  const englishMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generar correctamente los últimos 6 meses
  for (let i = 0; i < 6; i++) {
    // Calcular fecha correctamente (mes actual - i)
    const targetMonth = currentDate.getMonth() - i;
    let year = currentDate.getFullYear();
    let monthIndex = targetMonth;
    
    // Ajustar si el mes es negativo
    if (targetMonth < 0) {
      monthIndex = 12 + targetMonth; // targetMonth es negativo
      year = year - 1;
    }
    
    const monthName = englishMonths[monthIndex];
    
    // Buscar si existe en los resultados
    const existingMonth = results.find(r => 
      r.month === monthName && 
      r.year === year
    );
    
    if (existingMonth) {
      months.unshift(existingMonth); // Agregar al inicio para orden correcto
    } else {
      months.unshift({
        month: monthName,
        year: year,
        income: 0,
        egress: 0
      });
    }
  }

  console.log(months)
  return months;
}

  private handleDBErrors(error: any): never {
    if (error.code === 11000)
      throw new BadRequestException(
        `Transacción ${JSON.stringify(error.keyValue._id)} ya existe`,
      );

    throw new InternalServerErrorException('Please check server logs');
  }

  private validateFilters = (
    paginationAndFilterTransactionsDto: PaginationAndFilterTransactionsDto,
  ) => {
    const {
      startDate,
      endDate,
      userId,
      category,
      meansOfPayment,
      area,
      isActive,
    } = paginationAndFilterTransactionsDto;

    const filter: any = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        throw new BadRequestException(
          'La fecha de inicio no puede ser posterior a la fecha de fin',
        );
      }
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate); // $gte: "mayor o igual que".  "greater than or equal to"
      if (endDate) filter.date.$lte = new Date(endDate); // $lte: "menor o igual que".  "less than or equal to"
    }
    if (userId) filter.userId = userId;
    if (category) filter.category = category;
    if (meansOfPayment) filter.meansOfPayment = meansOfPayment;
    if (area) filter.area = area;
    if (isActive !== undefined) filter.isActive = isActive;

    return filter;
  };
}
