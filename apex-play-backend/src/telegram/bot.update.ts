import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Update, Start, Ctx } from 'nestjs-telegraf';
import { schema } from 'src/drizzle';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { Context } from 'telegraf';

@Update()
export class BotUpdate {
    constructor() { }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        const chatId = ctx.chat.id;

        await ctx.reply(
            `မင်္ဂလာပါ 🙏\n\nသင့်ရဲ့ Telegram ID ကတော့ <code>${chatId}</code> ဖြစ်ပါတယ်။\n\n ID ကို ကူးယူပြီး Admin Portal တွင် ထည့်သွင်းပေးပါရန် သို့မဟုတ် Admin ထံ ပေးပို့ပေးပါရန်။`,
            { parse_mode: 'HTML' }
        );
    }
}