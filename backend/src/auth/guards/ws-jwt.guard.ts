import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { JwtPayload } from '../strategies/jwt.strategy';

export function extractTokenFromSocket(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
        return authToken;
    }

    const authHeader = client.handshake.headers?.authorization;
    if (
        typeof authHeader === 'string' &&
        authHeader.startsWith('Bearer ')
    ) {
        return authHeader.slice(7);
    }

    return null;
}

export function verifySocketClient(
    client: Socket,
    jwtService: JwtService,
    configService: ConfigService,
): boolean {
    const token = extractTokenFromSocket(client);
    if (!token) {
        return false;
    }

    try {
        const payload = jwtService.verify<JwtPayload>(token, {
            secret: configService.getOrThrow<string>('JWT_SECRET'),
        });
        client.data.user = { userId: payload.sub, email: payload.email };
        return true;
    } catch {
        return false;
    }
}

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient<Socket>();
        if (client.data.user) {
            return true;
        }
        return verifySocketClient(client, this.jwtService, this.configService);
    }
}
