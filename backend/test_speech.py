"""Quick check that the Azure Speech key works.

Run from the backend folder (with the venv active):
    python test_speech.py

It writes one .wav file per voice into backend/speech_samples/ so you can
hear Telugu plus the same English sentence in several regional accents.
"""
import os
from pathlib import Path

import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

load_dotenv()

KEY = os.getenv("AZURE_SPEECH_KEY")
REGION = os.getenv("AZURE_SPEECH_REGION")
if not KEY or not REGION:
    raise SystemExit("Add AZURE_SPEECH_KEY and AZURE_SPEECH_REGION to backend/.env first.")

OUT_DIR = Path(__file__).parent / "speech_samples"
OUT_DIR.mkdir(exist_ok=True)

ENGLISH = "Hi! Could I get a coffee and a sandwich, please?"
SAMPLES = [
    ("te-IN-ShrutiNeural", "నమస్కారం! ఈ రోజు మనం ఇంగ్లీష్ నేర్చుకుందాం.", "telugu"),
    ("en-US-JennyNeural", ENGLISH, "english_us"),
    ("en-GB-SoniaNeural", ENGLISH, "english_uk"),
    ("en-AU-NatashaNeural", ENGLISH, "english_australia"),
    ("en-IN-NeerjaNeural", ENGLISH, "english_india"),
]

speech_config = speechsdk.SpeechConfig(subscription=KEY, region=REGION)

for voice, text, name in SAMPLES:
    speech_config.speech_synthesis_voice_name = voice
    out_file = OUT_DIR / f"{name}.wav"
    audio_config = speechsdk.audio.AudioOutputConfig(filename=str(out_file))
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)

    result = synthesizer.speak_text_async(text).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print(f"OK    {voice:22} -> {out_file}")
    else:
        details = result.cancellation_details
        print(f"FAIL  {voice:22} {details.reason}: {details.error_details}")
        raise SystemExit("Check that the key and region in .env match the Azure portal.")
