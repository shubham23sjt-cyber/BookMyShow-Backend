import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';

@Injectable()
export class MovieService {
    constructor(private prisma:PrismaService){}

    async create(dto:CreateMovieDto){
        return this.prisma.movie.create({
            data:{
                title:dto.title,
                duration:dto.duration,
            }
        });
    }

    async findAll(){
        return this.prisma.movie.findMany({
            orderBy:{createdAt:'desc'},
        });
    }

    async findone(id:string){
        return this.prisma.movie.findUnique({
            where:{id},
        });
    }

    async delete(id:string){
        return this.prisma.movie.delete({
            where:{id},
        })

    }
}
