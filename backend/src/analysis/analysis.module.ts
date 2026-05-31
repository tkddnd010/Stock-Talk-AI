import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AiService } from './ai.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisReport } from './entities/analysis-report.entity';
import { AnalysisController } from './analysis.controller';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';

@Module({
    imports: [TypeOrmModule.forFeature([AnalysisReport]), NotificationModule],
    controllers: [AnalysisController],
    providers: [AnalysisService, AiService],
    exports: [AnalysisService],
})
export class AnalysisModule {}
