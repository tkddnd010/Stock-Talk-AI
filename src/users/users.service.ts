import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.userRepository.findOne({ where: { id }});

        if(!user) return null;

        const { password, ...userInfo } = user;
         
        return userInfo;
    }

    async createUser(
        email: string,
        password: string,
        nickname: string,
    ): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            nickname,
        });
        return this.userRepository.save(user);
    }
}
