from typing import List, Optional

from sqlalchemy import Date, DateTime, ForeignKeyConstraint, Index, Integer, PrimaryKeyConstraint, String, Text, UniqueConstraint, Uuid, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import datetime
import uuid

class Base(DeclarativeBase):
    pass


class OutboundFlows(Base):
    __tablename__ = 'outbound_flows'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='outbound_flows_pkey'),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    name: Mapped[str] = mapped_column(String(255))
    department: Mapped[str] = mapped_column(String(50))
    created_date: Mapped[datetime.date] = mapped_column(Date, default=datetime.date.today)
    status: Mapped[str] = mapped_column(String(20))
    description: Mapped[Optional[str]] = mapped_column(Text)
    patient_count: Mapped[Optional[int]] = mapped_column(Integer, server_default=text('0'))
    completed_count: Mapped[Optional[int]] = mapped_column(Integer, server_default=text('0'))
    needs_action_count: Mapped[Optional[int]] = mapped_column(Integer, server_default=text('0'))
    channel: Mapped[Optional[str]] = mapped_column(String(20))
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

    patient_interactions: Mapped[List['PatientInteractions']] = relationship('PatientInteractions', back_populates='outbound_flow')


class Patients(Base):
    __tablename__ = 'patients'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='patients_pkey'),
        UniqueConstraint('patient_id', name='patients_patient_id_key')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    patient_id: Mapped[str] = mapped_column(String(50))
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    birthday: Mapped[Optional[datetime.date]] = mapped_column(Date)
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    contact_info: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    ehr_notes: Mapped[Optional[dict]] = mapped_column(JSONB)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

    patient_interactions: Mapped[List['PatientInteractions']] = relationship('PatientInteractions', back_populates='patient')


class PatientInteractions(Base):
    __tablename__ = 'patient_interactions'
    __table_args__ = (
        ForeignKeyConstraint(['outbound_flow_id'], ['outbound_flows.id'], ondelete='SET NULL', name='patient_interactions_outbound_flow_id_fkey'),
        ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE', name='patient_interactions_patient_id_fkey'),
        PrimaryKeyConstraint('id', name='patient_interactions_pkey'),
        Index('idx_interactions_outbound_flow_id', 'outbound_flow_id'),
        Index('idx_interactions_patient_id', 'patient_id')
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text('gen_random_uuid()'))
    patient_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    status: Mapped[str] = mapped_column(String(30))
    source: Mapped[str] = mapped_column(String(30))
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime)
    outbound_flow_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid)
    source_detail: Mapped[Optional[str]] = mapped_column(String(255))
    last_contact: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    priority: Mapped[Optional[str]] = mapped_column(String(20))
    department: Mapped[Optional[str]] = mapped_column(String(50))
    channel: Mapped[Optional[str]] = mapped_column(String(20))
    conversation_history: Mapped[Optional[dict]] = mapped_column(JSONB)
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

    outbound_flow: Mapped[Optional['OutboundFlows']] = relationship('OutboundFlows', back_populates='patient_interactions')
    patient: Mapped['Patients'] = relationship('Patients', back_populates='patient_interactions')
