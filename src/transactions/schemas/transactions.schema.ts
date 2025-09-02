import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Categories, MeansOfPayment, Area } from 'src/transactions/enums/transaction.enums';

@Schema({
  timestamps: true,
})
export class Transaction extends Document {

  @ApiProperty({
    description: 'User Id',
    example: '67a1a6c23504ec3e184cc14a',
    required: true,
  })
  @Prop({
    trim: true,
    required: true,
    index: true,
    ref: 'User', // defino la relación userId como una referencia (ref: 'User') para luego usar populate
    type: mongoose.Schema.Types.ObjectId,
  })
  userId: string; // Types.ObjectId;

  @ApiProperty({
    description: 'Expenses description',
    example: 'School',
    required: true,
  })
  @Prop({
    trim: true,
    required: true,
  })
  description: string;

  @ApiProperty({
    description: 'Expenses date',
    example: '2025-01-01T00:00:00.000Z',
    required: true,
  })
  @Prop({
    required: true,
    index: true,
  })
  date: Date;

  @ApiProperty({
    description: 'Expenses amount',
    type: Number,
    example: 123.45,
    required: true,
  })
  @Prop({
    required: true,
  })
  amount: number;

  @ApiProperty({
    description: 'Expenses category',
    example: Categories.IMPUESTOS,
    enum: Categories,
    default: Categories.VARIOS,
    required: true,
  })
  @Prop({
    required: true,
    enum: Categories,
    index: true,
    default: Categories.VARIOS,
  })
  category: Categories;

  @ApiProperty({
    description: 'Means of payment',
    example: MeansOfPayment.EFECTIVO,
    enum: MeansOfPayment,
    default: MeansOfPayment.OTROS,
    required: true,
  })
  @Prop({
    required: true,
    enum: MeansOfPayment,
    default: MeansOfPayment.OTROS,
  })
  meansOfPayment: MeansOfPayment;

  @ApiProperty({
    description: 'Expenses observation',
    example: 'School supplies',
    required: false,
  })
  @Prop({
    trim: true,
    required: false,
  })
  observation?: string;

  @ApiProperty({
    description: 'Area',
    example: Area.OTROS,
    enum: Area,
    default: Area.OTROS,
    required: false,
  })
  @Prop({
    uppercase: true,
    trim: true,
    default: Area.OTROS,
    required: false,
  })
  area?: Area;

  @ApiProperty({
    description: 'Expenses is active?',
    example: [true, false],
    default: true,
    required: false,
  })
  @Prop({
    required: false,
    default: true,
  })
  isActive: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
