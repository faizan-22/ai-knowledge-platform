import { IsNotEmpty, IsString } from 'class-validator';

export class RetrievalQueryDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}