import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RetrievalService } from './retrieval.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ApiOAuth2 } from '@nestjs/swagger';
import { RetrievalQueryDto } from './dto/retrieval-query.dto';

@ApiOAuth2([], 'oauth2-login')
@UseGuards(JwtAuthGuard)
@Controller('retrieval')
export class RetrievalController {
  constructor(private readonly retrievalService: RetrievalService) {}

  @Post(':id')
  getChunks(
    @Body(ValidationPipe) retrievalQueryDto: RetrievalQueryDto,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = parseInt(req.payload.sub);
    return this.retrievalService.retrieveChunks(
      userId,
      id,
      retrievalQueryDto.query,
    );
  }
}
