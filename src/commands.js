
import { InlineKeyboard } from "grammy";

const questions = [
  {
    q: "كم يساوي ٣ × ٢؟",
    options: ["٩", "٨", "٦", "٤"],
    answer: "٦"
  },
  {
    q: "كم يساوي ٢٥ × ٤؟",
    options: ["١٢٥", "١٠٠", "٧٥", "٥٠"],
    answer: "١٠٠"
  },
  {
    q: "ما مساحة مستطيل طوله ١٠ سم وعرضه ٥ سم؟",
    options: ["١٥", "٥٠", "٣٠", "٢٥"],
    answer: "٥٠"
  }
];

const sessions = new Map();

export function registerCommands(bot) {
  bot.command("start", async (ctx) => {
    sessions.set(ctx.from.id, { index: 0, score: 0 });
    await ctx.reply(
      "أهلاً بك في اختبار رياضيات السادس الابتدائي 🇮🇶\n\nاكتب /quiz لبدء الاختبار."
    );
  });

  bot.command("quiz", async (ctx) => {
    sessions.set(ctx.from.id, { index: 0, score: 0 });
    await sendQuestion(ctx);
  });

  bot.command("help", async (ctx) => {
    await ctx.reply("لبدء الاختبار اكتب /quiz\nلإعادة الاختبار اكتب /quiz");
  });

  async function sendQuestion(ctx) {
    const session = sessions.get(ctx.from.id);

    if (!session || session.index >= questions.length) {
      await ctx.reply(
        `انتهى الاختبار ✅\nدرجتك: ${session?.score ?? 0} من ${questions.length}\n\nلإعادة الاختبار اكتب /quiz`
      );
      return;
    }

    const question = questions[session.index];
    const keyboard = new InlineKeyboard();

    question.options.forEach((option, j) => {
      keyboard.text(option, `answer_${session.index}_${j}`).row();
    });

    await ctx.reply(
      `السؤال ${session.index + 1} من ${questions.length}\n\n${question.q}`,
      { reply_markup: keyboard }
    );
  }

  questions.forEach((question, i) => {
    question.options.forEach((option, j) => {
      bot.callbackQuery(`answer_${i}_${j}`, async (ctx) => {
        const session = sessions.get(ctx.from.id);

        if (!session || session.index !== i) {
          await ctx.answerCallbackQuery({
            text: "هذا السؤال انتهى. اكتب /quiz للبدء من جديد."
          });
          return;
        }

        await ctx.answerCallbackQuery();

        if (option === question.answer) {
          session.score++;
          await ctx.reply("إجابة صحيحة ✅");
        } else {
          await ctx.reply(`إجابة غير صحيحة ❌\nالإجابة الصحيحة: ${question.answer}`);
        }

        session.index++;
        await sendQuestion(ctx);
      });
    });
  });
}
