const inquirer = require("inquirer");
const portAudio = require("naudiodon");
const createAudioReadStream = require("./createAudioStream");
require("dotenv").config();
const BotWrapper = require("./discordBotWrapper");

const COMMANDS = {
  HELP: process.env.COMMAND_HELP,
  LIST: process.env.COMMAND_LIST,
  JOIN: process.env.COMMAND_JOIN,
  LEAVE: process.env.COMMAND_LEAVE,
  PLAY: process.env.COMMAND_PLAY,
  SILENCE: process.env.COMMAND_SILENCE,
  ACTIVATE: process.env.COMMAND_ACTIVATE,
  DEACTIVATE: process.env.COMMAND_DEACTIVATE,
};

/**
 * A helper function to get the VoiceChannel from a server
 * given its name.
 *
 * @NOTE Currently, Discord doesn't seem to recognize
 * voice channels when you type it with a "#" the way it does
 * text channels. Rather than figure this logic out in the
 * BotWrapper, I'm leaving it out here so that I can keep it's
 * API a little neater.
 * ~reccanti 8/22/2020
 */
const getVoiceChannelByName = (server, channelName) => {
  return server.channels.cache.find(
    (channel) => channel.type === "voice" && channel.name === channelName
  );
};

/**
 * Messages to output to the channel
 */
const helpMessage = () => {
  let message = [
    "Loudred Loudred! _(Here's a list of the commands I can use)_",
    `  - **${COMMANDS.HELP}** - See this list again`,
    `  - **${COMMANDS.LIST}** - See a list of the voice channels I can join`,
    `  - **${COMMANDS.JOIN} {channel}** - Join the specified channel`,
    `  - **${COMMANDS.LEAVE} {channel}** - Leave the specified channel`,
    `  - **${COMMANDS.PLAY} {channel}** - Start playing audio in the specified channel`,
    `  - **${COMMANDS.SILENCE} {channel}** - Stop playing audio in the specified channel`,
    `  - **${COMMANDS.ACTIVATE}** - Start listening for commands on the server`,
    `  - **${COMMANDS.DEACTIVATE}** - Stop listening for commands on the server`,
  ];
  return message.join("\n");
};

const leaveMessage = () => "_wild_ LOUDRED _ran away_";

/**
 * This is where we set up and run our application. It can be roughly broken
 * down into the following stages:
 *
 * 1. Get the input device you'd like to stream to Discord
 * 2. Initialize the Discord Client
 * 3. Setup listeners in the client to stream audio and respond to
 *    user input
 *
 * @TODO This function is probably too big, but I can't think of a better way
 * to split this up that wouldn't be arbitrary. Will work on that if I
 * think of a better way.
 * ~reccanti 8/21/2020
 */
async function setup() {
  /**
   * 1. Get the Input Device
   */
  //   const answers = await inquirer.prompt([
  //     {
  //       type: "list",
  //       name: "device",
  //       message: "Choose the output audio device you'd like to stream to Discord",
  //       choices: portAudio.getDevices().map((device) => device.name),
  //     },
  //   ]);

  /**
   * 2. Initialize and log in to the Discord Client
   */
  const Discord = require("discord.js");
  const client = new Discord.Client();

  const token = process.env.DISCORD_CLIENT_TOKEN;

  /**
   * Right now, everything is initialized inside this "onReady" function.
   * Not sure if this is the best way. Maybe the correct solution is to make
   * a manager class for handling these connections
   * ~reccanti 8/21/2020
   */
  client.on("ready", () => {
    console.log("ready");

    const bot = new BotWrapper();

    /**
     * The ID of the bot, useful for detecting messages
     */
    const botId = client.user.id;

    /**
     * 3. Setup listeners for the bot to respond to
     */
    // a function that we can use to parse messages from our bot into
    // actions that we need to perform.
    const parseBotMessage = (message) => {
      // create a base message that we'll modify for other
      // messages. Just so we're not writing a lot of
      // duplicate code
      const channel = message.channel;
      const server = message.channel.guild;
      const baseAction = {
        type: "donothing",
        channel,
        server,
      };
      // ignore any messages that aren't directed to our bot
      if (!message.mentions.users.get(botId)) {
        return baseAction;
      }
      /**
       * @TODO Right now, all the commands our bot recognizes
       * are in the form:
       *
       * <botId> <command> <arguments>
       *
       * In the future, I may want to support commands that
       * include spaces
       * ~reccanti 8/22/2020
       */
      const messageArgs = message.content.split(" ");
      if (messageArgs[1] === COMMANDS.HELP) {
        return {
          ...baseAction,
          type: "help",
        };
      } else if (messageArgs[1] === COMMANDS.JOIN && messageArgs[2]) {
        const voiceChannel = getVoiceChannelByName(server, messageArgs[2]);
        if (!voiceChannel) {
          return baseAction;
        }
        return {
          ...baseAction,
          type: "join",
          voiceChannel,
        };
      } else if (messageArgs[1] === COMMANDS.LEAVE && messageArgs[2]) {
        const voiceChannel = getVoiceChannelByName(server, messageArgs[2]);
        if (!voiceChannel) {
          return baseAction;
        }
        return {
          ...baseAction,
          type: "leave",
          voiceChannel,
        };
      } else if (messageArgs[1] === COMMANDS.PLAY && messageArgs[2]) {
        const voiceChannel = getVoiceChannelByName(server, messageArgs[2]);
        if (!voiceChannel) {
          return baseAction;
        }
        return {
          ...baseAction,
          type: "play",
          voiceChannel,
        };
      } else if (messageArgs[1] === COMMANDS.SILENCE && messageArgs[2]) {
        const voiceChannel = getVoiceChannelByName(server, messageArgs[2]);
        if (!voiceChannel) {
          return baseAction;
        }
        return {
          ...baseAction,
          type: "silence",
          voiceChannel,
        };
      } else if (messageArgs[1] === COMMANDS.LIST) {
        return {
          ...baseAction,
          type: "list",
        };
      } else if (messageArgs[1] === COMMANDS.ACTIVATE) {
        return {
          ...baseAction,
          type: "activate",
        };
      } else if (messageArgs[1] === COMMANDS.DEACTIVATE) {
        return {
          ...baseAction,
          type: "deactivate",
        };
      }
    };

    client.on("message", async (message) => {
      const action = parseBotMessage(message);

      if (action.type === "activate") {
        const { server, channel } = action;
        bot.activate(server);
        bot.sendMessage(channel, helpMessage());
      }
      if (action.type === "help") {
        const { channel } = action;
        bot.sendMessage(channel, helpMessage());
      }
      if (action.type === "deactivate") {
        const { server, channel } = action;
        bot.sendMessage(channel, leaveMessage());
        bot.deactivate(server);
      }
      if (action.type === "join") {
        const { voiceChannel } = action;
        await bot.join(voiceChannel);
      }
      if (action.type === "leave") {
        const { voiceChannel } = action;
        bot.leave(voiceChannel);
      }
      //   if (action.type === "list") {
      //     let reply = "Here are the channels I can join: ";
      //     voiceChannels.forEach((_value, key) => {
      //       reply += `\n* ${key}`;
      //     });
      //     message.reply(reply);
      //   }
      //   if (action.type === "join") {
      //     const channel = voiceChannels.get(action.channel);
      //     if (channel) {
      //       const connection = await channel.join();
      //       connections.set(action.channel, connection);

      //       const stream = createAudioReadStream();
      //       const dispatcher = connection.play(stream);
      //     }
      //   }
      //   if (action.type === "leave") {
      //     if (connections.has(action.channel)) {
      //       const connection = connections.get(action.channel);
      //       connection.disconnect();
      //       connections.delete(action.channel);
      //     }
      //   }
    });
  });

  client.login(token);
}
setup();
