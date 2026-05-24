import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AiService } from './ai.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisReport } from './entities/analysis-report.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AnalysisReport])],
    providers: [AnalysisService, AiService],
    exports: [AnalysisService],
})
export class AnalysisModule {}
