import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, VoiceChannel } from "discord.js";
import ytdl from "ytdl-core";
import { Command } from "../../structs/types/commands";

export default new Command({
  name: "musica",
  description: "Teste de comando para obter uma musica",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "chat",
      description: "Selecione um canal de voz",
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildVoice], // Certifique-se de que apenas canais de voz são selecionáveis
      required: true
    },
    {
      name: "link",
      description: "Informe o link do youtube",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    // outras opções aqui...
  ],
  async run({ interaction, options }) {
    await interaction.deferReply({ephemeral: true})
    const connection = getVoiceConnection(interaction.guildId ?? '');
    const channelId = connection?.joinConfig.channelId;
    const channel = options.getChannel("chat", true);
    console.log(`channelId: ${channelId} | channelId Atual: ${channel.id}`)
    
    if(channelId && channelId !== channel.id) {
      await interaction.editReply({
        content: `O bot já está online em um canal de voz!`
      })
      return;
    }
    if(channel instanceof VoiceChannel) {
      const msg = options.getString("link", true);
      if(!msg) return await interaction.editReply({
        content: "É ncessario informa um link do youtube!"
      });
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        if(!ytdl.validateURL(msg)) {
          await interaction.editReply({
            content: `Link informado está invalido ou é um link privado, tente outro link!`
          });
          return;
        }
        try{
          const stream = ytdl(msg, { filter: 'audioonly' });
          stream.on('error', async error => {
            console.error('Erro durante o streaming:', error);
          return;
        });
          const info = await ytdl.getBasicInfo(msg);
          const resource = createAudioResource(stream);
          const player = createAudioPlayer();
  
          player.play(resource);
          connection.subscribe(player);
  
          player.on(AudioPlayerStatus.Idle, () => connection.destroy());
  
          await interaction.editReply({
              content: `Musica: ${info.videoDetails.title} será tocada!`
          });
        }catch(err) {
          await interaction.editReply({
            content: `Ocorreu um erro ao tentar reproduzir a musica.!`
          });
        }

    }else {

        await interaction.editReply({
            content: "Você não está em um canal de voz!"
        });

    }
  }
});