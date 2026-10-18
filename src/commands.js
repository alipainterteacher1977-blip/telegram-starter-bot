
const sessions = new Map();

const questions = [
  {
    text: "كم يساوي ١/٢ + ١/٤ ؟",
    options: ["١/٤", "٢/٦", "٣/٤", "١"],
    answer: "٣/٤"
  },
  {
    text: "ما ناتج ٢٥ × ٤ ؟",
    options: ["٥٠", "٧٥", "١٠٠", "١٢٥"],
    answer: "١٠٠"
  },
  {
    text: "ما مساحة مستطيل طوله ١٠ سم وعرضه ٥ سم؟",
    options: ["١٥ سم²", "٣٠ سم²", "٥٠ سم²", "٢٥ سم²"],
    answer: "٥٠ سم²"
  },
  {
    text: "ما ناتج ١٤٤ ÷ ١٢ ؟",
    options: ["١٠", "١١", "١٢", "١٤"],
    answer: "١٢"
  },
  {
    text: "ما ناتج ٣/٥ + ١/٥ ؟",
    options: ["٤/١٠", "٤/٥", "٣/١٠", "١"],
    answer: "٤/٥"
  }
];

export function registerCommands(bot) {
  bot.command("start", async (ctx) => {
    sessions.delete(ctx.from.id);

    await ctx.reply(
      "أهلاً بك في بوت امتحانات رياضيات السادس الابتدائي العراقي 📚\n\nاختر من القائمة:",
      {
        reply_markup: {
          keyboard: [
            [{ text: "📝 بدء امتحان الرياضيات" }],
            [{ text: "📊 نتيجتي" }]
          ],
          resize_keyboard: true
        }
      }
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "📚 أوامر البوت:\n/start — القائمة الرئيسية\n/help — المساعدة\n\nابدأ الامتحان من زر بدء امتحان الرياضيات."
    );
  });

  bot.command("ping", (ctx) => ctx.reply("البوت يعمل ✅"));

  bot.command("id", (ctx) =>
    ctx.reply(`رقم حسابك: ${ctx.from.id}`)
  );

  bot.on("message:text", async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    if (text === "📝 بدء امتحان الرياضيات") {
      sessions.set(userId, { index: 0, score: 0 });
      return sendQuestion(ctx, userId);
    }

    if (text === "📊 نتيجتي") {
      const session = sessions.get(userId);

      if (session?.finished) {
        return ctx.reply(
          `📊 آخر نتيجة لك: ${session.score} من ${questions.length}\nالنسبة: ${Math.round(session.score * 100 / questions.length)}٪`
        );
      }

      return ctx.reply("لم تكمل امتحاناً بعد. اضغط 📝 بدء امتحان الرياضيات.");
    }

    const session = sessions.get(userId);
    if (!session || session.finished) return;

    const question = questions[session.index];

    if (!question.options.includes(text)) {
      return ctx.reply("يرجى اختيار إجابة من الأزرار الظاهرة.");
    }

    if (text === question.answer) {
      session.score++;
      await ctx.reply("إجابة صحيحة ✅");
    } else {
      await ctx.reply(`إجابة غير صحيحة ❌\nالإجابة الصحيحة: ${question.answer}`);
    }

    session.index++;

    if (session.index >= questions.length) {
      session.finished = true;
      const percent = Math.round(session.score * 100 / questions.length);

      return ctx.reply(
        `🎉 انتهى الامتحان!\n\nعدد الإجابات الصحيحة: ${session.score} من ${questions.length}\nدرجتك: ${percent} من 100\n\nاضغط 📝 بدء امتحان الرياضيات لإعادة الامتحان.`
      );
    }

    return sendQuestion(ctx, userId);
  });
}

async function sendQuestion(ctx, userId) {
  const session = sessions.get(userId);
  const question = questions[session.index];

  await ctx.reply(
    `📝 السؤال ${session.index + 1} من ${questions.length}\n\n${question.text}`,
    {
      reply_markup: {
        keyboard: question.options.map(option => [{ text: option }]),
        resize_keyboard: true,
        one_time_keyboard: true
      }
    }
  );
}
