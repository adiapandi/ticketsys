import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyTicketCreated?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyTicketAssigned?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyStatusChanged?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyNewComment?: boolean;

  @IsOptional()
  @IsBoolean()
  notifySlaBreached?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyMentioned?: boolean;
}
