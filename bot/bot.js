/*import TelegramBot from 'node-telegram-bot-api'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const userStates = {} // для отслеживания регистрации

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id

  // Проверяем, есть ли врач уже
  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('telegram_id', chatId)
    .maybeSingle()

  if (doctor) {
    return bot.sendMessage(
      chatId,
      `👋 Добро пожаловать обратно, ${doctor.full_name}!\nВы вошли как ${
        doctor.specialization || 'врач'
      }.`
    )
  }

  bot.sendMessage(
    chatId,
    `Добро пожаловать в систему NewPharm!\n\nВведите ваше <b>ФИО</b>:`,
    { parse_mode: 'HTML' }
  )
  userStates[chatId] = { step: 'full_name' }
})

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text
  if (!userStates[chatId]) return

  const state = userStates[chatId]

  switch (state.step) {
    case 'full_name':
      state.full_name = text
      state.step = 'specialization'
      bot.sendMessage(chatId, 'Введите вашу специализацию (например: Терапевт, ЛОР, Педиатр):')
      break

    case 'specialization':
      state.specialization = text
      state.step = 'experience'
      bot.sendMessage(chatId, 'Введите ваш стаж (в годах):')
      break

    case 'experience':
      state.experience = parseInt(text) || 0
      state.step = 'qualification'
      bot.sendMessage(chatId, 'Введите вашу квалификацию (например: Высшая категория):')
      break

    case 'qualification':
      state.qualification = text
      state.step = 'phone'
      bot.sendMessage(chatId, 'Введите ваш 📱 номер телефона:')
      break

    case 'phone':
      state.phone = text
      state.step = 'code'
      bot.sendMessage(chatId, 'Введите 🔑 код доступа (выдаётся администратором):')
      break

    case 'code':
      state.access_code = text

      const { error } = await supabase.from('doctors').insert([
        {
          telegram_id: chatId,
          full_name: state.full_name,
          specialization: state.specialization,
          experience: state.experience,
          qualification: state.qualification,
          phone: state.phone,
          access_code: state.access_code,
          is_verified: true,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error('Ошибка при сохранении:', error)
        bot.sendMessage(chatId, '❌ Ошибка при регистрации. Попробуйте позже.')
      } else {
        bot.sendMessage(
          chatId,
          `✅ Регистрация успешно завершена!\n\nДобро пожаловать, ${state.full_name}.\nСпециализация: ${state.specialization}\nСтаж: ${state.experience} лет\nРоль: 🩺 Врач`
        )
      }

      delete userStates[chatId]
      break
  }
})
*/