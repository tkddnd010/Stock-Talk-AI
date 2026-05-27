import {
    Body,
    ConflictException,
    Controller,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Post('signup')
    async signup(
        @Body()
        body: {
            email: string;
            password: string;
            nickname: string;
        },
    ) {
        const existingUser = await this.usersService.findByEmail(body.email);
        if (existingUser) {
            throw new ConflictException('이미 사용 중인 이메일입니다.');
        }

        const user = await this.usersService.createUser(
            body.email,
            body.password,
            body.nickname,
        );

        const { password: _, ...result } = user;
        return result;
    }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    login(@Request() req: { user: Omit<User, 'password'> }) {
        return this.authService.login(req.user);
    }
}
