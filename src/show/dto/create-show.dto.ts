import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateShowDto {
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @IsString()
  @IsNotEmpty()
  venueId!: string;

  @IsDateString()
  startTime!: string;
}
