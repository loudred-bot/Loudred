# Loudred Runbook

Eventually, I'd like to get unit tests set up for Loudred. However, a lot of tasks involve sending data through Discord, which can't be unit-tested easily or effectively. This document is to outline common tasks and edge-cases Loudred should be able to perform. Try running through them before merging in any new changes, especially if you're touching the streams or the commands!

~reccanti 8/27/2020

## Setup

1. Set Mac's output audio device to Blackhole
2. Set Discord's output device to MacBook Pro Speakers
3. Start playing a Youtube video or some media

## Happy Path

1. Perform steps in "Setup"
2. Type `@loudred {PLAY} {channelname}`
3. You should hear the audio from the Youtube Video

## Join Without Audio

1. Perform the steps in "Setup"
2. Type `@loudred {JOIN} {channelname}`
3. Loudred should appear in the channel, but not be playing any audio

## Starting Audio In Channel

1. Perform the steps in "Setup" and "Join Without Audio"
2. Type `@loudred {PLAY} {channelname}`
3. Audio should begin playing

## Silencing Audio

1. Perform the steps in "Setup" and "Happy Path"
2. Type `@loudred {SILENCE} {channelname}`
3. You should no longer hear audio from the YouTube Video
4. Type `@loudred {PLAY} {channelname}`
5. You should hear audio from the video again

## Leaving a Voice Chat

1. Perform the steps in "Setup" and "Happy Path"
2. Type `@loudred {LEAVE} {channelname}`
3. Loudred should leave the voice channel
4. Type `@loudred {PLAY} {channelname}`
5. Loudres should play audio again

## Stopping the Client

1. Perform the steps in "Setup" and "Happy Path"
2. Kill the server (ctrl+c)
3. Loudred should remove itself from the channels it was in.

## Listing Commands

1. Type just `@loudred`
2. You should see a list of commands Loudred can use
3. Type `@loudred {HELP}`
4. You should see the same list

## Listing Voice Channels

1. Type `@loudred {LIST}`
2. You should see a list of all the voice channels in the current server
