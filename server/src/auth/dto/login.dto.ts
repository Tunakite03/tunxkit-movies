import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
   @IsEmail({}, { message: 'Email không hợp lệ.' })
   @IsNotEmpty({ message: 'Email không được để trống.' })
   readonly email!: string;

   @IsString()
   @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
   readonly password!: string;
}
