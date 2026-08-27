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

  // Hanya dipakai kalau yang bikin ticket adalah staff (agent/admin):
  // membuat ticket "atas nama" user lain (kerjaan udah selesai duluan, baru dicatat)
  @IsOptional()
  @IsString()
  requestedForUserId?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
