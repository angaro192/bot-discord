import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import ytdl from "ytdl-core";
import { Command } from "../../structs/types/commands";

// Estrutura da fila para cada servidor
const queue = new Map();
const player = createAudioPlayer(); // Cria um único AudioPlayer para reutilização

export default new Command({
  name: "addmusic",
  description: "Adiciona a musica na fila",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "link",
      description: "Informe o Link ou ID do youtube",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async run({ interaction, options, client }) {
    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply({
        content: "Este comando só pode ser usado em um servidor.",
      });
      return;
    }

    const member = await guild.members.fetch(interaction.user.id);
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      await interaction.editReply({
        content:
          "Você precisa estar em um canal de voz para usar este comando.",
      });
      return;
    }

    const link = options.getString("link", true);
    if (!ytdl.validateURL(link)) {
      await interaction.editReply({
        content: `Link informado está invalido ou é um link privado, tente outro link!`,
      });
      return;
    }

    enqueueSong(guild.id, link, voiceChannel, interaction);
    const info = await ytdl.getBasicInfo(link);
    await interaction.editReply({
      content: `Musica: ${info.videoDetails.title} adicionada à fila!`,
    });
  },
});

function play(guildId: string) {
  const serverQueue = queue.get(guildId);
  if (!serverQueue || serverQueue.songs.length === 0) {
    const voiceConnection = getVoiceConnection(guildId);
    if (voiceConnection) voiceConnection.destroy();
    queue.delete(guildId);
    return;
  }

  const song = serverQueue.songs[0];
  const stream = ytdl(song, {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25,
    liveBuffer: 1 << 62,
    dlChunkSize: 0,
  });
  const resource = createAudioResource(stream);

  player.play(resource);
  serverQueue.connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    serverQueue.songs.shift();
    play(guildId);
  });
}

function enqueueSong(
  guildId: string,
  song: string,
  voiceChannel: any,
  interaction: any
) {
  const serverQueue = queue.get(guildId);

  if (serverQueue) {
    serverQueue.songs.push(song);
    return;
  }

  const queueContruct = {
    textChannel: interaction.channel,
    voiceChannel: voiceChannel,
    connection: joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    }),
    songs: [song],
    playing: true,
  };

  queue.set(guildId, queueContruct);
  play(guildId);
}
