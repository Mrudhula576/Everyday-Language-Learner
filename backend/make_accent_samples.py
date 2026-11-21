"""Make the short accent samples played on the landing page.

Run from the backend folder (venv active):
    python make_accent_samples.py

Writes one small MP3 per accent into frontend/audio/accents/<accent>.mp3,
using each accent's default voice from voices.py. Re-run it after changing a
default voice or the sample sentence. The files are committed, so the landing
page plays them without calling Azure.
"""
import os
from pathlib import Path

import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

from voices import ENGLISH_VOICES, english_voice

load_dotenv(Path(__file__).parent / ".env")

# Same sentence for every accent, so they're easy to compare.
TEXT = "Hello! Shall we learn some everyday English together? Let's start with a cup of tea."

OUT_DIR = Path(__file__).parent.parent / "frontend" / "audio" / "accents"
OUT_DIR.mkdir(parents=True, exist_ok=True)

config = speechsdk.SpeechConfig(
    subscription=os.getenv("AZURE_SPEECH_KEY"),
    region=os.getenv("AZURE_SPEECH_REGION"),
)
# Small MP3s (about 30 KB each) instead of WAV.
config.set_speech_synthesis_output_format(
    speechsdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3
)

failed = 0
for accent in ENGLISH_VOICES:
    voice = english_voice(accent)
    config.speech_synthesis_voice_name = voice
    out_file = OUT_DIR / f"{accent}.mp3"
    audio = speechsdk.audio.AudioOutputConfig(filename=str(out_file))
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=config, audio_config=audio)
    result = synthesizer.speak_text_async(TEXT).get()
    del synthesizer  # releases the output file before the next voice

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print(f"OK    {accent:6} {voice}")
    else:
        failed += 1
        details = result.cancellation_details
        print(f"FAIL  {accent:6} {voice}: {details.reason} {details.error_details}")

raise SystemExit(1 if failed else 0)
