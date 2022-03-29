const { Client, Intents } = require('discord.js');

const client = new Client({ intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });

client.once('ready', () => {
    console.log('Bot online');
});

client.login("OTU2MjkwMjY5ODMyMTY3NTA0.YjuEtw.pBw-7eIQjIldsRvCMijVpCTw1VI");