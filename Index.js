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
setInterval(oraAttuale, 1000 * 60)
/*
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
}, 1000 * 60)
*/
//MESSAGGIO DI BENVENUTO 

client.on("guildMemberAdd", member => {
    if (member.user.bot) return
    var embedCiao = new Discord.MessageEmbed()
        .setTitle("BENVENUTO")
        .setDescription(`Ciao ${member.toString()}, benvenuto nel ${member.guild.name}. Sei il **${member.guild.memberCount}Â° Membro**`)

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

        message.channel.send({embeds: [embed]})
    }
})

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
        .setLabel("❓info❓")
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
            const collector = msg.createMessageComponentCollector({time: 20000})

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
                    .setTitle('Lista Comandi informazioni')
                    .addField('Informazioni utente 👤❓', ".userinfo @(utente da menzionare)")
                    .addField('Informazioni server 📊❓', ".serverinfo")
                    .addField('Informazioni canale 🗄️❓', ".channelinfo")
                    .addField('Informazioni avatar❓❓', ".guarda")
                    .addField('🔌❓ Informazioni ping bot e ram utente 💾❓', ".ping")

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



