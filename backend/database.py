import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_PATH = os.path.join(os.path.dirname(__file__), "vlm_hallucinations.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    prompt = Column(Text, nullable=False)
    image_filename = Column(String, nullable=True)
    model_name = Column(String, default="Gemma-4 VLM (Multimodal)")
    overall_hallucination_score = Column(Float, default=0.0)
    visual_drift_index = Column(Float, default=0.0)
    mean_entropy = Column(Float, default=0.0)
    hallucination_intensity = Column(String, default="Moderate")
    generated_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    extracted_tokens = relationship("ExtractedTokenModel", back_populates="session", cascade="all, delete-orphan")


class ExtractedTokenModel(Base):
    __tablename__ = "extracted_tokens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    token_index = Column(Integer, nullable=False)
    token_text = Column(String, nullable=False)
    logit_entropy = Column(Float, nullable=False)
    visual_grounding_score = Column(Float, nullable=False)
    is_hallucinated = Column(Boolean, default=False)
    attention_x = Column(Float, default=0.5)
    attention_y = Column(Float, default=0.5)

    session = relationship("SessionModel", back_populates="extracted_tokens")


class TrainingSampleModel(Base):
    __tablename__ = "training_samples"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String, nullable=False)
    prompt = Column(Text, nullable=False)
    hallucinated_segment = Column(Text, nullable=False)
    ground_truth_context = Column(Text, nullable=True)
    sample_type = Column(String, default="Hallucinated Pair")
    created_at = Column(DateTime, default=datetime.utcnow)


class MedicalReviewModel(Base):
    __tablename__ = "medical_reviews"

    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, nullable=False)
    modality = Column(String, nullable=False) # e.g. X-Ray, MRI, CT
    finding_prompt = Column(Text, nullable=False)
    ai_generated_diagnosis = Column(Text, nullable=False)
    anatomical_grounding_score = Column(Float, nullable=False)
    hallucination_risk_level = Column(String, nullable=False) # Low, Warning, Critical
    flagged_entities = Column(Text, nullable=True) # JSON list string of ungrounded terms
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelComparisonModel(Base):
    __tablename__ = "model_comparisons"

    id = Column(String, primary_key=True, index=True)
    prompt = Column(Text, nullable=False)
    dola_alpha = Column(Float, default=0.5)
    results_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class PuzzleModel(Base):
    __tablename__ = "puzzles"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g., Spatial 3D, Optical Illusion, Counting Grid, Counterfactual, OCR Trick
    question = Column(Text, nullable=False)
    ground_truth_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    difficulty = Column(String, default="Hard")
    created_at = Column(DateTime, default=datetime.utcnow)

    evaluations = relationship("PuzzleEvalModel", back_populates="puzzle", cascade="all, delete-orphan")


class PuzzleEvalModel(Base):
    __tablename__ = "puzzle_evaluations"

    id = Column(String, primary_key=True, index=True)
    puzzle_id = Column(String, ForeignKey("puzzles.id"), nullable=False)
    model_name = Column(String, nullable=False)
    vlm_response = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    hallucination_score = Column(Float, default=0.0)
    hallucination_type = Column(String, default="None") # e.g., Spurious Count, Optical Distortion Fallacy, Object Invention
    diagnostic_proof = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    puzzle = relationship("PuzzleModel", back_populates="evaluations")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

