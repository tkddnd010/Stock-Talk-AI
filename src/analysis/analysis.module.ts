import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AiService } from './ai.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisReport } from './entities/analysis-report.entity';
import { AnalysisController } from './analysis.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AnalysisReport])],
    controllers: [AnalysisController],
    providers: [AnalysisService, AiService],
    exports: [AnalysisService],
})
export class AnalysisModule {}
