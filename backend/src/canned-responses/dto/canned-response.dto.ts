import { IsString, MinLength } from 'class-validator';

export class CannedResponseDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(1)
  body: string;
}
