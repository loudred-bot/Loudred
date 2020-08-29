/**
 * Playground for a simple stream. It takes raw audio data
 * from an input source (BlackHole), and pipes it to the speakers.
 *
 * This seems to work pretty smoothly, which means that audio output
 * problems may be happening on Discord's end
 */
const portAudio = require("naudiodon");

console.log(portAudio.getDevices());

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

ai.pipe(ao);

ai.start();
ao.start();
