import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);

    constructor(@InjectBot() private bot: Telegraf<Context>) { }
    async sendOTP(tgid: string, otpCode: string): Promise<boolean> {
        const message = `<b>Admin Portal OTP</b>\n\nYour code is: <code>${otpCode}</code>\n\nExpires in 5 minutes.`;
        try {
            await this.bot.telegram.sendMessage(tgid, message, { parse_mode: 'HTML' });
            return true;
        } catch (error) {
            this.logger.error(`Telegram OTP error for ID ${tgid}: ${error.message}`);
            return false;
        }
    }
    async sendLoginAlert(tgid: string, userName: string) {
        const alert = `<b>Login Success</b>\nUser <b>${userName}</b> has just accessed the portal.`;
        try {
            await this.bot.telegram.sendMessage(tgid, alert, { parse_mode: 'HTML' });
        } catch (error) {
            this.logger.error(`Alert error: ${error.message}`);
        }
    }
}