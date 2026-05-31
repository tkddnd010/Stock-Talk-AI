import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: '가입 시 등록한 이메일 주소',
        example: 'user@example.com',
    })
    email: string;

    @ApiProperty({
        description: '계정 비밀번호',
        example: 'password123',
    })
    password: string;
}
