import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('personalInfo')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req) {
        return await this.usersService.findById(req.user.userId);
    }
}
