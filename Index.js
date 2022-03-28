const Discord = require('discord.js');
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] 
})

client.login("OTU2MjkwMjY5ODMyMTY3NTA0.YjuEtw.pBw-7eIQjIldsRvCMijVpCTw1VI")

client.on("ready", () => {
    console.log("ONLINE");
})

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
    if (message.content.startsWith(".play")) {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }
        
        const voiceChannelBot = message.guild.channels.cache.find(x => x.typr == "GUILD_VOICE" && x.members.has(client.user.id))
        if(voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Bot già in uso")
        }
        
        let args = message.content.split(/\s+/)
        let query = args.slice(1).join(" ")

        if (!query) {
            return message.channel.send("Inserisci la traccia musicale")
        }

        distube.play(voiceChannelBot || voiceChannel, query, {
            member: message.member,
            textChannel: message.channel,
            message: message
        })
    }

    if (message.content == ".pause") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già usando il bot")
        }

        try {
            distube.pause(message)
                .catch(() => { return message.channel.send("Nessuna traccia in riproduzione o canzone già in pausa") })
        } catch {
            return message.channel.send("Traccia in pausa")
        }

        message.channel.send("Canzone in pausa")
    }

    if (message.content == ".resume") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già usando il bot")
        }

        try {
            distube.resume(message)
                .catch(() => { return message.channel.send("Nessuna traccia in riproduzione o canzone già in riproduzione") })
        } catch {
            return message.channel.send("Traccia ripresa")
        }

        message.channel.send("Canzone ripresa")
    }

    if (message.content == ".queue") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già usando il bot")
        }

        let queue = distube.getQueue(message)

        if (!queue) return message.channel.send("Coda vuota")

        let totPage = Math.ceil(queue.songs.length / 10)
        let page = 1

        let songsList = ""
        for (let i = 10 * (page - 1); i < 10 * page; i++) {
            if (queue.songs[i]) {
                songsList += `${i + 1}. **${queue.songs[i].name.length <= 100 ? queue.songs[i].name : `${queue.songs[i].name.slice(0, 100)}...`}** - ${queue.songs[i].formattedDuration}\r`
            }
        }

        let embed = new Discord.MessageEmbed()
            .addField("Queue", songsList)
            .setFooter({ text: `Page ${page}/${totPage}` })

        let button1 = new Discord.MessageButton()
            .setLabel("Indietro")
            .setStyle("PRIMARY")
            .setCustomId("indietro")

        let button2 = new Discord.MessageButton()
            .setLabel("Avanti")
            .setStyle("PRIMARY")
            .setCustomId("avanti")

        if (page == 1) button1.setDisabled()
        if (page == totPage) button2.setDisabled()

        let row = new Discord.MessageActionRow()
            .addComponents(button1)
            .addComponents(button2)

        message.channel.send({ embeds: [embed], components: [row] })
            .then(msg => {
                const collector = msg.createMessageComponentCollector()

                collector.on("collect", i => {
                    i.deferUpdate()

                    if (i.user.id != message.author.id) return i.reply({ content: "Questo bottone non è tuo", ephemeral: true })

                    if (i.customId == "indietro") {
                        page--
                        if (page < 1) page = 1
                    }
                    if (i.customId == "avanti") {
                        page++
                        if (page > totPage) page = totPage
                    }

                    let songsList = ""
                    for (let i = 10 * (page - 1); i < 10 * page; i++) {
                        if (queue.songs[i]) {
                            songsList += `${i + 1}. **${queue.songs[i].name.length <= 100 ? queue.songs[i].name : `${queue.songs[i].name.slice(0, 100)}...`}** - ${queue.songs[i].formattedDuration}\r`
                        }
                    }

                    let embed = new Discord.MessageEmbed()
                        .addField("Queue", songsList)
                        .setFooter({ text: `Page ${page}/${totPage}` })

                    let button1 = new Discord.MessageButton()
                        .setLabel("Indietro")
                        .setStyle("PRIMARY")
                        .setCustomId("indietro")

                    let button2 = new Discord.MessageButton()
                        .setLabel("Avanti")
                        .setStyle("PRIMARY")
                        .setCustomId("avanti")

                    if (page == 1) button1.setDisabled()
                    if (page == totPage) button2.setDisabled()

                    let row = new Discord.MessageActionRow()
                        .addComponents(button1)
                        .addComponents(button2)

                    msg.edit({ embeds: [embed], components: [row] })
                })
            })
    }

    if (message.content == ".skip") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già usando il bot")
        }

        try {
            distube.skip(message)
                .catch(() => { return message.channel.send("Nessuna traccia in riproduzione o canzone successiva non presente") })
        } catch {
            return message.channel.send("Nessuna traccia in riproduzione o canzone successiva non presente")
        }

        message.channel.send("Canzone cambiata")
    }

    if (message.content == ".previous") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già usando il bot")
        }

        try {
            distube.previous(message)
                .catch(() => { return message.channel.send("Nessuna traccia in riproduzione o canzone precedente non presente") })
        } catch {
            return message.channel.send("Nessuna traccia in riproduzione o canzone precedente non presente")
        }

        message.channel.send("Traccia precedente")
    }

    if (message.content == ".stop") {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            return message.channel.send("Devi essere in un canale vocale")
        }

        const voiceChannelBot = message.guild.channels.cache.find(x => x.type == "GUILD_VOICE" && x.members.has(client.user.id))
        if (voiceChannelBot && voiceChannel.id != voiceChannelBot.id) {
            return message.channel.send("Qualun'altro sta già usando il bot")
        }

        try {
            distube.stop(message)
                .catch(() => { return message.channel.send("Nessuna canzone in riproduzione") })
        } catch {
            return message.channel.send("Nessuna canzone in riproduzione")
        }

        message.channel.send("Queue stoppata")
    }

    
})

distube.on("addSong", (queue, song) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Traccia aggiunta")
        .addField("Traccia", song.name)

    queue.textChannel.send({ embeds: [embed] })
})

distube.on("playSong", (queue, song) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Eseguo traccia...")
        .addField("Traccia", song.name)
        .addField("Richiesta da", song.user.toString())

    queue.textChannel.send({ embeds: [embed] })
})

distube.on("searchNoResult", (message, query) => {
    message.channel.send("Canzone non trovata")
});

function oraAttuale() {
    var hour = new Date().getHours();
    var minutes = new Date().getMinutes();

    var canale = client.channels.cache.get("949783943304073299");
    if (hour == 06 && minutes == 30) {
        canale.send("Buon giorno gente @everyone")
    }
}
setInterval(oraAttuale, 1000 * 60)
