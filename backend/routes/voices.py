#This file creates GET /api/voices so the settings screen can list voice options.

from fastapi import APIRouter

from voices import DEFAULT_ACCENT, ENGLISH_VOICES, TELUGU_VOICES

router = APIRouter()


@router.get("/voices")
def get_voices():
    return {
        "telugu": TELUGU_VOICES,          # first one is the default (Diya)
        "english": ENGLISH_VOICES,        # accent -> voices, first is default
        "defaultAccent": DEFAULT_ACCENT,
    }
