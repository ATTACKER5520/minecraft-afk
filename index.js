const express = require('express');
const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3');

const app = express();
let bot;
let shouldBreakLogs = false;

const config = {
  host: 'hypixel.uz',
  port: 25566,
  version: '1.12',
  username: 'BREACKER6',
  password: 'abdu2006',
  loginPassword: '2000609',
  controller: 'ATTACKER'
};

function startBot() {
  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    version: config.version,
    username: config.username
  });

  bot.on('messagestr', (message) => {
    console.log(message);
    if (message.includes('/register')) {
      bot.chat(`/register ${config.password} ${config.password}`);
    }
    if (message.includes('/login')) {
      bot.chat(`/login ${config.loginPassword}`);
    }
  });

  bot.on('chat', (username, message) => {
    if (username === config.controller) {
      if (message.startsWith('+ ')) {
        const toSay = message.replace('+ ', '');
        bot.chat(toSay);
      } else if (message === 'tpat1') {
        bot.chat(`/tpa ${config.controller}`);
      } else if (message === 'BR') {
        shouldBreakLogs = true;
        bot.chat('🪓 Log buzish boshlandi!');
      }
    }
  });

  bot.on('death', () => {
    bot.chat('/back');
    bot.chat(`/w ${config.controller} AT_OROL_1 uldi`);
  });

  bot.on('spawn', () => {
    console.log('✅ Bot spawn bo‘ldi!');

    setTimeout(() => {
      bot.chat('/is warp farm');
      console.log('/is warp farm komandasi yuborildi');

      // Har 4 daqiqada 1 marta sakrash
      setInterval(() => {
        bot.setControlState('jump', true);
        setTimeout(() => {
          bot.setControlState('jump', false);
        }, 500);
      }, 4 * 60 * 1000);

      // Har 1 soniyada loglarni tekshirish va buzish (faqat BR komandasi berilganda)
      setInterval(() => {
        if (!shouldBreakLogs) return;

        ensureAxeEquipped();

        const blocks = bot.findBlocks({
          matching: block => block.name === 'oak_log' || block.name === 'stripped_oak_log',
          maxDistance: 6,
          count: 1
        });

        if (blocks.length > 0) {
          const block = bot.blockAt(blocks[0]);
          if (block && bot.canDigBlock(block)) {
            bot.dig(block).catch(err => console.log('❌ Buzishda xato:', err.message));
          }
        }

        // Inventardagi loglarni otib yuborish
        const dropItems = bot.inventory.items().filter(item =>
          item.name === 'oak_log' || item.name === 'stripped_oak_log'
        );

        if (dropItems.length > 0) {
          for (const item of dropItems) {
            bot.tossStack(item).catch(err => console.log('❌ Item otishda xato:', err.message));
          }
        }
      }, 1000);

    }, 5000);
  });

  function ensureAxeEquipped() {
    const axe = bot.inventory.items().find(item => item.name === 'diamond_axe');
    if (!axe) {
      console.log('❌ Inventoryda diamond_axe yo‘q');
      return;
    }

    if (!bot.heldItem || bot.heldItem.name !== 'diamond_axe') {
      bot.equip(axe, 'hand').catch(err => console.log('❌ Axe ushlashda xato:', err.message));
    }
  }

  bot.on('end', () => {
    console.log('⚠️ Bot serverdan chiqdi. Qayta ulanmoqda...');
    setTimeout(startBot, 5000);
  });

  bot.on('error', err => {
    console.log('❌ Bot xatolik berdi:', err.message);
  });
}

// Botni ishga tushiramiz
startBot();

// UptimeRobot uchun web server
app.get('/', (req, res) => {
  res.send('✅ Bot ishlayapti!');
});
app.listen(3000, () => {
  console.log('🌐 Web server ishga tushdi (port 3000)');
});
