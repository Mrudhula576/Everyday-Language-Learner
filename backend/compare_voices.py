"""Compare Azure's standard voices with the newer HD voices, per accent.

Run from the backend folder (venv active):
    python compare_voices.py

Writes files into backend/speech_samples/compare/ named
<accent>_<standard|hd>_<voice>.wav so you can listen side by side.
"""
import os
from pathlib import Path

import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# Words chosen because accents differ on them: can't / dance / car park
# (vowels and r-sounds), water / Saturday (the "t"), there (r at the end).
TEXT = (
    "Oh, sorry, I can't find the car park. Could you ask the lady over there "
    "if the water's free? I'll be back on Saturday, after my dance class."
)

VOICES = [
    ("us", "standard", "en-US-JennyNeural"),
    ("us", "hd", "en-US-Ava:DragonHDLatestNeural"),
    ("us", "hd", "en-US-Harper:MAI-Voice-2.1"),
    ("uk", "standard", "en-GB-SoniaNeural"),
    ("uk", "hd", "en-GB-Sonia:DragonHDLatestNeural"),
    ("uk", "hd", "en-GB-Emily:MAI-Voice-2.1"),
    ("australia", "standard", "en-AU-NatashaNeural"),
    ("australia", "hd", "en-AU-Isla:MAI-Voice-2.1"),
    ("india", "standard", "en-IN-NeerjaNeural"),
    ("india", "hd", "en-IN-Neerja:DragonHDLatestNeural"),
    ("ireland", "standard", "en-IE-EmilyNeural"),
    ("southafrica", "standard", "en-ZA-LeahNeural"),
    ("nigeria", "standard", "en-NG-EzinneNeural"),
]

OUT_DIR = Path(__file__).parent / "speech_samples" / "compare"
OUT_DIR.mkdir(parents=True, exist_ok=True)

config = speechsdk.SpeechConfig(
    subscription=os.getenv("AZURE_SPEECH_KEY"),
    region=os.getenv("AZURE_SPEECH_REGION"),
)

for accent, kind, voice in VOICES:
    config.speech_synthesis_voice_name = voice
    safe = voice.replace(":", "_")
    out_file = OUT_DIR / f"{accent}_{kind}_{safe}.wav"
    audio = speechsdk.audio.AudioOutputConfig(filename=str(out_file))
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=config, audio_config=audio)
    result = synthesizer.speak_text_async(TEXT).get()
    del synthesizer  # releases the output file before the next voice

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print(f"OK    {voice}")
    else:
        d = result.cancellation_details
        out_file.unlink(missing_ok=True)
        print(f"FAIL  {voice}: {d.error_details}")
