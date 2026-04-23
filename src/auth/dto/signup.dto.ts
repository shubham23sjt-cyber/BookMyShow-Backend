import {IsEmail, IsNotEmpty, IsString, Min} from 'class-validator'
export class SignupDto{

    @IsString()
    @IsNotEmpty()
    name!:string;
    
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email!:string;


    @IsString()
    @Min(8)
    @IsNotEmpty()
    password!:string

}