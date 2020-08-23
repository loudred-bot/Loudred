/**
 * Configuration file for all of Loudreds commands and messages.
 * Feel free to modify it and customize it to your liking!
 */

/**
 * Helper function to modify arguments
 */
const formatArgs = (args) => {
  return args.map((arg) => `{${arg}}`).join(" ");
};

const DISCORD_CLIENT_TOKEN = "YOUR CLIENT TOKEN HERE";

const COMMANDS = {
  HELP: {
    name: "Moves",
    args: [],
    description: "See this list again",
  },
  LIST: {
    name: "Extrasensory",
    args: [],
    description: "See a list of the voice channels I can join",
  },
  JOIN: {
    name: "TakeDown",
    args: ["channel"],
    description: "Join the specified channel",
  },
  LEAVE: {
    name: "Withdraw",
    args: ["channel"],
    description: "Leave the specified channel",
  },
  PLAY: {
    name: "Roar",
    args: ["channel"],
    description: "Start playing audio in the specified channel",
  },
  SILENCE: {
    name: "Rest",
    args: ["channel"],
    description: "Stop playing audio in the specified channel",
  },
  ACTIVATE: {
    name: "IChooseYou",
    args: [],
    description: "Start listening for commands on this server",
  },
  DEACTIVATE: {
    name: "RunAway",
    args: [],
    description: "Stop listening for commands on this server",
  },
  INFO: {
    name: "Stats",
    args: [],
    description: "Display information about what I'm doing on this server",
  },
};

const MESSAGES = {
  get HELP() {
    const firstLine =
      "Loudred Loudred! _(Here's a list of the commands I can use)_";
    // outputs in the format:
    // - **NAME {ARG1}** - DESCRIPTION
    const commandDescriptions = Object.values(COMMANDS).map(
      ({ name, args, description }) =>
        `- **${name} ${formatArgs(args)}** - ${description}`
    );
    return [firstLine, ...commandDescriptions].join("\n");
  },
  LEAVE: "_wild_ LOUDRED _ran away_",
  INACTIVE: "LOUDRED _began to nap!_",
  LIST(channels) {
    const firstLine =
      "Loudred! Loud! _(Here's a list of the voice channels I can join)_";
    const channelList = channels.map((channel) => `- ${channel.name}`);
    return [firstLine, ...channelList].join("\n");
  },
};

module.exports = {
  DISCORD_CLIENT_TOKEN,
  COMMANDS,
  MESSAGES,
};
