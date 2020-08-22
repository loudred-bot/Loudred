# Loudred - Discord Bot for streaming audio

Writing this to serve as some sort of replacement for the lack of audio in Go Live with Discord on MacOS.

# Notes to Me

This is a script that gets all the files and processes using CoreAudio. Might be useful for picking up audio data from a single source

```bash
lsof | grep -i coreaudio
```
