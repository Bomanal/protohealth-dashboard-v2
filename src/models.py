"""Canonical database schema for the ProtoAI triage system (plain PostgreSQL 13+).

Shared by the voice bot (this repo) and the dashboard API (protohealth-dashboard-v2/src/models.py must be
an identical copy). Schema changes go through Alembic migrations in alembic/versions/.
"""
from typing import Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKeyConstraint, Integer, PrimaryKeyConstraint, Text, Time, Uuid, text, String, UniqueConstraint, Index, Boolean, func, Date
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
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

    session_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    user_id: Mapped[str] = mapped_column(Text)
    protocol_name: Mapped[Optional[str]] = mapped_column(Text)
    call_start_time: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    call_end_time: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    call_duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    daily_room_url: Mapped[Optional[str]] = mapped_column(Text)
    confirmation_retries: Mapped[Optional[int]] = mapped_column(Integer)
    conversation_status: Mapped[Optional[str]] = mapped_column(Text)
    user_name: Mapped[Optional[str]] = mapped_column(Text)
    # Exact protocol version the call ran (protocol_versions.version_id); null for file-loaded protocols
    protocol_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)


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
    dob: Mapped[Optional[datetime.date]] = mapped_column(Date)  # new column


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


# -----------------------------------------------------------------------------
# Protocol store (source of truth for what calls run). The matrix tables below (triage_protocols_list,
# protocol_threads, nodes, thread_node_values, thread_outcomes) are a read model projected from
# protocol_versions.bundle for the dashboard's matrix editor.
# -----------------------------------------------------------------------------

class Protocols(Base):
    __tablename__ = 'protocols'
    __table_args__ = (
        PrimaryKeyConstraint('protocol_id', name='protocols_pkey'),
        CheckConstraint("kind IN ('inbound', 'outbound')", name='protocols_kind_check'),
        Index('uq_protocols_procedure_type', 'procedure_type', unique=True,
              postgresql_where=text('procedure_type IS NOT NULL')),
    )

    protocol_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(Text)
    procedure_type: Mapped[Optional[str]] = mapped_column(String(100))  # outbound lookup key
    active_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)  # the approved version calls run
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())


class ProtocolVersions(Base):
    __tablename__ = 'protocol_versions'
    __table_args__ = (
        PrimaryKeyConstraint('version_id', name='protocol_versions_pkey'),
        ForeignKeyConstraint(['protocol_id'], ['protocols.protocol_id'], ondelete='CASCADE', name='fk_pv_protocol_id'),
        UniqueConstraint('protocol_id', 'version', name='uq_protocol_versions_protocol_version'),
        CheckConstraint("status IN ('processing', 'failed', 'draft', 'approved', 'archived')",
                        name='protocol_versions_status_check'),
        Index('idx_pv_protocol_id', 'protocol_id'),
    )

    version_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    protocol_id: Mapped[str] = mapped_column(String(32), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    bundle: Mapped[Optional[dict]] = mapped_column(JSONB)  # runtime format (inbound bundle / outbound protocol)
    source_document: Mapped[Optional[str]] = mapped_column(Text)
    source_filename: Mapped[Optional[str]] = mapped_column(String(255))
    generator_model: Mapped[Optional[str]] = mapped_column(String(100))
    validation_errors: Mapped[Optional[list]] = mapped_column(JSONB)
    error: Mapped[Optional[str]] = mapped_column(Text)
    created_by: Mapped[Optional[str]] = mapped_column(String(255))
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(255))
    reviewed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())


class AppSettings(Base):
    __tablename__ = 'app_settings'
    __table_args__ = (PrimaryKeyConstraint('key', name='app_settings_pkey'),)

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


# Matrix tables (read model for the dashboard editor)

class TriageProtocolsList(Base):
    __tablename__ = 'triage_protocols_list'
    __table_args__ = (
        PrimaryKeyConstraint('protocol_id', name='triage_protocols_list_pkey'),
        UniqueConstraint('protocol_name', name='triage_protocols_list_protocol_name_key'),
        Index('idx_tpl_protocol_name', 'protocol_name')
    )

    protocol_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    protocol_name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    protocol_description: Mapped[str] = mapped_column(Text, nullable=False)
    # Used by the dashboard's protocol upload pipeline
    protocol_internal_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True)
    status: Mapped[Optional[str]] = mapped_column(String(50))
    extra: Mapped[Optional[dict]] = mapped_column(JSONB)

    # Add this relationship
    protocol_threads = relationship("ProtocolThreads", back_populates="protocol")


class ProtocolThreads(Base):
    __tablename__ = 'protocol_threads'
    __table_args__ = (
        PrimaryKeyConstraint('thread_id', name='protocol_threads_pkey'),
        ForeignKeyConstraint(['protocol_id'], ['triage_protocols_list.protocol_id'], name='fk_pt_protocol_id'),
        Index('idx_pt_protocol_id', 'protocol_id')
    )

    thread_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    protocol_id: Mapped[str] = mapped_column(String(32), nullable=False)
    thread_criticality: Mapped[Optional[str]] = mapped_column(String(20))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationship to TriageProtocolsList
    protocol = relationship("TriageProtocolsList", back_populates="protocol_threads")
    # Relationship to ThreadNodeValues
    thread_node_values = relationship("ThreadNodeValues", back_populates="protocol_thread")
    # Relationship to ThreadOutcomes
    thread_outcome = relationship("ThreadOutcomes", back_populates="protocol_thread", uselist=False)


class Nodes(Base):
    __tablename__ = 'nodes'
    __table_args__ = (
        PrimaryKeyConstraint('node_id', name='nodes_pkey'),
        Index('idx_nodes_node_name', 'node_name'),
        Index('idx_nodes_node_category', 'node_category')
    )

    node_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    node_name: Mapped[str] = mapped_column(String(255), nullable=False)
    node_category: Mapped[str] = mapped_column(String(100), nullable=False)

    # Relationship to ThreadNodeValues
    thread_node_values = relationship("ThreadNodeValues", back_populates="node")


class ThreadNodeValues(Base):
    __tablename__ = 'thread_node_values'
    __table_args__ = (
        PrimaryKeyConstraint('thread_id', 'node_id', name='thread_node_values_pkey'),
        ForeignKeyConstraint(['thread_id'], ['protocol_threads.thread_id'], name='fk_tnv_thread_id'),
        ForeignKeyConstraint(['node_id'], ['nodes.node_id'], name='fk_tnv_node_id'),
        Index('idx_tnv_thread_id', 'thread_id'),
        Index('idx_tnv_node_id', 'node_id')
    )

    thread_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    node_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    node_value: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    protocol_thread = relationship("ProtocolThreads", back_populates="thread_node_values")
    node = relationship("Nodes", back_populates="thread_node_values")


class ThreadOutcomes(Base):
    __tablename__ = 'thread_outcomes'
    __table_args__ = (
        PrimaryKeyConstraint('thread_id', name='thread_outcomes_pkey'),
        ForeignKeyConstraint(['thread_id'], ['protocol_threads.thread_id'], name='fk_to_thread_id')
    )

    thread_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    triage_outcome: Mapped[Optional[str]] = mapped_column(Text)
    home_care_advice: Mapped[Optional[str]] = mapped_column(Text)
    final_condition: Mapped[Optional[str]] = mapped_column(Text)
    acceptance: Mapped[Optional[bool]] = mapped_column(Boolean)
    modified_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    extra: Mapped[Optional[str]] = mapped_column(Text) # The 'extra' column

    # Relationship to ProtocolThreads
    protocol_thread = relationship("ProtocolThreads", back_populates="thread_outcome")


class NodeValuesQuestionsJson(Base):
    __tablename__ = 'node_values_questions_json'
    __table_args__ = (
        PrimaryKeyConstraint('protocol_name_from_file', name='node_values_questions_json_pkey'),
        ForeignKeyConstraint(['protocol_id'], ['triage_protocols_list.protocol_id'], name='fk_nvqj_protocol_id'),
        Index('idx_nvqj_protocol_name_from_file', 'protocol_name_from_file'),
        Index('idx_nvqj_protocol_id', 'protocol_id')
    )

    protocol_name_from_file: Mapped[str] = mapped_column(String(255), primary_key=True)
    protocol_id: Mapped[str] = mapped_column(String(32), nullable=False)
    json_data: Mapped[str] = mapped_column(Text, nullable=False) # Assuming this column holds the JSON data


class Personas(Base):
    __tablename__ = 'personas'
    __table_args__ = (
        PrimaryKeyConstraint('persona_id', name='personas_pkey'),
        ForeignKeyConstraint(['protocol_id'], ['triage_protocols_list.protocol_id'], name='fk_personas_protocol_id'),
        ForeignKeyConstraint(['assigned_thread_id'], ['protocol_threads.thread_id'], name='fk_personas_thread_id'),
        Index('idx_personas_protocol_id', 'protocol_id'),
        Index('idx_personas_thread_id', 'assigned_thread_id'),
        Index('idx_personas_user_name', 'user_name')
    )

    persona_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    assigned_thread_id: Mapped[str] = mapped_column(String(32), nullable=False)
    protocol_id: Mapped[str] = mapped_column(String(32), nullable=False)
    final_condition: Mapped[str] = mapped_column(String(255), nullable=False)
    user_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[Optional[datetime.date]] = mapped_column(Date)
    age: Mapped[Optional[int]] = mapped_column(Integer)
    phone_number: Mapped[Optional[str]] = mapped_column(String(50))
    callback_phone_number: Mapped[Optional[str]] = mapped_column(String(50))
    current_complaint: Mapped[Optional[str]] = mapped_column(Text)
    symptoms: Mapped[Optional[str]] = mapped_column(Text)
    medical_history: Mapped[Optional[str]] = mapped_column(Text)
    persona_description: Mapped[Optional[str]] = mapped_column(Text)
    personality: Mapped[Optional[str]] = mapped_column(String(100))
    patient_emotion: Mapped[Optional[str]] = mapped_column(String(100))
    patient_tonality: Mapped[Optional[str]] = mapped_column(String(100))
    patient_clarity: Mapped[Optional[str]] = mapped_column(String(100))
    pain_level: Mapped[Optional[int]] = mapped_column(Integer)
    urgency_perception: Mapped[Optional[str]] = mapped_column(String(255))
    communication_preference: Mapped[Optional[str]] = mapped_column(String(255))
    patient_interaction: Mapped[Optional[str]] = mapped_column(Text)
    extra_details: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    protocol = relationship("TriageProtocolsList")
    thread = relationship("ProtocolThreads")


# --- Outbound call scheduling (written by the dashboard API) ---
class Patients(Base):
    __tablename__ = 'patients'
    __table_args__ = (
        PrimaryKeyConstraint('patient_id', name='patients_pkey'),
        Index('idx_patients_phone_number', 'phone_number'),
        Index('idx_patients_name', 'name')
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    name: Mapped[Optional[str]] = mapped_column(String(255))
    phone_number: Mapped[Optional[str]] = mapped_column(String(20))
    dob: Mapped[Optional[datetime.date]] = mapped_column(Date)
    medical_history: Mapped[Optional[str]] = mapped_column(Text)
    patient_context: Mapped[Optional[str]] = mapped_column(Text)
    gender: Mapped[Optional[str]] = mapped_column(String(50))

    # Relationship to OutboundCalls
    calls = relationship("OutboundCalls", back_populates="patient")


class OutboundCalls(Base):
    __tablename__ = 'outbound_calls'
    __table_args__ = (
        PrimaryKeyConstraint('call_id', name='calls_pkey'),
        ForeignKeyConstraint(['patient_id'], ['patients.patient_id'], name='calls_patient_id_fkey')
    )

    call_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    patient_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, nullable=True)
    call_date: Mapped[Optional[datetime.date]] = mapped_column(Date)
    call_time: Mapped[Optional[datetime.time]] = mapped_column(Time)
    event_date: Mapped[Optional[datetime.date]] = mapped_column(Date)
    call_type: Mapped[Optional[str]] = mapped_column(String(50))
    doctor_instructions: Mapped[Optional[str]] = mapped_column(Text)
    nurse_instructions: Mapped[Optional[str]] = mapped_column(Text)
    reschedule_date: Mapped[Optional[datetime.date]] = mapped_column(Date)
    reschedule_time: Mapped[Optional[datetime.time]] = mapped_column(Time)
    Procedure: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    patient = relationship("Patients", back_populates="calls")
    # One call -> one summary (via outbound_call_summary.call_id FK)
    call_summary = relationship("OutboundCallSummary", back_populates="call", uselist=False)


class OutboundCallSummary(Base):
    __tablename__ = 'outbound_call_summary'
    __table_args__ = (
        PrimaryKeyConstraint('summary_id', name='callsummaries_pkey'),
        ForeignKeyConstraint(['call_id'], ['outbound_calls.call_id'], name='callsummaries_call_id_fkey')
    )

    summary_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    call_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, nullable=True)
    all_instructions_covered: Mapped[Optional[bool]] = mapped_column(Boolean)
    satisfied: Mapped[Optional[bool]] = mapped_column(Boolean)
    additional_questions: Mapped[Optional[str]] = mapped_column(Text)
    confidence_level: Mapped[Optional[int]] = mapped_column(Integer)
    follow_up_needed: Mapped[Optional[bool]] = mapped_column(Boolean)
    reschedule_requested: Mapped[Optional[bool]] = mapped_column(Boolean)
    patient_requested_date: Mapped[Optional[datetime.date]] = mapped_column(Date)
    patient_requested_time: Mapped[Optional[datetime.time]] = mapped_column(Time)
    family_member_name: Mapped[Optional[str]] = mapped_column(String(255))
    family_member_relation: Mapped[Optional[str]] = mapped_column(String(100))
    concern_raised: Mapped[Optional[str]] = mapped_column(Text)
    call_status: Mapped[Optional[str]] = mapped_column(String(50))

    # Relationship to OutboundCalls (one call -> one summary)
    call = relationship("OutboundCalls", back_populates="call_summary")
    # Relationship to OutboundTranscripts (one summary -> one transcript)
    call_transcript = relationship("OutboundTranscripts", back_populates="call_summary", uselist=False)


class OutboundTranscripts(Base):
    __tablename__ = 'outbound_transcripts'
    __table_args__ = (
        PrimaryKeyConstraint('summary_id', name='call_transcripts_pkey'),
        ForeignKeyConstraint(['summary_id'], ['outbound_call_summary.summary_id'], name='fk_call_transcripts_summary_id')
    )

    summary_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    conversation_transcript: Mapped[Optional[dict]] = mapped_column(JSONB)
    conversation_summary: Mapped[Optional[str]] = mapped_column(Text)

    # Relationship to OutboundCallSummary (one transcript -> one summary)
    call_summary = relationship("OutboundCallSummary", back_populates="call_transcript")