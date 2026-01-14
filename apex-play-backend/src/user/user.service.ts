import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/index';
import { eq, and, gt } from 'drizzle-orm';
import { LoginUserDto } from './dto/login-user';
import { PasswordUtil } from 'src/utils/password.helper';
import { JwtService } from '@nestjs/jwt';
import { TelegramService } from 'src/telegram/telegram.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPortalAccessDto } from './dto/SetPortalAccessDto';

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    private readonly jwt: JwtService,
    private readonly Telegram: TelegramService,
  ) { }

  private async processAndSendOTP(email: string, tgid: string) {
    await this.db.delete(schema.otps).where(eq(schema.otps.email, email));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.db.insert(schema.otps).values({
      email,
      code: otp,
      expiresAt,
    });

    const sent = await this.Telegram.sendOTP(tgid, otp);
    if (!sent) {
      throw new InternalServerErrorException('Failed to send OTP to Telegram.');
    }
    return true;
  }

  private async generateAuthResponse(user: any) {
    const { password, ...payload } = user;
    const token = this.jwt.sign(payload);
    if (user.tgid) {
      const identifier = user.username || user.name || user.email;
      await this.Telegram.sendLoginAlert(user.tgid, identifier);
    }
    return {
      message: 'Login successful',
      token,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const hashed = await PasswordUtil.hash(createUserDto.password);
    const [user] = await this.db
      .insert(schema.users)
      .values({
        ...createUserDto,
        password: hashed,
      })
      .returning();
    const { password, ...other } = user;
    return other;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }: any) => eq(users?.email, loginUserDto.email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await PasswordUtil.compare(loginUserDto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.protalUser) {
      if (user.tgid) {
        await this.processAndSendOTP(user.email, user.tgid);
        return {
          message: 'OTP sent to your Telegram. Please verify.',
          email: user.email,
          requireOTP: true,
        };
      } else {
        throw new BadRequestException('Security Alert: Please link your Telegram ID to your account first.');
      }
    }


    return await this.generateAuthResponse(user);
  }

  async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    const validOtp = await this.db.query.otps.findFirst({
      where: (otps, { sql }) =>
        and(
          eq(otps.email, verifyOtpDto.email),
          eq(otps.code, verifyOtpDto.code),
          gt(otps.expiresAt, sql`now()`),
        ),
    });

    if (!validOtp) {
      throw new UnauthorizedException('The OTP is incorrect or has expired.');
    }
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, verifyOtpDto.email),
    });

    await this.db.delete(schema.otps).where(eq(schema.otps.email, verifyOtpDto.email));
    return this.generateAuthResponse(user);
  }

  async resendOTP(email: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user || !user.tgid) {
      throw new NotFoundException('User or Telegram ID not found.');
    }

    await this.processAndSendOTP(user.email, user.tgid);

    return { message: 'A new OTP has been sent to your Telegram.' };
  }

  async updatePortalAccess(id: number, data: SetPortalAccessDto) {
    const [updatedUser] = await this.db
      .update(schema.users)
      .set({
        tgid: data.tgid,
        protalUser: data.protalUser,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = updatedUser;
    return result;
  }
  async findAll() {
    return await this.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        role: schema.users.role,
        email: schema.users.email,
      })
      .from(schema.users);
  }

  async findOne(id: number) {
    const results = await this.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        role: schema.users.role,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return results[0];
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.db
      .update(schema.users)
      .set(updateUserDto)
      .where(eq(schema.users.id, id))
      .returning();
  }

  async remove(id: number) {
    return await this.db.delete(schema.users).where(eq(schema.users.id, id));
  }
}