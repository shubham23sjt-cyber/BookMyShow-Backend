import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {JwtService} from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
@Injectable()
export class AuthService {
    constructor(private prisma:PrismaService,
        private jwtService:JwtService
    ){}

    async signup(data:any){
        const{name,email,password}=data;
        const exist=await this.prisma.user.findUnique({
            where:{email}
        })
        if(exist){
            throw new BadRequestException("user already with this email")
        }
        const hashed=await bcrypt.hash(password,10);

        const user=await this.prisma.user.create({
            data:{
                name,
                email,
                password:hashed,
            }
        });
        return user;
    }
    async login(data:any){
        const user=await this.prisma.user.findUnique({
            where:{email:data.email}
        });
        if(!user) throw new BadRequestException("user not found with this email")

            const match=await bcrypt.compare(data.password,user.password)
        if(!match) throw new BadRequestException("password is wrong")
            const token=await this.jwtService.sign({userId:user.id});
        return {access_token:token};
        }
    
}
