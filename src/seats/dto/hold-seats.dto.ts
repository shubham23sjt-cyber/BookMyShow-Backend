import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class HoldSeatsDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  seatIds!: string[];
}
