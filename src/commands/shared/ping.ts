import axios from 'axios';
import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/commands";

export default new Command({
  name: "ping",
  description: "Responde com informações de status do bot",
  type: ApplicationCommandType.ChatInput,
  async run({ interaction }) {
    let response;
    try {
      response = await axios.get('https://api.ipify.org?format=json');
      interaction.reply({ ephemeral: true, content: `pong, seu ip: ${response.data.ip}`});
    } catch(err) {
      interaction.reply({ ephemeral: true, content: `pong, ocorreu erro ao capturar seu ip, detalhes: ${err}`});
    }    
  }
});
