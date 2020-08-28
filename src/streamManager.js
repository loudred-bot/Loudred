const { PassThrough } = require("stream");
const portAudio = require("naudiodon");

class StreamManager {
  /**
   * The audio device we want to be able to connect to
   */
  #device;

  /**
   * Our PortAudio input connection
   */
  #ai = null;

  constructor(device) {
    this.#device = device;
  }

  start() {
    const pass = new PassThrough();

    this.#ai = new portAudio.AudioIO({
      inOptions: {
        channelCount: 2,
        sampleFormat: portAudio.SampleFormat16Bit,
        sampleRate: this.#device.defaultSampleRate,
        deviceId: this.#device.id,
        closeOnError: false,
      },
    });

    this.#ai.pipe(pass);
    this.#ai.start();

    return pass;
  }

  stop() {
    if (this.#ai) {
      this.#ai.quit();
      this.#ai = null;
    }
  }
}

module.exports = StreamManager;
