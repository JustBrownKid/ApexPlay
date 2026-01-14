import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPortalAccessDto } from './dto/SetPortalAccessDto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Post('resend-otp')
  async resendOtp(@Body('email') email: string) {
    return this.userService.resendOTP(email);
  }

  @Post('verify-otp')
  verify(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.userService.verifyOTP(verifyOtpDto);
  }

  @Patch(':id/set-portal-access')
  async setPortalAccess(
    @Param('id') id: string,
    @Body() setPortalAccessDto: SetPortalAccessDto,
  ) {
    return this.userService.updatePortalAccess(+id, setPortalAccessDto);
  }

  @Post("login")
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
