/**
 * Creates a broadcast stream of the specified audio
 * device that we can reuse and pass to multiple VoiceConnections
 */
const portAudio = require("naudiodon");

module.exports = function createDeviceBroadcastStream(client, device) {
  // create the broadcast stream
  const broadcast = client.voice.createBroadcast();

  // create the audio device stream
  const ai = new portAudio.AudioIO({
    inOptions: {
      /**
       * @NOTE A lot of these settings are required by discord
       * in order to play raw PCM data. Discord expects raw audio
       * streams to be a 2-channels, signed 16-bits, and have a
       * 48 kHz sample rate.
       *
       * I don't know if this is specifically mentioned anywhere.
       * I kind of gleaned it from the tip in the Basic Usage
       * section of this article and a lot of trial-and-error:
       *
       * https://discordjs.guide/voice/receiving-audio.html#basic-usage
       *
       * ~reccanti 8/29/2020
       */
      channelCount: 2,
      sampleFormat: portAudio.SampleFormat16Bit,
      sampleRate: 48000,
      deviceId: device.id,
      closeOnError: false,
    },
  });

  // create a dispatcher for our device stream
  broadcast.play(ai, {
    type: "converted",
  });

  ai.start();

  return broadcast;
};
