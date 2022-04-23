const Discord = require('discord.js');
const ytch = require('yt-channel-info');
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] 
})

client.login(process.env.token)

client.on("ready", () => {
    console.log("BOT ONLINE by MrLosco dev");
    client.user.setActivity('.help'),{
        type: 'LISTENING'
    }
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
//COMANDO PLAY MUSICA
client.on("messageCreate", message => {
    if (message.content.startsWith(".play")) {
        if(message.channel.id != "951428104633589780") return message.channel.send("devi essere nel canale Musica per digitare il comando")
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
//COMANDO PAUSE MUSICA
    if (message.content == ".pause") {
        if(message.channel.id != "951428104633589780") return message.channel.send("devi essere nel canale Musica per digitare il comando")
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
//COMANDO RESUME MUSICA 
    if (message.content == ".resume") {
        if(message.channel.id != "951428104633589780") return message.channel.send("devi essere nel canale Musica per digitare il comando")
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
//COMANDO QUEUE MUSICA
    if (message.content == ".queue") {
        if(message.channel.id != "951428104633589780") return message.channel.send("devi essere nel canale Musica per digitare il comando")
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
//COMANDO SKIP MUSICA 
    if (message.content == ".skip") {
        if(message.channel.id != "951428104633589780") return message.channel.send("devi essere nel canale Musica per digitare il comando")
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
//COMANDO PREVIOUS MUSICA
    if (message.content == ".previous") {
        if(message.channel.id != "951428104633589780") return message.channel.send("devi essere nel canale Musica per digitare il comando")
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
//COMANDO STOP MUSICA
    if (message.content == ".stop") {
        if(message.channel.id != "951428104633589780") return message.channel.send("devi essere nel canale Musica per digitare il comando")
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
//COMANDO LINK
    if (message.content == ".link") {
        const linkEmbed = new Discord.MessageEmbed()
        .setColor('#b45fed')
        .setTitle('🔗 Lista Link 🔗')
        .setDescription('Lista in aggiornamento...⚙️')
        .addField('BotKaffeina ', 'https://github.com/MrLosco/BotKaffeina')
        .addField('OmegaClick ', 'https://www.youtube.com/c/OmegaClick6')
        .addField('I\'m Salvatore MoD', 'https://www.youtube.com/channel/UCNb3JAgwBtJ0tXtJHHKXKJA')
        .addField('Gruppo Telegram', 'https://t.me/+-iJRpukkPGU4MzI0')
        .addField('NASA', 'https://www.nasa.gov/content/live-coverage-of-the-soyuz-ms-19-crew-return-to-earth')
        message.channel.send({ embeds: [linkEmbed] });
    
    }
//INFORMAZIONI SUI MEMBRI 
    if (message.content.startsWith(".userinfo")) {
    if (message.content == ".userinfo") {
        var utente = message.member;
        }
     else {
        var utente = message.mentions.members.first();
        }
    if (!utente) {
        return message.channel.send("Non ho trovato questo utente")
        }
        var elencoPermessi = "";
    if (utente.permissions.has("ADMINISTRATOR")) {
            elencoPermessi = "👑 ADMINISTRATOR";
        }
    else {
        var permessi = ["CREATE_INSTANT_INVITE", "KICK_MEMBERS", "BAN_MEMBERS", "ADMINISTRATOR", "MANAGE_CHANNELS", "MANAGE_GUILD", "ADD_REACTIONS", "VIEW_AUDIT_LOG", "PRIORITY_SPEAKER", "STREAM", "VIEW_CHANNEL", "SEND_MESSAGES", "SEND_TTS_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "VIEW_GUILD_INSIGHTS", "CONNECT", "SPEAK", "MUTE_MEMBERS", "DEAFEN_MEMBERS", "MOVE_MEMBERS", "USE_VAD", "CHANGE_NICKNAME", "MANAGE_NICKNAMES", "MANAGE_ROLES", "MANAGE_WEBHOOKS", "MANAGE_EMOJIS_AND_STICKERS", "USE_APPLICATION_COMMANDS", "REQUEST_TO_SPEAK", "MANAGE_THREADS", "CREATE_PUBLIC_THREADS", "CREATE_PRIVATE_THREADS", "USE_EXTERNAL_STICKERS", "SEND_MESSAGES_IN_THREADS", "START_EMBEDDED_ACTIVITIES"]
    for (var i = 0; i < permessi.length; i++)
    if (utente.permissions.has(permessi[i]))
                elencoPermessi += `- ${permessi[i]}\r`
        }
        var embedUserinfo = new Discord.MessageEmbed()
            .setTitle(utente.user.tag)
            .setDescription("Tutte le info di questo utente")
            .setThumbnail(utente.user.displayAvatarURL())
            .addField("User id", utente.user.id, true)
            .addField("Stato", utente.presence ? utente.presence.status : "offline", true)
            .addField("è un bot?", utente.user.bot ? "Yes" : "No", true)
            .addField("Account creato", utente.user.createdAt.toDateString(), true)
            .addField("Entrato nel server", utente.joinedAt.toDateString(), true)
            .addField("Permessi", elencoPermessi, false)
            .addField("Ruoli", utente.roles.cache.map(ruolo => ruolo.name).join("\r"), false)
        message.channel.send({ embeds: [embedUserinfo] })
    }
})
//PARTE COMANDO MUSICA
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
})

//NOTIFICA CON ORARIO IMPOSTATO 
function oraAttuale() {
    var hour = new Date().getHours();
    var minutes = new Date().getMinutes();

    var canale = client.channels.cache.get("949783943304073299");
    if (hour == 06 && minutes == 30) {
        canale.send("Buon giorno gente @everyone")
    }
    if (hour == 10 && minutes == 0) {
        canale.send("Buon pranzo @everyone")
    }
    if (hour == 17 && minutes == 30) {
        canale.send("Buona cena @everyone")
    }
    if (hour == 21 && minutes == 30) {
        canale.send("Buonanotte ragazzuoli @everyone")
    }    
    
}
setInterval(oraAttuale, 1000 * 10)

//NOTIFICA USCITA NUOVO VIDEO OMEGACLICK
setInterval(() => {
    ytch.getChannelVideos("UCLrgUeP56dUPUwp4vCy6RIQ", "newest").then(async response => {
        var idVideo = response.items[0]?.videoId
        if (!idVideo) return

        client.channels.cache.get("959168230965006356").messages.fetch()
            .then(messages => {
                var giaMandato = false;
                messages.forEach(msg => {
                    if (msg.content.includes(idVideo)) giaMandato = true;
                });

                if (!giaMandato) {
                    client.channels.cache.get("959168230965006356").send(`-------------📽️ __**NUOVO VIDEO**__ 📽️ -------------


@everyone, è appena uscito un video su **${response.items[0].author}**
Correte a vedere "${response.items[0].title}"


https://www.youtu.be/${idVideo}`)
                }
            })
    })
}, 1000 * 60)

//NOTIFICA USCITA NUOVO VIDEO IM SALVATORE MOD
setInterval(() => {
    ytch.getChannelVideos("UCNb3JAgwBtJ0tXtJHHKXKJA", "newest").then(async response => {
        var idVideo = response.items[0]?.videoId
        if (!idVideo) return

        client.channels.cache.get("959168230965006356").messages.fetch()
            .then(messages => {
                var giaMandato = false;
                messages.forEach(msg => {
                    if (msg.content.includes(idVideo)) giaMandato = true;
                });

                if (!giaMandato) {
                    client.channels.cache.get("959168230965006356").send(`-------------👨‍💻 __**NUOVO VIDEO**__ 👨‍💻-------------


@everyone, è appena uscito un video su **${response.items[0].author}**
Correte a vedere "${response.items[0].title}"


https://www.youtu.be/${idVideo}`)
                }
            })
    })
}, 1000 * 10)

//MESSAGGIO DI BENVENUTO 

client.on("guildMemberAdd", member => {
    if (member.user.bot) return
    var embedCiao = new Discord.MessageEmbed()
        .setTitle("BENVENUTO")
        .setDescription(`Ciao ${member.toString()}, benvenuto nel ${member.guild.name}. Sei il **${member.guild.memberCount}Â° Membro**`)
        .setThumbnail(member.displayAvatarURL())
        .addField("User id",member.user.id, true)
        .addField("Stato", member.presence ? member.presence.status : "offline", true)
        .addField("è un bot?", member.user.bot ? "Yes" : "No", true)
        .addField("Account creato", member.user.createdAt.toDateString(), true)

    client.channels.cache.get("949783943304073296").send({embeds: [embedCiao]});  
})

//MESSAGGIO DI ADDIO 
client.on("guildMemberRemove", member => {
    
    var embedAddio = new Discord.MessageEmbed()
        .setTitle("TORNA A TROVARCI")
        .setDescription(`A presto ${member.toString()}!, spero di rivederti da queste parti nel ${member.guild.name}`)

    client.channels.cache.get("949783943304073296").send({embeds: [embedAddio]}); 
})

//SERVER INFO
client.on("messageCreate", message => {
    if (message.content == ".serverinfo") {
        var server = message.guild;
        var embedServer = new Discord.MessageEmbed()
            .setTitle(server.name)
            .setDescription("INFO SERVER")
            .setThumbnail(server.iconURL())
            .addField("Amministratore", client.users.cache.get(server.ownerId).username, true)
            .addField("Server id", server.id, true)
            .addField("Membri", server.memberCount.toString(), false)
            .addField("Canali", server.channels.cache.size.toString(), false)
            .addField("Data creazione server", server.createdAt.toDateString(), true)
            .addField("Livello Boost", "Livello " + (server.premiumTier != "NONE" ? server.premiumTier : 0) + " (Boost: " + server.premiumSubscriptionCount + ")", true)
        message.channel.send({ embeds: [embedServer] })
    }
})
//CHANNELINFO

client.on("messageCreate", message => {
    if (message.content.startsWith(".channelinfo")) {
        if (message.content == ".channelinfo") {
            var canale = message.channel;
        }
        else {
            var canale = message.mentions.channels.first();
        }
        if (!canale) {
            return message.channel.send("Canale non trovato");
        }
        switch (canale.type) {
            case "GUILD_TEXT": canale.type = "Testo"; break;
            case "GUILD_VOICE": canale.type = "Voce"; break;
            case "GUILD_CATEGORY": canale.type = "Categoria"; break;
        }
        if (canale.type == "Voice") {
            var embed = new Discord.MessageEmbed()
                .setTitle(canale.name)
                .setDescription("Tutte le statistiche su questo canale")
                .addField("Channel ID", canale.id, true)
                .addField("Tipologia", canale.type, true)
                .addField("Posizione", canale.rawPosition.toString(), true)
                .addField("Categoria", `<#${canale.parentId}>`, true)
                .addField("Bitrate", canale.bitrate.toString(), true)
                .addField("User limit", canale.userLimit == 0 ? "∞" : canale.userLimit.toString(), true)
            return message.channel.send({ embeds: [embed] })
        }
        if (canale.type == "Category") {
            var embed = new Discord.MessageEmbed()
                .setTitle(canale.name)
                .setDescription("Tutte le statistiche su questa categoria")
                .addField("Category ID", canale.id, true)
                .addField("Tipologia", canale.type, true)
                .addField("Posizione", canale.rawPosition.toString(), true)
                .addField("Data di creazione", canale.createdAt.toDateString())
            return message.channel.send({ embeds: [embed] })
        }
        var embed = new Discord.MessageEmbed()
            .setTitle(canale.name)
            .setDescription("Tutte le statistiche su questo canale")
            .addField("Channel ID", canale.id, true)
            .addField("Tipologia", canale.type, true)
            .addField("Posizione", canale.rawPosition.toString(), true)
            .addField("Categoria", `<#${canale.parentId}>`, true)
            .addField("Topic", !canale.topic ? "No topic" : canale.topic, true)
            .addField("NSFW", canale.nsfw ? "yes" : "No", true)
            .addField("Data di creazione", canale.createdAt.toDateString())
        message.channel.send({ embeds: [embed] })
    }
})

//COMANDO PER NEWS CANALE YOUTUBE (OMEGACLICK)
client.on('messageCreate', message => {
if (message.content == ".omega") {
    const channelId = 'UCLrgUeP56dUPUwp4vCy6RIQ' 
    ytch.getChannelVideos(channelId, "newest").then((response) => {
         var embedOmega = new Discord.MessageEmbed()
            .setTitle(response.items[0].title)
            .setURL("https://www.youtube.com/watch?v=" + response.items[0].videoId)
            .setThumbnail(response.items[0].videoThumbnails[3].url)
            .addField("Views", response.items[0].viewCount.toString(), true)
            .addField("Durata", response.items[0].durationText, true)
            .addField("Data Pubblicazione", response.items[0].publishedText, true)
        message.channel.send({embeds: [embedOmega] })
      })
    }
})

 //COMANDO PER NEWS CANALE YOUTUBE (I'M SALVATORE MOD)
client.on('messageCreate', message => {
if (message.content == ".salvo") {
    const channelId = 'UCNb3JAgwBtJ0tXtJHHKXKJA' 
    ytch.getChannelVideos(channelId, "newest").then((response) => {
        var embedSalvo = new Discord.MessageEmbed()
            .setTitle(response.items[0].title)
            .setURL("https://www.youtube.com/watch?v=" + response.items[0].videoId)
            .setThumbnail(response.items[0].videoThumbnails[3].url)
            .addField("Views", response.items[0].viewCount.toString(), true)
            .addField("Durata", response.items[0].durationText, true)
            .addField("Data Pubblicazione", response.items[0].publishedText, true)
        message.channel.send({embeds: [embedSalvo] })
      })
    }
})       

//LATENZA BOT
client.on("messageCreate", message => {
    if (message.content == ".ping") {
        var embed = new Discord.MessageEmbed()
            .setTitle("Ping del bot")
            .setDescription("Latenza del bot")
            .addField("Ping", `${client.ws.ping}ms`)
            .addField(":floppy_disk: Ram", `${(process. memoryUsage(). heapUsed / 1024 / 1024). toFixed(2)} MB`, true)

        message.channel.send({embeds: [embed]})
    }
})
/*
//COMANDO HELP REVISIONATO

client.on('messageCreate', message => {
    if (message.content == ".help") {
        let embedCategorie = new Discord.MessageEmbed()
        .setTitle("LISTA CATEGORIE")
        .setDescription("clicca il bottone per la categoria desiderata")
        .setColor("DARK_AQUA")
        
        let bottoneMusica = new Discord.MessageButton()
        .setLabel("🎵 musica🎶")
        .setStyle("PRIMARY")
        .setCustomId("musica")

        let bottoneInfo = new Discord.MessageButton()
        .setLabel("❓info comandi❓")
        .setStyle("PRIMARY")
        .setCustomId("info")

        let bottoneLink = new Discord.MessageButton()
        .setLabel("🔗link🔗")
        .setStyle("SECONDARY")
        .setCustomId("link")

        let bottoneCanaliyt = new Discord.MessageButton()
        .setLabel("Ultimo aggiornamento canali YouTube")
        .setStyle("SUCCESS")
        .setCustomId("canaliyt")

        let bottoneExit = new Discord.MessageButton()
        .setLabel("❌EXIT❌")
        .setStyle("DANGER")
        .setCustomId("exit")

        let row1 = new Discord.MessageActionRow()
        .addComponents(bottoneMusica)
        .addComponents(bottoneInfo)
        .addComponents(bottoneLink)
        .addComponents(bottoneCanaliyt)

        let rowExit = new Discord.MessageActionRow()
        .addComponents(bottoneExit)

        message.channel.send({ embeds: [embedCategorie], components: [row1, rowExit]})
        .then(msg => {
            const collector = msg.createMessageComponentCollector()

            collector.on("collect", i => {
                i.deferUpdate()
                if (i.customId == "musica") {
                    var embedMusica = new Discord.MessageEmbed()
                    .setColor('DARK_GREY')
                    .setTitle('Lista Comandi musica')
                    .addField('Play ▶️', '.play link YouTube Spotify SoundCloud')
                    .addField('Pausa ⏸️', '.pause')
                    .addField('Riprendi Traccia ⏯️', '.resume')
                    .addField('Lista Tracce 📝', '.queue')
                    .addField('Traccia Successiva ⏩', '.skip')
                    .addField('Traccia Precedente ⏮️', '.previous')
                    .addField('Stoppare Traccia ⏹️', '.stop')

                    msg.edit({ embeds: [embedMusica], components: null })

                }

                if (i.customId == "info") {
                    var embedInfo = new Discord.MessageEmbed()
                    .setColor('DARK_GREY')
                    .setTitle('Lista Comandi')
                    .addField('Informazioni utente 👤❓', ".userinfo @(utente da menzionare)")
                    .addField('Informazioni server 📊❓', ".serverinfo")
                    .addField('Informazioni canale 🗄️❓', ".channelinfo")
                    .addField('Informazioni avatar❓❓', ".guarda")
                    .addField('🔌❓ Informazioni ping bot e ram utente 💾❓', ".ping")
                    .addField('Lista Argomenti', '.argomenti')

                    msg.edit({ embeds: [embedInfo], components: null })
                }

                if (i.customId == "link") {
                    var embedLink = new Discord.MessageEmbed()
                    .setColor('DARK_GREY')
                    .setTitle('Lista Link Utili')
                    .setDescription('Lista link in aggiornamento...⚙️')

                    let bottoneLink1 = new Discord.MessageButton()
                    .setLabel("BotKaffeina")
                    .setStyle("LINK")
                    .setURL("https://github.com/MrLosco/BotKaffeina")

                    let bottoneLink2 = new Discord.MessageButton()
                    .setLabel("Gruppo Telegram")
                    .setStyle("LINK")
                    .setURL("https://t.me/+-iJRpukkPGU4MzI0")

                    let bottoneLink3 = new Discord.MessageButton()
                    .setLabel("I\'m Salvatore Mod")
                    .setStyle("LINK")
                    .setURL("https://www.youtube.com/channel/UCNb3JAgwBtJ0tXtJHHKXKJA")

                    let bottoneLink4 = new Discord.MessageButton()
                    .setLabel("OmegaClick")
                    .setStyle("LINK")
                    .setURL("https://www.youtube.com/c/OmegaClick6")                                        
                
                    let row2 = new Discord.MessageActionRow()
                    .addComponents(bottoneLink1)
                    .addComponents(bottoneLink2)
                    .addComponents(bottoneLink3)
                    .addComponents(bottoneLink4)
                     
                    
                    
                    msg.edit({ embeds: [embedLink], components: [row2, rowExit, row1] })
                }

                if (i.customId == "canaliyt") {
                    var canaliytembed = new Discord.MessageEmbed()
                    .setTitle("COMANDI ULTIMI AGGIORNAMENTI CANALI YOUTUBE")
                    .setDescription("Lista canali in aggiornamento...⚙️")
                    .addField('OmegaClick', ".omega" )
                    .addField('I\'m Salvatore MoD', ".salvo")

                    msg.edit({ embeds : [canaliytembed], components: [row1, rowExit]})

                }
                
                if (i.customId == "exit") {
                    var Exitembed = new Discord.MessageEmbed()
                    .setTitle("USCITA")
                    .setDescription(`Alla prossima!, ricordati il comando .help`)
                    .setColor("DARK_NAVY")
                    
                    msg.channel.send({ embeds: [Exitembed]})
                }
            })
        })     
    }
})
*/
//AVATAR INFO
client.on("messageCreate", message => {
    if (message.content.startsWith(".guarda")) {
        if (message.content == ".guarda") {
            var utente = message.member;
        }
        else {
            var utente = message.mentions.members.first();
        }
        if (!utente) {
            return message.channel.send("Membro non trovato")
        }
        var embedAvatar = new Discord.MessageEmbed()
            .setTitle(utente.user.tag)
            .setDescription("L'avatar di questo membro")
            .setImage(utente.user.displayAvatarURL({
                dynamic: true,
                format: "png",
                size: 512
            }))
        message.channel.send({ embeds: [embedAvatar] })
    }
})
//COMANDO ANONIMO 
client.on("messageCreate", message => {
    if (message.content.startsWith(".anon")) {
        var args = message.content.split(/\s+/);
        const Manonimo = args.slice(1).join(" ");
        if (!Manonimo) {
            return message.channel.send("Inserire un messaggio");
        }
        message.delete()
        var embedAnonimo = new Discord.MessageEmbed()
            .setTitle("Anonimo")
            .setDescription(Manonimo)

        message.channel.send({embeds: [embedAnonimo]})
    }
})
//COMANDO NOTIFICA, FIX E UPDATE MANUALE IN CANALE PRESELEZIONATO
client.on("messageCreate", message => {
    if (message.content.startsWith(".notifica")) {
        var args = message.content.split(/\s+/);
        const Mmnotifica = args.slice(1).join(" ");
        if (!Mmnotifica) {
            return message.channel.send("Inserire un messaggio");
        }
        message.delete()
        var embedMnotifica = new Discord.MessageEmbed()
            .setTitle("__Notifica Bot__")
            .setDescription(Mmnotifica)
        var canale = client.channels.cache.get("949783943304073299")
        canale.send({embeds: [embedMnotifica]})
    };

    if (message.content.startsWith(".fix")) {
        var args = message.content.split(/\s+/);
        const mFix = args.slice(1).join(" ");
        if (!mFix) {
            return message.channel.send("Inserire un messaggio");
        }
        message.delete()
        var embedFix= new Discord.MessageEmbed()
            .setTitle("__Lista Fix__")
            .setDescription("🛠️" + " " + " " + mFix + " " + "🛠️")
        var canale = client.channels.cache.get("949783943304073299")
        canale.send({embeds: [embedFix]})
    };

    if (message.content.startsWith(".update")) {
        var args = message.content.split(/\s+/);
        const mUpdate = args.slice(1).join(" ");
        if (!mUpdate) {
            return message.channel.send("Inserire un messaggio");
        }
        message.delete()
        var embedUpdate= new Discord.MessageEmbed()
            .setTitle("__Aggiornamenti Bot__")
            .setDescription("⚙️" + " " + " " + mUpdate + " " + "⚙️" )
        var canale = client.channels.cache.get("949783943304073299")
        canale.send({embeds: [embedUpdate]})
    }
    
})
//DROP MENU'
client.on("messageCreate", async message => {
    if (message.content == ".argomenti") {
        const rowArgomenti = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageSelectMenu()
            .setCustomId('argomenti')
            .setPlaceholder('Seleziona l\'argomento che desideri')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                {
                    label: 'Ufo e Astrologia',
                    description: 'tutto su Ufo e astrologia',
                    value: 'ufo',
                },
                {
                    label: 'Tecnologia',
                    description: 'Informazioni utili tecnologia',
                    value: 'tecno',
                },
            ])
            
            
        );
        const embedArgomenti = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle('__**LISTA ARGOMENTI**__')
        .setDescription('*Tutti gli argomenti trattati*')

        message.channel.send({ embeds: [embedArgomenti], components: [rowArgomenti] })
        .then(msg => {
            const collector = msg.createMessageComponentCollector()

            collector.on("collect", i => {
                i.deferUpdate()
                if (i.isSelectMenu()) {
                    let choice = i.values[0]
                    const member =i.member
                    if (choice == 'ufo') {
                        var embedUfo = new Discord.MessageEmbed()
                        .setColor('DARKER_GREY')
                        .setTitle('🛸***Ufo e Astrologia***🔭⭐')
                        .addField('🛰️Canale YouTube NASA🛰️', 'https://youtube.com/c/NASA')
                        .addField('Canale YouTube UFO Sightings Daily', 'https://youtube.com/c/ScottWaring')
                        .addField('Canale YouTube OmegaClick', 'https://www.youtube.com/c/OmegaClick6')
                        .addField('Canale Instagram Cavaliere Mascherato', 'https://instagram.com/lucioo.ferrara?igshid=YmMyMTA2M2Y=')
                        msg.edit({ embeds: [embedUfo] })
                    }
                    if (choice == 'tecno') {
                        var embedTecnologia = new Discord.MessageEmbed()
                        .setColor('DARK_AQUA')
                        .setTitle('🤖***Tecnologia***💻')
                        .addField('Canale YouTube I\'m Salvatore MoD', 'https://www.youtube.com/channel/UCNb3JAgwBtJ0tXtJHHKXKJA')
                        .addField('Crea la tua mappa, direttamente con il tuo pc in formato "digitale" utilizzando questa app', 'https://www.xmind.net/')
                        .addField('Tema sulla Nascita WWW, world wide web & Tecnologie di Sviluppo Html, CSS, Javascript', 'https://amslaurea.unibo.it/4067/1/tessarini_jennifer_tesi.pdf')
                        .addField('La privacy e la sicurezza informatica è caratterizzata da un processo non da una singola soluzione. Approfondimenti qui', 'https://www.whonix.org/wiki/FAQ')
                        .addField('Approfondimento video', 'https://youtu.be/wX75Z-4MEoM')
                        msg.edit({ embeds: [embedTecnologia] })
                    }
                }
            })
        })
        }

        
})

//COMANDO HELP 3.0
client.on("messageCreate", async message => {
    if (message.content == ".help") {
        const rowHelp = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageSelectMenu()
            .setCustomId('LiìISTA COMANI PER CATEGORIA')
            .setPlaceholder('Seleziona i comandi che desideri che desideri')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                {
                    label: '🎵 musica🎶',
                    description: 'Comandi attuali musica',
                    value: 'musica',
                },
                {
                    label: '❓Informazioni e utilità❓',
                    description: 'Comandi informativi e utili',
                    value: 'info',
                },
                {
                    label: '🔗Link e canali YouTube🔗',
                    description: 'Link utili e comandi per canali YouTube',
                    value: 'link'
                }
            ])
            
            
        );
        const embedHelp = new Discord.MessageEmbed()
        .setColor('#409')
        .setTitle('__**LISTA COMANDI PER CATEGORIA**__')
        .setDescription('*Tutti i comandi del bot*')

        message.channel.send({ embeds: [embedHelp], components: [rowHelp] })
        .then(msg => {
            const collector = msg.createMessageComponentCollector()

            collector.on("collect", i => {
                i.deferUpdate()
                if (i.isSelectMenu()) {
                    let choice = i.values[0]
                    const member =i.member
                    if (choice == 'musica') {
                        var embedMusica = new Discord.MessageEmbed()
                        .setColor('#e85d')
                        .setTitle('Lista Comandi musica')
                        .addField('Play ▶️', '.play link YouTube Spotify SoundCloud')
                        .addField('Pausa ⏸️', '.pause')
                        .addField('Riprendi Traccia ⏯️', '.resume')
                        .addField('Lista Tracce 📝', '.queue')
                        .addField('Traccia Successiva ⏩', '.skip')
                        .addField('Traccia Precedente ⏮️', '.previous')
                        .addField('Stoppare Traccia ⏹️', '.stop')
                        msg.edit({ embeds: [embedMusica] })
                    }
                    if (choice == 'info') {
                        var embedInfo = new Discord.MessageEmbed()
                        .setColor('DARK_GREY')
                        .setTitle('Lista Comandi informativi e utili')
                        .addField('Informazioni utente 👤❓', ".userinfo @(utente da menzionare)")
                        .addField('Informazioni server 📊❓', ".serverinfo")
                        .addField('Informazioni canale 🗄️❓', ".channelinfo")
                        .addField('Informazioni avatar❓❓', ".guarda")
                        .addField('🔌❓ Informazioni ping bot e ram utente 💾❓', ".ping")
                        .addField('Lista argomenti', '.argomenti')
                        msg.edit({ embeds: [embedInfo] })
                    }
                    if (choice == 'link') {
                        var embedLink = new Discord.MessageEmbed()
                        .setColor('#44fd')
                        .setTitle('Lista link e comandi per canali YouTube ')
                        .addField('BotKaffeina', "https://github.com/MrLosco/BotKaffeina")
                        .addField('Gruppo Telegram', "https://t.me/+-iJRpukkPGU4MzI0")
                        .addField('Ultimo video OmegaClick', ".omega")
                        .addField('Ultimo video I\'m Salvatore MoD', ".salvo")
                        msg.edit({ embeds: [embedLink] })
                    }
                }
            })
        })
        }

        
})


