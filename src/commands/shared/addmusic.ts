import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import ytdl from "ytdl-core";
import { Command } from "../../structs/types/commands";

const queue = new Map();
let queueContruct: {
    textChannel: any,
    voiceChannel: any,
    connection: any,
    songs: any,
    playing: any,
};
export default new Command({
    name: 'addmusic',
    description: 'Adiciona a musica na fila',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "link",
            description: "Informe o Link ou ID do youtube",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    async run({interaction, options, client}) {
        await interaction.deferReply({ephemeral: true});
        const guild = interaction.guild;
        if (!guild) {
            await interaction.editReply({
                content: "Este comando só pode ser usado em um servidor."
            });
            return;
        }
        // Busca o membro no servidor
        const member = await guild.members.fetch(interaction.user.id);
        // Verifica se o membro está em um canal de voz
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            await interaction.editReply({
                content: "Você precisa estar em um canal de voz para usar este comando."
            });
            return;
        }
        const link = options.getString("link", true);
        const serverQueue = queue.get(interaction.guildId);
        if(serverQueue){
            serverQueue.songs.push(link);
            await interaction.editReply({
                content: `Link adicionado!`
              });
            return;
        }
        // Se não houver música tocando, crie uma nova fila
        queueContruct = {
            textChannel: interaction.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: new Array(),
            playing: true,
        };
        // Adicionando a música na fila
        queueContruct.songs.push(link);
        // Definindo a fila no mapa de filas
        queue.set(interaction.guildId, queueContruct);

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });
        if(!ytdl.validateURL(link)) {
            await interaction.editReply({
              content: `Link informado está invalido ou é um link privado, tente outro link!`
            });
            return;
        }
        try{
            const stream = ytdl(link, { filter: 'audioonly' });
            stream.on('error', async error => {
              console.error('Erro durante o streaming:', error);
            return;
          });
            const info = await ytdl.getBasicInfo(link);
            const resource = createAudioResource(stream);
            const player = createAudioPlayer();
    
            player.play(resource);
            connection.subscribe(player);
    
            player.on(AudioPlayerStatus.Idle, () => {
                queueContruct.songs.shift();
                play(interaction.guildId);
            });
    
            await interaction.editReply({
                content: `Musica: ${info.videoDetails.title} será tocada!`
            });
          }catch(err) {
            await interaction.editReply({
              content: `Ocorreu um erro ao tentar reproduzir a musica.!`
            });
          }
    }
})

function play(guildId: string | null) {
    console.log('entrou aqui')
    const serverQueue = queue.get(guildId);  
    if (!serverQueue.songs.length) {
      serverQueue.voiceChannel.leave();
      queue.delete(guildId);
      return;
    }  
    const song = serverQueue.songs[0];
    // Seu código para tocar a música 'song'
    // Lembre-se de lidar com o evento 'AudioPlayerStatus.Idle' novamente
    const stream = ytdl(song, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    const player = createAudioPlayer();
    
    player.play(resource);
    player.on(AudioPlayerStatus.Idle, () => {
        queueContruct.songs.shift();
        play(guildId);
    });

  }