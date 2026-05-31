import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('analysis_reports')
export class AnalysisReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    symbol: string; // 분석 종목

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number; // 분석 당시 주가

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    changePercent: number; // 분석 당시 변동률

    @Column()
    title: string; // 게시글 제목

    @Column({ type: 'text' })
    content: string; // 게시글 본문(AI가 생성한 리포트)

    @Column()
    author: string; // 게시글 작성자(작성한 성향들의 투자 성향)

    @Column()
    type: 'INDIVIDUAL' | 'DEBATE'; // 개별 분석글인지, 종합 토론글인지 구분

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}
