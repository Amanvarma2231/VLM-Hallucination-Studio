from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class TokenDetail(BaseModel):
    token_index: int
    token_text: str
    logit_entropy: float
    visual_grounding_score: float
    is_hallucinated: bool
    attention_x: float
    attention_y: float


class AnalyzeRequest(BaseModel):
    prompt: str
    model_name: Optional[str] = "Gemma-4 VLM (Multimodal)"
    entropy_threshold: Optional[float] = 0.65
    grounding_bias: Optional[float] = 0.5


class SessionResponse(BaseModel):
    id: str
    prompt: str
    image_filename: Optional[str] = None
    model_name: str
    overall_hallucination_score: float
    visual_drift_index: float
    mean_entropy: float
    hallucination_intensity: str
    generated_text: Optional[str] = None
    created_at: datetime
    extracted_tokens: List[TokenDetail] = []

    class Config:
        from_attributes = True


class TrainingSampleResponse(BaseModel):
    id: int
    session_id: str
    prompt: str
    hallucinated_segment: str
    ground_truth_context: Optional[str] = None
    sample_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class CompareRequest(BaseModel):
    prompt: str
    dola_alpha: Optional[float] = 0.5


class CompareResultItem(BaseModel):
    model_name: str
    overall_hallucination_score: float
    visual_drift_index: float
    mean_entropy: float
    pope_accuracy: float
    chair_s: float
    chair_i: float
    dola_mitigated: bool
    generated_text: str


class CompareResponse(BaseModel):
    id: str
    prompt: str
    dola_alpha: float
    results: List[CompareResultItem]
    created_at: datetime


class MedicalGuardRequest(BaseModel):
    patient_id: Optional[str] = "PX-9042"
    modality: Optional[str] = "Chest X-Ray (PA View)"
    finding_prompt: str


class MedicalReviewResponse(BaseModel):
    id: str
    patient_id: str
    modality: str
    finding_prompt: str
    ai_generated_diagnosis: str
    anatomical_grounding_score: float
    hallucination_risk_level: str
    flagged_entities: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_sessions: int
    avg_hallucination_score: float
    total_hallucinated_tokens: int
    total_training_samples: int
    models_active: List[str]

