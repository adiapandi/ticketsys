import { IsString } from 'class-validator';

export class MergeTicketDto {
  @IsString()
  targetTicketId: string;
}
