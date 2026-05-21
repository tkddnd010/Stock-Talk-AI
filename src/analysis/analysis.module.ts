import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AiService } from './ai.service';

@Module({
    providers: [AnalysisService, AiService],
    exports: [AnalysisService],
})
export class AnalysisModule {}
