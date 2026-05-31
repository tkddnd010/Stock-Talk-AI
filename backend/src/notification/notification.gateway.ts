import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { timestamp } from "rxjs";
import { Server, Socket } from "socket.io";

@WebSocketGateway({cors: true})
export class NotificationGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() symbol: string,
    ) {
        client.join(symbol);
        console.log(`유저 [${client.id}]가 ${symbol} 방에 입장했습니다.`);

        setTimeout(() => {
            this.server.to(symbol).emit('debate_message',{
                speaker: '워렌 버핏 AI',
                message: '안녕하세요. 워렌 버핏 AI입니다. 토론을 시작합니다.',
                timestamp: new Date(),
            });
        }, 2000);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() symbol: string,
    ) {
        client.leave(symbol);
        console.log(`유저 [${client.id}]가 ${symbol} 방에서 퇴장했습니다.`);
    }

    broadcastToRoom(room: string, event: string, data: any) {
        this.server.to(room).emit(event, data);
    }
}