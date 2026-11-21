#Middleware works like this: Client Request  ➡️  [ Middleware Execution (Pre-processing) ]  ➡️  Path Operation / Endpoint
#                                                                                                       ⬇️
#                            Client Response ⬅️  [ Middleware Execution (Post-processing) ] ⬅️  Response Generated


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.scenarios import router as scenarios_router
from routes.voices import router as voices_router
app = FastAPI(title="ELL API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(
    scenarios_router,
    prefix="/api",
)
app.include_router(voices_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Everyday Language Learner is running!"}

#Now the backend has 3 endpoints (GET /, GET /api/scenarios, GET /api/voices)
