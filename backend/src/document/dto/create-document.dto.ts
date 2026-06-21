import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsEnum(['UPLOADED', 'PROCESSING', 'READY', 'FAILED'], {
    message: 'Not a valid status',
  })
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED' = 'UPLOADED';
}
