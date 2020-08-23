const { PassThrough } = require("stream");
const portAudio = require("naudiodon");
const ffmpeg = require("fluent-ffmpeg");

class StreamManager {
  /**
   * The audio device we want to be able to connect to
   */
  #device;

  /**
   * The ffmpeg process that converts our raw audio to the ogg/opus
   * format that Discord expects
   */
  #proc;

  /**
   * Our PortAudio input connection
   */
  #ai;

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

    /**
     * FFMPEG Magic!
     * This converts the "raw PCM" data output by portAudio into an ogg format,
     * which is then read by the Discord API. Here's a breakdown:
     *
     *   - "s16le"     - signed, 16-bit, little-endian. The format of portAudio.SampleFormat16Bit
     *   - "-ar"       - the audio sample rate, which we specified above
     *   - "-ac"       - the number of audio channels
     *
     * Breakdown here: https://stackoverflow.com/a/11990796
     */
    this.#proc = ffmpeg({ source: this.#ai })
      .inputFormat("s16le")
      .inputOptions([`-ar ${this.#device.defaultSampleRate}`, `-ac ${2}`])
      .outputFormat("ogg");

    this.#proc.pipe(pass);
    this.#ai.start();

    return pass;
  }

  stop() {
    this.#ai.quit();
    this.#proc.kill();
    this.#ai = null;
    this.#proc = null;
  }
}

module.exports = StreamManager;
