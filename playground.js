const portAudio = require("naudiodon");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { Writable, PassThrough } = require("stream");

console.log(portAudio.getDevices());
const pass = new PassThrough();

// get an input stream
const ai = new portAudio.AudioIO({
  inOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: 0,
    closeOnError: false,
  },
});

// pipe to an output stream
const ao = new portAudio.AudioIO({
  outOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: 2,
    closeOnError: false,
  },
});

// a custom WriteStream
class WriteTester extends Writable {
  constructor(options) {
    super(options);
  }

  _write(chunk, encoding, callback) {
    ao.write(chunk);
    callback();
  }
}
// const writeStream = new WriteTester();

ffmpeg({ source: ai })
  .inputFormat("s16le")
  .inputOptions(["-ar 44.1k", "-ac 16"])
  .outputFormat("wav")
  .pipe(pass);

pass.pipe(ao);

ai.start();
ao.start();
