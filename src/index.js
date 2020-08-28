const inquirer = require("inquirer");
const portAudio = require("naudiodon");
const Discord = require("discord.js");
const { DISCORD_CLIENT_TOKEN, COMMANDS, MESSAGES } = require("../config");
const StreamManager = require("./streamManager");
const BotWrapper = require("./discordBotWrapper");

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

const getAudioDeviceByName = (name) =>
  portAudio.getDevices().find((device) => device.name === name);

/**
 * Parses our message string and breaks it down into its components.
 * Messages are in the format:
 *
 * <botId> <command> <argument>
 *
 * So this breaks it down into an object in the format
 * { botId, command, argument }
 */
const parseMessageString = (content) => {
  const [id, command = null, ...args] = content.split(" ");
  return {
    id,
    command,
    arg: args.length > 0 ? args.join(" ") : null,
  };
};

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
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "device",
      message: "Choose the output audio device you'd like to stream to Discord",
      choices: portAudio.getDevices().map((device) => device.name),
    },
  ]);

  const { device: deviceName } = answers;
  const device = getAudioDeviceByName(deviceName);
  const sm = new StreamManager(device);

  /**
   * 2. Initialize and log in to the Discord Client
   */
  const client = new Discord.Client();

  /**
   * Right now, everything is initialized inside this "onReady" function.
   * Not sure if this is the best way. Maybe the correct solution is to make
   * a manager class for handling these connections
   * ~reccanti 8/21/2020
   */
  client.on("ready", async () => {
    console.log("ready");

    const bot = new BotWrapper(client.user);
    await bot.setStatus("online");

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
      if (!message.mentions.users.get(bot.id)) {
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
      // const messageArgs = message.content.split(" ");

      const contents = parseMessageString(message.content);

      // help - Display a list of commands
      if (!contents.command || contents.command === COMMANDS.HELP.name) {
        return {
          ...baseAction,
          type: "help",
        };
      }
      // join - join a voice channel with the given name
      else if (contents.command === COMMANDS.JOIN.name && contents.arg) {
        const voiceChannel = getVoiceChannelByName(server, contents.arg);
        if (!voiceChannel) {
          return baseAction;
        }
        return {
          ...baseAction,
          type: "join",
          voiceChannel,
        };
      }
      // leave - leave a voice channel with the given name
      else if (contents.command === COMMANDS.LEAVE.name && contents.arg) {
        const voiceChannel = getVoiceChannelByName(server, contents.arg);
        if (!voiceChannel) {
          return baseAction;
        }
        return {
          ...baseAction,
          type: "leave",
          voiceChannel,
        };
      }
      // play - start playing audio in the specified channel
      else if (contents.command === COMMANDS.PLAY.name && contents.arg) {
        const voiceChannel = getVoiceChannelByName(server, contents.arg);
        if (!voiceChannel) {
          return baseAction;
        }
        return {
          ...baseAction,
          type: "play",
          voiceChannel,
        };
      }
      // silence - stop playing audio in the specified channel
      else if (contents.command === COMMANDS.SILENCE.name && contents.arg) {
        const voiceChannel = getVoiceChannelByName(server, contents.arg);
        if (!voiceChannel) {
          return baseAction;
        }
        return {
          ...baseAction,
          type: "silence",
          voiceChannel,
        };
      }
      // deactivate - stop listening for commands on the given server
      else if (contents.command === COMMANDS.DEACTIVATE.name) {
        return {
          ...baseAction,
          type: "deactivate",
        };
      }
      return baseAction;
    };

    client.on("message", async (message) => {
      const action = parseBotMessage(message);
      console.log(action.type);

      if (action.type === "list") {
        const { server, channel } = action;
        const channels = bot.getVoiceChannels(server);
        await bot.sendMessage(channel, MESSAGES.LIST(channels));
      }
      if (action.type === "help") {
        const { channel } = action;
        await bot.sendMessage(channel, MESSAGES.HELP);
      }
      if (action.type === "join") {
        const { voiceChannel } = action;
        await bot.join(voiceChannel);
      }
      if (action.type === "leave") {
        const { voiceChannel } = action;
        if (bot.isPlaying(voiceChannel)) {
          sm.stop();
        }
        bot.leave(voiceChannel);
      }
      if (action.type === "play") {
        const { voiceChannel } = action;
        if (bot.isPlaying(voiceChannel)) {
          bot.unSilence(voiceChannel);
        } else {
          bot.play(voiceChannel, sm.start());
        }
      }
      if (action.type === "silence") {
        const { voiceChannel } = action;
        bot.silence(voiceChannel);
      }
    });

    /**
     * Perform some cleanup when we stop the server
     */
    process.on("SIGINT", async () => {
      sm.stop();
      bot.getActiveVoiceChannels().forEach((channel) => {
        bot.leave(channel);
      });
      await bot.setStatus("idle");
    });
  });

  client.login(DISCORD_CLIENT_TOKEN);
}

setup();
