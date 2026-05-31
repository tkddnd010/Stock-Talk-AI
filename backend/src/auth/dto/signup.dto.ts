import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
    @ApiProperty({
        description: '회원가입에 사용할 이메일 주소(로그인 ID로 사용)',
        example: 'user@example.com',
    })
    email: string;

    @ApiProperty({
        description: '계정 비밀번호(평문, 서버에서 bcrypt로 해시 저장)',
        example: 'password123',
        minLength: 8,
    })
    password: string;

    @ApiProperty({
        description: '서비스 내 표시용 닉네임',
        example: '투자왕',
    })
    nickname: string;
}
