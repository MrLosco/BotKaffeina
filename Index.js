const Discord = require('discord.js');
global.client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] 
})

client.login("OTU2MjkwMjY5ODMyMTY3NTA0.YjuEtw.pBw-7eIQjIldsRvCMijVpCTw1VI")

client.on("ready", () => {
    console.log("ONLINE");
})

const fs = require("fs");

client.commands = new Discord.Collection();

const commandsFile = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for(const file of commandsFile) {
    var command = require('./commands/${file}');
    client.commands.set(command.name, command);
}

const { DisTube } = require("distube")

const { SpotifyPlugin} = require("@distube/spotify")
const { SoundCloudPlugin } = require("@distube/soundcloud")

const distube = new DisTube(client, {
    youtubeDL: false,
    plugins: [new SpotifyPlugin(), new SoundCloudPlugin()],
    leaveOnEmpty: true,
    leaveOnStop: true
})

client.on("messageCreate", message => {
    const prefix = "."

    if(!message.content.startWith(prefix)) return

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLoverCase();

    if(!client.commands.has(command)) return

    client.command.get(command).execute(messageCreate, args);
})