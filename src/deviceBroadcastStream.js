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
    // bitrate: 44.1,
  });

  ai.start();

  return broadcast;
};
