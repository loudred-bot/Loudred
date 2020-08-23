const { PassThrough } = require("stream");
const portAudio = require("naudiodon");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

module.exports = function createAudioReadStream(device) {
  const pass = new PassThrough();

  const ai = new portAudio.AudioIO({
    inOptions: {
      channelCount: 2,
      sampleFormat: portAudio.SampleFormat16Bit,
      sampleRate: device.defaultSampleRate,
      deviceId: device.id,
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
  // const write = fs.createWriteStream(path.resolve(__dirname, "../test.ogg"));
  ffmpeg({ source: ai })
    .inputFormat("s16le")
    .inputOptions([`-ar ${device.defaultSampleRate}`, `-ac ${2}`])
    .outputFormat("ogg")
    .pipe(pass);

  ai.start();
  return pass;
};
