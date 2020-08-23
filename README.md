# Loudred - Discord Bot for streaming audio

![](./img/loudred.png)

_A wild Loudred appeared_

> Loudred! Loudred!

Hmm... this Loudred appears to be trying to say something.

> Loudred LOUDRED Loudred!

It seems like they're saying...that they're a Discord Audio Bot that streams audio from a MacOS audio device?

## Motivations

This is quite strange. Wild Loudred don't usually venture out this way. Why are you here, Loudred?

> Loudred Loud!

They're saying that they're here to fix a limitation with [Go Live with Discord](https://support.discord.com/hc/en-us/articles/360040816151-Share-your-screen-with-Go-Live-Screen-Share) on MacOS. Currently, MacOS users are unable to stream audio through this service, but by adding Loudred as a bot, you can stream audio through them instead.

## Setup

> Loud Loud Loudred!

Slow down there, Loudred! They appear to be trying to tell us how to use them to stream audio. It seems a little complicated, but I'll do my best to break it down:

### 1. Setup a Discord Bot and add it to your Server

The first thing you need to do is create an application with a bot, and then add it to your server.

> Loudred!

Oh, thank you Loudred! They've given us some helpful documentation

- [Read this to learn how to set up a Discord Bot and application](https://discordjs.guide/preparations/setting-up-a-bot-application.html)
- and [read this to learn how to add your bot to a server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html)

At the end of this process, your bot page should look something like this:

![Screenshot of the Bot page. We have an application called "Loudred" with a bot that also happens to have the username "Loudred"](./img/BotPage.png)

_NOTE: Feel free to name your bot and application something other than Loudred!_

### 2. Configure your audio devices

For this next step, you'll need some way of capturing your computer's sound output in an audio device

> Loud! Loud!

Loudred recommends using a program called [BlackHole](https://github.com/ExistentialAudio/BlackHole) (a wonderful program that you should consider [sponsoring](https://github.com/sponsors/ExistentialAudio)) for this. It works by creating a virtual audio device that you can read and write audio data to. Don't worry if you don't understand all that, we'll walk you through how to set all this up later! You can install it with homebrew by running the command:

```bash
brew cask install blackhole
```

[Or install it using their intaller](http://existential.audio/blackhole/)

Check out your audio devices by going to `System Preferences > Sound`. You should have the following output devices:

![The "Output" tab of the "Sound" window. It shows a device called "MacBook Pro Speakers", which should have already been there, as well as a new device called "BlackHole 16ch"](./img/outputdevices.png)

and the following input devices:

![The "Input" tab of the "Sound" window. It shows a device called "MacBook Pro Microphone", which should have already been there, as well as a new device called "BlackHole 16ch"](./img/inputdevices.png)

### 3. Download this Github repository

> Loudred! Loudred! LOUDRED!

For the next step, you'll need to make sure you have the following installed:

1. NodeJS - [Download NodeJS here](https://nodejs.org/en/download/)
2. FFmpeg - [Download FFmpeg here](https://ffmpeg.org/download.html) or install it using `brew install ffmpeg`

Once you have those installed, clone this repo using the following command:

```bash
git clone https://github.com/reccanti/Loudred.git
```

Once that's done, go into the newly created directory:

```bash
cd Loudred
```

...and then install its dependencies using

```bash
npm install
```

## Running Loudred

> Loudred! Loudred!

Now that we have everything downloaded and installed, we can start the process of setting up and streaming our audio to Discord!

### 1. Setup your Program's Audio Device

#### The Easy Way

> Loudred Loud!

If the program you're trying to stream supports changing the Audio output device, that's great! Just set your program's audio device to `BlackHole` and you're finished.

A great example of this is VLC, which lets you set the output device in its Audio menu like so:

![You can set the output audio Device for VLC by going to `Audio > Audio Device`](./img/VLCAudioDevice.png)

#### The Hard Way

> Loud! Loud!

Unfortunately, not every program supports this or makes it readily available. In this situation, you'll need to get a little more creative.

The first thing you'll need to do is make a Multi-Output Device. This is a device that will direct audio output into multiple sources. We're going to use it to direct audio to both our speakers and BlackHole. Open up the `Audio MIDI Setup` program. Yours should look something like this:

![The Audio MIDI Setup program. It's displaying 3 audio devices: "BlackHole 16ch", "MacBook Pro Microphone", and "MacBook Pro Speakers"](./img/AudioMIDI.png)

Click the "+" button at the bottom and select `Create Multi-Output Device`:

![The "+" menu. It displays 3 options: "Create Aggregate Device", "Create Multi-Output Device", and "Connect AirPlay Device"](./img/CreateMultiOutput.png)

You should now have a Multi-output device! Make sure both "MacBook Pro Speakers" and "BlackHole 16ch" are selected, and make sure "MacBook Pro Speakers" is the Master Device. It should look something like this:

![The Audio MIDI Setup program again, but this time it's displaying a fourth audio device: "Multi-Output Device". The Master Device is set to "MacBook Pro Speakers", and both "MacBook Pro Speakers" and "BlackHole 16ch" are selected](./img/AudioMIDIMulti.png)

Then, right click "Multi-Output Device"'s icon and select "Use This Device For Sound Output":

![The menu that appears when you right click the "Multi-Output Device" icon. It displays the following options: "Configure Device... (disabled)", "Configure Speakers...", "Use This Device For Sound Input (disabled)", "Use This Device For Sound Output", and "Play Alerts and Sound Effects Through This Device"](./img/UseThisDevice.png)

_NOTE: You may not hear any audio if "MacBook Pro Speakers" isn't at the top of your Audio Devices. To fix this, just deselect and reselect "BlackHole 16ch", and that should move it below the speakers_

2. Setup Discord's Audio Device
