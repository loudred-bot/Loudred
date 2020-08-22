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
   * A list of channels the bot is active in
   * Map<Channel, { Server, Connection, Dispatcher }>
   */
  #channels = new Map();

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
      // cleanup channels before we stop listening
      this.#channels.forEach((channelInfo, channel) => {
        if (channelInfo.server === server) {
          this.leave(channel);
        }
      });
      this.#servers.delete(server);
    }
  }

  /**
   * Join a voice channel, as long as we're currently
   * accepting messages from this server
   */
  async join(voiceChannel) {
    if (this.#servers.has(voiceChannel.guild)) {
      const connection = await voiceChannel.join();
      this.#channels.set(voiceChannel, {
        server: voiceChannel.guild,
        connection,
      });
    }
  }

  /**
   * Leave a voice channel, as long as we're currently in it
   * and are maintaining a connection to it.
   */
  leave(voiceChannel) {
    if (this.#channels.has(voiceChannel)) {
      voiceChannel.leave();
      // @TODO cleanup connections and dispatchers
      this.#channels.delete(voiceChannel);
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
};
