#!/usr/bin/env python3
# Builds a narration track from videos/captions.json using Piper TTS,
# placing each line at the moment its caption appeared in the recording.
# usage: narrate.py <piper_bin> <voice.onnx> <out.wav>
import json, os, subprocess, sys, wave
piper, voice, out = sys.argv[1:4]
caps = [c for c in json.load(open('videos/captions.json')) if c.get('say')]
if not caps:
    print('NARRATE: no say lines, skipping'); sys.exit(0)
os.makedirs('tts', exist_ok=True)
inputs, filt, warn = [], [], 0
for n, c in enumerate(caps):
    wav = f'tts/{n:02d}.wav'
    subprocess.run([piper, '--model', voice, '--output_file', wav], input=c['say'].encode(), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with wave.open(wav) as w: dur = w.getnframes() / w.getframerate()
    start = c['t'] + 0.25
    nxt = caps[n + 1]['t'] if n + 1 < len(caps) else None
    gap = (nxt - start) if nxt else 99
    flag = '' if dur <= gap else '  <-- OVERLAP'
    if flag: warn += 1
    print(f"NARRATE {n:02d} @{start:6.2f}s len {dur:4.1f}s gap {gap:5.1f}s{flag}  {c['say'][:50]}")
    inputs += ['-i', wav]
    ms = int(start * 1000)
    filt.append(f'[{n}:a]adelay={ms}|{ms}[a{n}]')
mix = ''.join(f'[a{n}]' for n in range(len(caps)))
filt.append(f'{mix}amix=inputs={len(caps)}:normalize=0,aresample=48000[out]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filt), '-map', '[out]', out], check=True)
print(f'NARRATE: wrote {out}, {len(caps)} lines, {warn} overlaps')
