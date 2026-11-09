import { Controller, Get } from '@nestjs/common';
import { SourceService } from './source.service';

@Controller('lectures')
export class SourceController {
  constructor(private readonly source: SourceService) {}

  @Get()
  getLectures() {
    return this.source.getLectures();
  }
}
