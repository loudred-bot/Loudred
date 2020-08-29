/**
 * Wrapper for our Discord Bot. Used to abstract behavior
 */

module.exports = class BotWrapper {
  /**
   * A list of channels the bot is active in
   * Map<Channel, { Server, Connection, Dispatcher }>
   */
  #channels = new Map();

  /**
   * User information about the Bot
   */
  #user;

  get id() {
    if (this.#user) {
      return this.#user.id;
    }
  }

  constructor(botUser) {
    this.#user = botUser;
  }

  /**
   * Return all the voice channels Loudred can join
   */
  getVoiceChannels(server) {
    return server.channels.cache.filter((channel) => channel.type === "voice");
  }

  /**
   * Return a list of all the voice channels the bot is
   * currently active in
   */
  getActiveVoiceChannels() {
    return Array.from(this.#channels.keys());
  }

  /**
   * Join a voice channel, as long as we're currently
   * accepting messages from this server
   */
  async join(voiceChannel) {
    const connection = await voiceChannel.join();
    // connection.on("debug", console.log);
    this.#channels.set(voiceChannel, {
      server: voiceChannel.guild,
      connection,
    });
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
  async play(voiceChannel, broadcast) {
    if (!this.#channels.has(voiceChannel)) {
      await this.join(voiceChannel);
    }
    const info = this.#channels.get(voiceChannel);
    // if we don't have a dispatcher that's playing audio,
    // create one
    if (!info.dispatcher) {
      const dispatcher = info.connection.play(broadcast);
      this.#channels.set(voiceChannel, { ...info, dispatcher });
    }
  }

  isPlaying(voiceChannel) {
    if (this.#channels.has(voiceChannel)) {
      const info = this.#channels.get(voiceChannel);
      if (info.dispatcher && !info.dispatcher.paused) {
        return true;
      }
    } else {
      return false;
    }
  }

  /**
   * Silence any stream if we're playing in that voice channel.
   *
   * @NOTE Rather than "pause" the stream, we're just going to set the
   * volume to 0 so that it keeps its time position, since we want
   * to livestream our audio.
   * ~reccanti 8/22/2020
   */
  silence(voiceChannel) {
    if (!this.#channels.has(voiceChannel)) {
      return;
    }
    const { dispatcher, ...info } = this.#channels.get(voiceChannel);
    if (dispatcher) {
      dispatcher.destroy();
      this.#channels.set(voiceChannel, info);
    }
  }

  /**
   * Sets the Status of the bot
   */
  async setStatus(status) {
    await this.#user.setStatus(status);
  }

  /**
   * Send a text message to the channel, as long as we've
   * joined the server.
   */
  async sendMessage(channel, message) {
    if (channel.type === "text") {
      await channel.send(message);
    }
  }
};
