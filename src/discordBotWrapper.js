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
      // cleanup our connections before leaving the channel
      const { connection } = this.#channels.get(voiceChannel);
      connection.disconnect();
      // leave the channel and remove it from our list
      voiceChannel.leave();
      this.#channels.delete(voiceChannel);
    }
  }

  /**
   * If we're in the channel, start streaming audio to it
   */
  play(voiceChannel, stream) {
    if (!this.#channels.has(voiceChannel)) {
      return;
    }
    const info = this.#channels.get(voiceChannel);
    // if we don't have a dispatcher that's playing audio,
    // create one
    if (!info.dispatcher) {
      const dispatcher = info.connection.play(stream);
      info.dispatcher = dispatcher;
      this.#channels.set(voiceChannel, { ...info, dispatcher });
    }
    // otherwise just unpause the current dispatcher
    else {
      info.dispatcher.resume();
    }
  }

  /**
   * Silence any stream if we're playing in that voice channel
   */
  silence(voiceChannel) {
    if (!this.#channels.has(voiceChannel)) {
      return;
    }
    const info = this.#channels.get(voiceChannel);
    if (info.dispatcher) {
      info.dispatcher.pause(true);
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
