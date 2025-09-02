import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
} from '@nestjs/common';

import { ApiResponse } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  PaginationAndFilterTransactionsDto,
} from './dto';
import { idMongoPipe } from 'src/common/pipes/idMongo.pipe';

@Controller('transactions')
export class TansactionsController {
  constructor(private readonly trasactionsService: TransactionsService) {}

  // @Get()
  // @ApiResponse({
  //   status: 200,
  //   description: 'Transactions list',
  //   type: CreateTransactionDto,
  // })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // //@Auth()
  // findAll(
  //   @Query() paginationDto: PaginationDto,
  //   @Query() filterTransactionsDto: FilterTransactionsDto,
  // ) {
  //   return this.trasactionsService.findAll(
  //     paginationDto,
  //     filterTransactionsDto,
  //   );
  // }

  // @Get()
  // @ApiResponse({
  //   status: 200,
  //   description: 'Transactions list',
  //   type: PaginationAndFilterTransactionsDto,
  // })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // //@Auth()
  // findAllWithFilter(
  //   @Query()
  //   paginationAndFilterTransactionsDto: PaginationAndFilterTransactionsDto,
  // ) {
  //   return this.trasactionsService.findAllWithFilterResponse(
  //     paginationAndFilterTransactionsDto,
  //   );
  // }

  @Get('findStatisticsAll')
  @ApiResponse({
    status: 200,
    description: 'Transactions list',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  //@Auth()
  findStatisticsAll() {
    return this.trasactionsService.findStatisticsAll();
  }

  @Get('statisticsMonth')
  @ApiResponse({
    status: 200,
    description: 'Transactions list',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  //@Auth()
  findStatisticsMonth() {
    return this.trasactionsService.findStatisticsMonth();
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Transactions list',
    type: PaginationAndFilterTransactionsDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  //@Auth()
  findAllWithFilterPopulate(
    @Query()
    paginationAndFilterTransactionsDto: PaginationAndFilterTransactionsDto,
  ) {
    return this.trasactionsService.findAllWithFilterResponsePopulate(
      paginationAndFilterTransactionsDto,
    );
  }

  // @Get(':term')
  // @ApiResponse({
  //   status: 200,
  //   description: 'Transactions list by id',
  //   type: CreateTransactionDto,
  // })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // //@Auth()
  // findOne(@Param('term') term: string) {
  //   return this.trasactionsService.findOne(term);
  // }

  @Get(':term')
  @ApiResponse({
    status: 200,
    description: 'Transactions list by id',
    type: CreateTransactionDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  //@Auth()
  findByTerm(@Param('term') term: string) {
    return this.trasactionsService.findByTerm(term);
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Transaction was created',
    type: CreateTransactionDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  //@Auth()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    console.log(createTransactionDto);
    return this.trasactionsService.create(createTransactionDto);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Transaction was updated',
    type: UpdateTransactionDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth()
  update(
    @Param('id', idMongoPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.trasactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Transaction was deleted' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 403, description: 'Forbidden, token related' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  //@Auth()
  @HttpCode(204)
  remove(@Param('id', idMongoPipe) id: string) {
    return this.trasactionsService.remove(id);
  }
}
