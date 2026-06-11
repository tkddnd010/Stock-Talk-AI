import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';

@Module({
    imports: [AuthModule],
    providers: [NotificationService, NotificationGateway, WsJwtGuard],
    exports: [NotificationService],
})
export class NotificationModule {}
