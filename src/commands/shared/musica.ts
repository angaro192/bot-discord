import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
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
    // outras opções aqui...
  ],
  async run({ interaction, options }) {
    const channel = options.getChannel("chat", true);
    await interaction.deferReply({ephemeral: true})
    if(channel instanceof VoiceChannel) {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        const stream = ytdl('https://www.youtube.com/watch?v=Zrd3GhwG-7o', { filter: 'audioonly' });
        const resource = createAudioResource(stream);
        const player = createAudioPlayer();

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => connection.destroy());
        await interaction.editReply({
            content: "Musica adicionada com sucesso na lista!"
        });
    }else {
        await interaction.editReply({
            content: "Você não está em um canal de voz!"
        })
    }
  }
});