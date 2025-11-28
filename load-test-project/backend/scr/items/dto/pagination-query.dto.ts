import { IsOptional, IsPositive, IsInt, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(1000)
  limit?: number = 100;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  offset?: number = 0;
}