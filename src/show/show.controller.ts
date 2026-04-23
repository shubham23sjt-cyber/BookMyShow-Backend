import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateShowDto } from './dto/create-show.dto';

@Controller('show')
export class ShowController {
  constructor(private readonly showService: ShowService) {}

  @Post()
  create(@Body() dto:CreateShowDto){
    return this.showService.create(dto);
  }

  @Get()
  findAll(){
    return this.showService.findAll();
  }
  @Get('movie/:movieId')
  findByMovie(@Param('movieId') movieId:string){
    return this.showService.findByMovie(movieId);
  }
}
