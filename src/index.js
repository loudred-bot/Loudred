const portAudio = require("naudiodon");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

const testWriteStream = fs.createWriteStream("out.raw");

// get the audio from the microphone
const ai = new portAudio.AudioIO({
  inOptions: {
    channelCount: 1,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: 1,
  },
});

/**
 * FFMPEG Magic!
 * This converts the "raw PCM" data output by portAudio into an mp3 format
 * (which can hopefully be read by the Discord API). Here's a breakdown:
 *
 *   - "s16le"     - signed, 16-bit, little-endian. The format of portAudio.SampleFormat16Bit
 *   - "-ar 44.1k" - the audio sample rate, which we specified above
 *   - "-ac 1"     - the number of audio channels
 *
 * Breakdown here: https://stackoverflow.com/a/11990796
 *
 * Obviously this is pretty brittle, so we should probably allow some
 * customization in the future, but for now it works!
 * ~reccanti 8/20/2020
 */
const proc = ffmpeg({ source: ai })
  .inputFormat("s16le")
  .inputOptions(["-ar 44.1k", "-ac 1"])
  .output("ff.mp3");

proc.on("error", (err) => {
  console.log(err);
});

console.log("start recording");
ai.start();
proc.run();
