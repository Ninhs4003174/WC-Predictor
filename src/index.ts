import {
  Client,
  Events,
  GatewayIntentBits,
  Interaction
} from "discord.js";

import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { commandMap } from "./commands/index.js";
import { handlePlayInteraction } from "./events/interactionCreate.js";
import { handleScheduleInteraction } from "./events/scheduleInteraction.js";
import { startEspnLiveWatcher } from "./services/espnLiveWatcher.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.once(Events.ClientReady, readyClient => {
  console.log(`✅ Logged in as ${readyClient.user.tag}`);

  startEspnLiveWatcher(client);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  try {
    const scheduleHandled = await handleScheduleInteraction(interaction);

    if (scheduleHandled) {
      return;
    }

    const playHandled = await handlePlayInteraction(interaction);

    if (playHandled) {
      return;
    }

    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = commandMap.get(interaction.commandName);

    if (!command) {
      await interaction.reply({
        content: "Unknown command.",
        ephemeral: true
      });
      return;
    }

    await command.execute(interaction);
  } catch (error) {
    console.error("Interaction error:", error);

    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "Something went wrong.",
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: "Something went wrong.",
          ephemeral: true
        });
      }
    }
  }
});

async function main() {
  await connectDatabase();
  await client.login(env.DISCORD_TOKEN);
}

main();