from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv(".env.local")  # This loads variables from .env.local into os.environ


def _build_database_url() -> str:
    """Prefer DATABASE_URL; otherwise assemble one from the DB_* variables."""
    url = os.getenv("DATABASE_URL")
    if url:
        # Normalise the common Heroku-style scheme for SQLAlchemy
        if url.startswith("postgres://"):
            url = "postgresql+psycopg2://" + url[len("postgres://"):]
        return url

    user = os.getenv("DB_USERNAME")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    dbname = os.getenv("DB_NAME")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}"


DATABASE_URL = _build_database_url()
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # transparently replace connections dropped by the server
    hide_parameters=True,  # keep bound values (PHI) out of SQLAlchemy error messages/logs
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
