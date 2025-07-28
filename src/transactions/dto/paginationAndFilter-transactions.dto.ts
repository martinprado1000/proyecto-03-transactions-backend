import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsBoolean,
  Matches,
} from 'class-validator';
import { Area, Categories, MeansOfPayment } from '../enums/transaction.enums';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class PaginationAndFilterTransactionsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'User ID (Mongo ObjectId)',
    example: '60d5ec49e1b3a2c5a88d0123',
  })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Start date (inclusive)',
    nullable: true,
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  @IsDateString({}, { message: 'La fecha de inicio no es válida' })
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-01-31',
    description: 'End date (inclusive)',
    nullable: true,
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  @IsDateString({}, { message: 'La fecha de fin no es válida' })
  endDate?: string;

  @ApiPropertyOptional({
    enum: Categories,
    example: Categories.COMIDA,
    description: 'Transaction category',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(Categories)
  category?: Categories;

  @ApiPropertyOptional({
    enum: MeansOfPayment,
    example: MeansOfPayment.EFECTIVO,
    description: 'Means of payment',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(MeansOfPayment)
  meansOfPayment?: MeansOfPayment;

  @ApiPropertyOptional({
    enum: Area,
    example: Area.OTROS,
    description: 'Area',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(Area)
  area?: Area;

  @ApiPropertyOptional({
    description: 'Transaction is active?',
    type: 'boolean',
    nullable: true,
    example: true,
  })
  // @Transform(({ value }) => {
  //   console.log(`"el valor es" . ${value}`)
  //   if (value == 'true') return true;
  //   if (value == 'false') return false;
  //   return value;
  // })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
