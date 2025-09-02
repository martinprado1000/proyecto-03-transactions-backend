import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsMongoId,
  MaxLength,
  Max,
  Min,
  IsNumber,
  ValidateIf,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { Role } from 'src/users/enums/role.enums';
import { Area, Categories, MeansOfPayment } from '../enums/transaction.enums';

//----- _id ------------------------------
export class CreateTransactionDto {
  @ApiProperty({
    description: 'Mongo Id (unique)',
    type: 'string',
    nullable: true,
    example: '67a1a6c23504ec3e184cc14a',
  })
  @IsOptional()
  @IsMongoId()
  @Transform(({ value }) =>
    Types.ObjectId.isValid(value) ? value.toString() : value,
  )
  _id?: string;

  //----- UserId ------------------------------
  @ApiProperty({
    description: 'Mongo Id User',
    type: 'string',
    nullable: false,
    example: '67a1a6c23504ec3e184cc14a',
  })
  @IsMongoId()
  @Transform(({ value }) =>
    Types.ObjectId.isValid(value) ? value.toString() : value,
  )
  userId?: string;

  //----- UserEmail ------------------------------
  @ApiProperty({
    description: 'User email',
    type: 'string',
    nullable: false,
    maxLength: 100,
    example: 'richard@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value.toLowerCase().trim())
  userEmail: string;

  //----- Description ------------------------------
  @ApiProperty({
    description: 'Expenses description',
    type: 'string',
    minLength: 1,
    maxLength: 1000,
    nullable: false,
    example: 'School',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  description: string;

  //----- Date ------------------------------
  @ApiProperty({
    description: 'Date of expense',
    type: Date,
    nullable: false,
    example: '2025-01-01T00:00:00.000Z',
  })
  @Transform(({ value }) => { // Esto asegura que si el valor no es válido, se vuelve null y lo atrapás con @IsNotEmpty() o @IsDate().
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }) // Transformo a fecha
  @IsDate()
  @IsNotEmpty()
  date: Date;

  //----- Amount ------------------------------
  @ApiProperty({
    description: 'Expenses amount',
    type: 'number',
    nullable: false,
    maxLength: 100,
    example: 123.45,
  })
  @IsNotEmpty()
  @IsNumber(
    { maxDecimalPlaces: 6 },
    { message: 'El monto no puede contener más de 6 decimales' },
  )
  @Max(999999999999999, {
    message: 'El monto no puede ser mayor a 999.999.999.999.999',
  })
  @Min(-999999999999999, { message: 'El monto no puede ser menor a -999.999.999.999.999' })
  amount: number;

  //----- Category ------------------------------
  @ApiProperty({
    description: 'Transaction category',
    enum: Categories,
    nullable: false,
    example: Categories.COMIDA,
  })
  @IsOptional()
  @IsEnum(Categories)
  category?: Categories;

  //----- Means Of Payment ------------------------------
  @ApiProperty({
    description: 'Means Of Payment',
    enum: MeansOfPayment,
    nullable: false,
    example: MeansOfPayment.EFECTIVO,
  })
  @IsOptional()
  @IsEnum(MeansOfPayment)
  meansOfPayment?: MeansOfPayment;

  //----- Observation ------------------------------
  @ApiProperty({
    description: 'Transaction observation',
    type: 'string',
    minLength: 1,
    maxLength: 10000,
    nullable: true,
    example: 'School',
  })
  @ValidateIf(
    // Valida si envian algo (no undefined ni null). Es como @IsOptional() pero si viene valida lo siguiente
    (obj) => obj.observation !== undefined && obj.observation !== null,
  )
  @IsString()
  @MaxLength(10000, { message: 'Debe tener menos de 10000 caracteres' })
  observation?: string;

  //----- Area ------------------------------
  @ApiProperty({
    description: 'Transaction area',
    enum: Area,
    nullable: true,
    example: Area.OTROS,
  })
  @IsOptional()
  @IsEnum(Area)
  area?: Area;

  //----- Is active? ------------------------------
  @ApiProperty({
    description: 'Transaction is active?',
    type: 'boolean',
    nullable: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
