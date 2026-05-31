import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly openai: OpenAI;
    private readonly model: string;

    constructor(private readonly configService: ConfigService){
        this.openai = new OpenAI({
            apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
            baseURL: this.configService.getOrThrow<string>('OPENAI_BASE_URL'),
        });
        this.model =
            this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-5-mini';
    }

    async getAnalysis(personaPrompt: string, symbol: string, changePercent: number,currentPrice: number, customPrompt?: string):Promise<string> {
        try{
            const userMessageContent = customPrompt
                ? customPrompt
                : `종목: ${symbol}, 가격: ${currentPrice}, 변동률: ${changePercent}%`;
            
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {role: 'system', content: personaPrompt},
                    {role: 'user', content: userMessageContent}
                ],
            });
            return response.choices[0].message.content || '분석 실패';
        } catch(error){
            this.logger.error(`AI 에러: ${error.message}`);
            throw error;
        }
    }
}