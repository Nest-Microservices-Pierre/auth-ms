import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('loginUser')
  login(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @MessagePattern('registerUser')
  register(@Payload() registerUserDTO: RegisterUserDto) {
    return this.authService.register(registerUserDTO);
  }
  @MessagePattern('verifyToken')
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }
}
