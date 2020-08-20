/**
 * This is used to send information to the discord bot
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

  // a map that we can use to identify a voice channel by its name
  const voiceChannels = new Map();
  client.channels.cache.forEach((channel) => {
    if (channel.type === "voice") {
      voiceChannels.set(channel.name, channel);
    }
  });

  // a map of the connections we're currently maintaining
  const connections = new Map();

  // the user id for loudred
  const botId = client.user.id;

  // a function that we can use to parse messages from loudred into
  // actions that we need to perform.
  const parseBotMessage = (message) => {
    if (!message.mentions.users.get(botId)) {
      return {
        type: "donothing",
      };
    }
    const messageArgs = message.content.split(" ");
    if (messageArgs[1] === "join" && messageArgs[2]) {
      return {
        type: "join",
        channel: messageArgs[2],
      };
    } else if (messageArgs[1] === "leave" && messageArgs[2]) {
      return {
        type: "leave",
        channel: messageArgs[2],
      };
    } else if (messageArgs[1] === "list") {
      return {
        type: "list",
      };
    }
  };

  client.on("message", async (message) => {
    const action = parseBotMessage(message);
    if (action.type === "list") {
      let reply = "Here are the channels I can join: ";
      voiceChannels.forEach((_value, key) => {
        reply += `\n* ${key}`;
      });
      message.reply(reply);
    }
    if (action.type === "join") {
      const channel = voiceChannels.get(action.channel);
      if (channel) {
        const connection = await channel.join();
        connections.set(action.channel, connection);
      }
    }
    if (action.type === "leave") {
      if (connections.has(action.channel)) {
        const connection = connections.get(action.channel);
        connection.disconnect();
        connections.delete(action.channel);
      }
    }
  });
});

client.login(token);
