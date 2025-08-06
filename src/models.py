from typing import Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKeyConstraint, Integer, PrimaryKeyConstraint, Text, Uuid, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
import datetime
import uuid

class Base(DeclarativeBase):
    pass


class Conversations(Base):
    __tablename__ = 'conversations'
    __table_args__ = (
        CheckConstraint("conversation_status = ANY (ARRAY['completed'::text, 'abandoned'::text, 'error'::text])", name='conversations_conversation_status_check'),
        PrimaryKeyConstraint('session_id', name='conversations_pkey')
    )

    session_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('uuid_generate_v4()'))
    user_id: Mapped[str] = mapped_column(Text)
    protocol_name: Mapped[Optional[str]] = mapped_column(Text)
    call_start_time: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    call_end_time: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    call_duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    daily_room_url: Mapped[Optional[str]] = mapped_column(Text)
    confirmation_retries: Mapped[Optional[int]] = mapped_column(Integer)
    conversation_status: Mapped[Optional[str]] = mapped_column(Text)
    user_name: Mapped[Optional[str]] = mapped_column(Text)


class ConversationTranscripts(Base):
    __tablename__ = 'conversation_transcripts'
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['conversations.session_id'], ondelete='CASCADE', name='conversation_transcripts_session_id_fkey'),
        PrimaryKeyConstraint('session_id', name='conversation_transcripts_pkey')
    )

    session_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    conversation_transcript: Mapped[Optional[dict]] = mapped_column(JSONB)
    conversation_summary: Mapped[Optional[str]] = mapped_column(Text)


class ErrorLogs(Base):
    __tablename__ = 'error_logs'
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['conversations.session_id'], ondelete='CASCADE', name='error_logs_session_id_fkey'),
        PrimaryKeyConstraint('session_id', name='error_logs_pkey')
    )

    session_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    errors_encountered: Mapped[Optional[dict]] = mapped_column(JSONB)
    pipeline_failures: Mapped[Optional[dict]] = mapped_column(JSONB)


class InitialAssessments(Base):
    __tablename__ = 'initial_assessments'
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['conversations.session_id'], ondelete='CASCADE', name='initial_assessments_session_id_fkey'),
        PrimaryKeyConstraint('session_id', name='initial_assessments_pkey')
    )

    session_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    medical_history: Mapped[Optional[str]] = mapped_column(Text)
    current_complaint: Mapped[Optional[str]] = mapped_column(Text)
    body_part_affected: Mapped[Optional[str]] = mapped_column(Text)


class PerformanceMetrics(Base):
    __tablename__ = 'performance_metrics'
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['conversations.session_id'], ondelete='CASCADE', name='performance_metrics_session_id_fkey'),
        PrimaryKeyConstraint('session_id', name='performance_metrics_pkey')
    )

    session_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    llm_calls: Mapped[Optional[dict]] = mapped_column(JSONB)
    stt_performance: Mapped[Optional[dict]] = mapped_column(JSONB)
    tts_performance: Mapped[Optional[dict]] = mapped_column(JSONB)
    audio_metadata: Mapped[Optional[dict]] = mapped_column(JSONB)


class TriageOutcomes(Base):
    __tablename__ = 'triage_outcomes'
    __table_args__ = (
        ForeignKeyConstraint(['session_id'], ['conversations.session_id'], ondelete='CASCADE', name='triage_outcomes_session_id_fkey'),
        PrimaryKeyConstraint('session_id', name='triage_outcomes_pkey')
    )

    session_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    final_condition: Mapped[Optional[str]] = mapped_column(Text)
    triage_outcome: Mapped[Optional[str]] = mapped_column(Text)
    final_message_to_user: Mapped[Optional[str]] = mapped_column(Text)
