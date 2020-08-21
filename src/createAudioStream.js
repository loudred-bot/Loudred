const { PassThrough } = require("stream");
const portAudio = require("naudiodon");
const ffmpeg = require("fluent-ffmpeg");

module.exports = function createAudioReadStream() {
  const pass = new PassThrough();

  const ai = new portAudio.AudioIO({
    inOptions: {
      channelCount: 16,
      sampleFormat: portAudio.SampleFormat16Bit,
      sampleRate: 44100,
      deviceId: 0,
      closeOnError: false,
    },
  });

  ffmpeg({ source: ai })
    .inputFormat("s16le")
    .inputOptions(["-ar 44.1k", "-ac 16"])
    .outputFormat("ogg")
    .pipe(pass);

  ai.start();
  return pass;
};
