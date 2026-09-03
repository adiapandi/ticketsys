import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(5)
  description: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsString()
  departmentId: string;

  @IsOptional()
  @IsString()
  requestedForUserId?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
