#File - Connects FastAPI to Supabase.
import os #lets python code talk to computers operating system
from dotenv import load_dotenv #tool used to load secret keys and configuration settings from .env
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase environment variables are missing.")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)