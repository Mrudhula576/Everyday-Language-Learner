#This file creates GET /api/scenarios and asks Supabase "Give me all scenarios ordered by id"

from fastapi import APIRouter
from database import supabase

router = APIRouter()

@router.get("/scenarios")
def get_scenarios():
    response = (
        supabase
        .table("scenarios")
        .select("*")
        .order("id")
        .execute()
    )

    return response.data

