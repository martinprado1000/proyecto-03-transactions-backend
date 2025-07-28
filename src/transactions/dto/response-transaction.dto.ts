import { Expose, Transform } from 'class-transformer';
import { Area, Categories, MeansOfPayment } from '../enums/transaction.enums';

export class ResponseTransactionDto {

  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  userId: string;

  @Expose()
  description: string;

  @Expose()
  @Transform(({ value }) => value.toISOString().split('T')[0])
  date: Date;

  @Expose()
  amount: number;

  @Expose()
  category?: Categories;

  @Expose()
  meansOfPayment?: MeansOfPayment;

  @Expose()
  observation?: string;

  @Expose()
  area?: Area;

  @Expose()
  isActive?: boolean;
}
