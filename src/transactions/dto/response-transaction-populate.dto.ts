import { Expose, Transform } from 'class-transformer';
import { Area, Categories, MeansOfPayment } from '../enums/transaction.enums';

class UserResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  email: string;
}

export class ResponseTransactionPopulateDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.userId?._id?.toString() || obj.userId?.toString())
  userId: string;

  @Expose()
  @Transform(({ obj }) => obj.userId?.email || '') // Extrae el email
  userEmail: string; // Nuevo campo para el email

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
