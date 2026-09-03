import { IsString, MinLength } from 'class-validator';

export class DepartmentDto {
  @IsString()
  @MinLength(2)
  name: string;
}
