
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Crear el bot de Discord
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

bot.once('ready', () => {
    console.log(`Bot conectado como ${bot.user.tag}`);
});

// Endpoint para recibir los datos del formulario
app.post('/zend', async (req, res) => {
    const data = req.body;

    if (!data || !data.discord || !/^.{2,32}#\d{4}$/.test(data.discord)) {
        return res.status(400).json({ message: 'Formato de Discord inválido o datos incompletos.' });
    }

    const channelStaff = await bot.channels.fetch(process.env.DISCORD_CHANNEL_PRIVATE);
    const channelPublic = await bot.channels.fetch(process.env.DISCORD_CHANNEL_PUBLIC);

    const formMessage = `📝 **Nuevo formulario Zeropass recibido**\n\n` +
        Object.entries(data).map(([key, value]) => `**${key}**: ${value}`).join('\n');

    try {
        await channelStaff.send(formMessage);
        await channelPublic.send(`@everyone ${data.discord}, tu formulario se ha enviado correctamente. En breves te daremos tu resultado. Gracias por enviarnos tu formulario.`);
        res.status(200).json({ message: 'Formulario enviado con éxito.' });
    } catch (err) {
        console.error('Error enviando a Discord:', err);
        res.status(500).json({ message: 'Error al enviar el formulario a Discord.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

bot.login(process.env.DISCORD_BOT_TOKEN);
