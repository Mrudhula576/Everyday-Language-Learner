"""All Azure voice choices live here, so changing a voice is a one-line edit.

The first voice in each list is the default; the rest are options users can
pick in settings. HD voices were chosen because the standard ones sounded too
alike across accents (see compare_voices.py).
"""

# Telugu guidance voice. There is no Telugu-native HD voice, so these are
# multilingual Indian HD voices. They must be sent SSML with
# <lang xml:lang="te-IN"> around the text, or they read it with the wrong accent.
TELUGU_VOICES = [
    {"id": "en-IN-Diya:DragonHDLatestNeural", "name": "Diya", "gender": "female"},
    {"id": "en-IN-Aarti:DragonHDLatestNeural", "name": "Aarti", "gender": "female"},
    {"id": "en-IN-Meera:DragonHDLatestNeural", "name": "Meera", "gender": "female"},
    {"id": "en-IN-Neerja:DragonHDLatestNeural", "name": "Neerja", "gender": "female"},
    {"id": "en-IN-Arjun:DragonHDLatestNeural", "name": "Arjun", "gender": "male"},
]
TELUGU_LOCALE = "te-IN"

# English accent -> voices. Ireland, South Africa and Nigeria have no HD voice
# in Azure yet, so they use standard voices for now.
ENGLISH_VOICES = {
    "en-US": [
        {"id": "en-US-Ava:DragonHDLatestNeural", "name": "Ava", "gender": "female"},
        {"id": "en-US-Harper:MAI-Voice-2.1", "name": "Harper", "gender": "female"},
        {"id": "en-US-Andrew:DragonHDLatestNeural", "name": "Andrew", "gender": "male"},
    ],
    "en-GB": [
        {"id": "en-GB-Sonia:DragonHDLatestNeural", "name": "Sonia", "gender": "female"},
        {"id": "en-GB-Emily:MAI-Voice-2.1", "name": "Emily", "gender": "female"},
        {"id": "en-GB-Ryan:DragonHDLatestNeural", "name": "Ryan", "gender": "male"},
    ],
    "en-AU": [
        {"id": "en-AU-Isla:MAI-Voice-2.1", "name": "Isla", "gender": "female"},
    ],
    "en-IN": [
        {"id": "en-IN-Neerja:DragonHDLatestNeural", "name": "Neerja", "gender": "female"},
        {"id": "en-IN-Diya:DragonHDLatestNeural", "name": "Diya", "gender": "female"},
        {"id": "en-IN-Arjun:DragonHDLatestNeural", "name": "Arjun", "gender": "male"},
    ],
    "en-IE": [{"id": "en-IE-EmilyNeural", "name": "Emily", "gender": "female"}],
    "en-ZA": [{"id": "en-ZA-LeahNeural", "name": "Leah", "gender": "female"}],
    "en-NG": [{"id": "en-NG-EzinneNeural", "name": "Ezinne", "gender": "female"}],
}

DEFAULT_ACCENT = "en-IN"


def telugu_voice(voice_id=None):
    """Return the requested Telugu voice id if it's allowed, else the default."""
    ids = [v["id"] for v in TELUGU_VOICES]
    return voice_id if voice_id in ids else ids[0]


def english_voice(accent=None, voice_id=None):
    """Return the requested voice for an accent if allowed, else that accent's default."""
    voices = ENGLISH_VOICES.get(accent) or ENGLISH_VOICES[DEFAULT_ACCENT]
    ids = [v["id"] for v in voices]
    return voice_id if voice_id in ids else ids[0]
