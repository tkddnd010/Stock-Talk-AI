import { Controller, Get, Param } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";

@Controller('api/reports')
export class AnalysisController {
    constructor(private readonly analysisService: AnalysisService) {}

    @Get(':symbol')
    async getReports(@Param('symbol') symbol: string) {
        return this.analysisService.getReportsBySymbol(symbol.toUpperCase());
    }
}