const portAudio = require("naudiodon");
// const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { Writable, PassThrough } = require("stream");
const fs = require("fs");

console.log(portAudio.getDevices());
const pass = new PassThrough();

// get an input stream
// const aio = new portAudio.AudioIO({
//   inOptions: {
//     channelCount: 16,
//     sampleFormat: portAudio.SampleFormat16Bit,
//     sampleRate: 44100,
//     deviceId: 0,
//     closeOnError: false,
//   },
//   // outOptions: {
//   //   channelCount: 16,
//   //   sampleFormat: portAudio.SampleFormat16Bit,
//   //   sampleRate: 44100,
//   //   deviceId: 0,
//   //   closeOnError: false,
//   // },
// });

// pipe to an output stream
const ai = new portAudio.AudioIO({
  inOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: 0,
    closeOnError: false,
  },
});

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

// pass.on("data", (buf) => {
//   console.log(buf);
// });

ffmpeg({ source: ai })
  // ffmpeg({ source: "./utena.mp3" })
  .inputFormat("s16le")
  .inputOptions(["-ar 44.1k", "-ac 2"])
  // .audioChannels(2)
  // .audioFrequency(44100)
  .outputFormat("wav")
  .pipe(pass);

pass.pipe(ao);

// aio.pipe(fs.createWriteStream("test.raw"));

// aio.start();

// ai.pipe(fs.createWriteStream("./test.raw"));
// ai.on("data", (buf) => {
//   console.log(buf);
// });
ai.start();
ao.start();
