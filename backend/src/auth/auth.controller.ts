import {
    Body,
    ConflictException,
    Controller,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@ApiTags('인증')
@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Post('signup')
    @ApiOperation({ summary: '회원가입' })
    @ApiBody({ type: SignupDto })
    @ApiResponse({
        status: 201,
        description: '가입 성공 시 비밀번호를 제외한 사용자 정보',
    })
    @ApiResponse({ status: 409, description: '이미 사용 중인 이메일' })
    async signup(@Body() body: SignupDto) {
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
    @ApiOperation({ summary: '로그인' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 201,
        description: 'JWT access_token',
        schema: {
            type: 'object',
            properties: {
                access_token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: '이메일 또는 비밀번호 불일치' })
    login(
        @Request() req: { user: Omit<User, 'password'> },
        @Body() _body: LoginDto,
    ) {
        return this.authService.login(req.user);
    }
}
