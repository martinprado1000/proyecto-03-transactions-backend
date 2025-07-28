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

  async findAllWithFilter(
    paginationAndFilterTransactionsDto: PaginationAndFilterTransactionsDto,
  ) {
    const {
      limit = this.defaultLimit,
      offset = 0,
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

    try {
      return await this.transactionRepository.findAllWithFilter(
        limit,
        offset,
        filter,
      );
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }

  async findAllWithFilterResponse(
    paginationAndFilterTransactionsDto: PaginationAndFilterTransactionsDto,
  ) :Promise<ResponseTransactionDto[]>  {
    const transactions = await this.findAllWithFilter(paginationAndFilterTransactionsDto)
        return plainToInstance(
          ResponseTransactionDto,
          transactions.map((transaction) => transaction.toObject()),
          {
            excludeExtraneousValues: true,
          },
        );
  }

  async findByTerm(term: string) {
    let transaction: DocumentMongoose | null | Transaction[] = null;

    if (isValidObjectId(term)) {
      // Busca por id de transaccion
      console.log(term);
      transaction = await this.transactionRepository.findById(term);
    } else {
      const user = await this.usersService.findOneResponse(term); // Busca el usuario por el email
      console.log(user);
      if (user)
        transaction = await this.transactionRepository.findByUserId(user.id); // Busca transacciones por email
      console.log(transaction);
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
      return await this.transactionRepository.create(createTransactionDto);
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
      console.log(id)
      await this.transactionRepository.delete(id);
    } catch (error) {
      this.handleDBErrors(error);
    }
    return `Tansacción con id: ${id} eliminada`; // No retorna nada si en el controller esta el @HttpCode(204)
  }

  private handleDBErrors(error: any): never {
    if (error.code === 11000)
      throw new BadRequestException(
        `Transacción ${JSON.stringify(error.keyValue._id)} ya existe`,
      );

    throw new InternalServerErrorException('Please check server logs');
  }
}
