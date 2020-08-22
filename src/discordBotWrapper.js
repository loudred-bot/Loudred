/**
 * Wrapper for our Discord Bot. Used to abstract behavior
 *
 * Methods we need to implement
 * - Help (guild) -> Print a list of commands
 * - List (guild) ->
 * - Activate (guild) -> join server
 * - Deactivate (guild) -> join server
 * - Join (channel) -> join a voice channel
 * - Leave (channel) -> leave a voice channel
 * - Play (channel) -> start sharing audio in a voice channel
 * - Silence (channel) -> stop sharing audio in a voice channel
 */
module.exports = class BotWrapper {
  /**
   * A list servers the bot is currently active in
   * Set<Server>
   */
  #servers = new Set();

  /**
   * A list of channels the bot is active in in each server
   * Map<Server,Set<Channel>>
   */
  #channels = new Map();

  /**
   * A list of active connections
   * Map<Channel, Connection>
   */
  #connections = new Map();

  /**
   * A list of dispatchers for each connection
   * Map<Connection, Dispatcher>
   */
  #dispatchers = new Map();

  /**
   * Start keeping track of messages from this server
   */
  activate(server) {
    this.#servers.add(server);
  }

  /**
   * Stop keeping track of the server
   */
  deactivate(server) {
    if (this.#servers.has(server)) {
      this.#servers.delete(server);
    }
  }

  /**
   * Join a voice channel, as long as we're currently
   * accepting messages from this server
   */
  async join(voiceChannel) {
    console.log(voiceChannel);
    if (this.#servers.has(voiceChannel.guild)) {
      const connection = await voiceChannel.join();
      const currentChannels = this.#channels.has(voiceChannel.guild)
        ? this.#channels.get(voiceChannel.guild)
        : new Set();
      currentChannels.add(voiceChannel);
      this.#channels.set(voiceChannel.guild, currentChannels);
      this.#connections.set(voiceChannel, connection);
    }
  }

  /**
   * Leave a voice channel, as long as we're currently in it
   * and are maintaining a connection to it.
   */
  leave(voiceChannel) {
    if (
      this.#channels.has(voiceChannel.guild) &&
      this.#connections.has(voiceChannel)
    ) {
      voiceChannel.leave();
      const currentChannels = this.#channels.get(voiceChannel.guild);
      currentChannels.delete(voiceChannel);
      this.#connections.delete(voiceChannel);
    }
  }

  /**
   * Send a text message to the channel, as long as we've
   * joined the server.
   */
  sendMessage(channel, message) {
    if (channel.type === "text" && this.#servers.has(channel.guild)) {
      channel.send(message);
    }
  }

  /**
   * This bot's state is actually kind of complicated and synchronous,
   * so we want to make sure that everything gets cleaned up if the user
   * skips a few commands
   */
  async #cleanup() {
    // find all the server channels we're no longer in
    this.#channels.forEach((channels, server) => {
      if (!this.#servers.has(server)) {
        channels.forEach((channel) => {
          channel.leave();
        });
      }
    });
    // find any channels we're no longer connected to
    // find any dispatchers without a matching connection
  }
};
