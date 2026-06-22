import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsInt()
  size: number;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsEnum(['UPLOADED', 'PROCESSING', 'READY', 'FAILED'], {
    message: 'Not a valid status',
  })
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED' = 'UPLOADED';
}
