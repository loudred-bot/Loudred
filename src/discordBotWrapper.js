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
   * Send a text message to the channel, as long as we've
   * joined the server.
   */
  sendMessage(channel, message) {
    if (channel.type === "text" && this.#servers.has(channel.guild)) {
      channel.send(message);
    }
  }
};
