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
    total_puzzles: Optional[int] = 0
    puzzle_pass_rate: Optional[float] = 0.0


class PuzzleCreate(BaseModel):
    title: str
    category: str
    question: str
    ground_truth_answer: str
    explanation: str
    image_url: Optional[str] = None
    difficulty: Optional[str] = "Hard"


class PuzzleEvalRequest(BaseModel):
    puzzle_id: str
    model_name: Optional[str] = "Gemma-4 VLM (Multimodal)"


class PuzzleEvalResponse(BaseModel):
    id: str
    puzzle_id: str
    model_name: str
    vlm_response: str
    is_correct: bool
    hallucination_score: float
    hallucination_type: str
    diagnostic_proof: str
    created_at: datetime

    class Config:
        from_attributes = True


class PuzzleResponse(BaseModel):
    id: str
    title: str
    category: str
    question: str
    ground_truth_answer: str
    explanation: str
    image_url: Optional[str] = None
    difficulty: str
    created_at: datetime
    evaluations: List[PuzzleEvalResponse] = []

    class Config:
        from_attributes = True


class ExplainTokenRequest(BaseModel):
    token_text: str
    logit_entropy: float
    visual_grounding_score: float
    attention_x: float
    attention_y: float
    context_prompt: Optional[str] = None


class ExplainTokenResponse(BaseModel):
    token_text: str
    is_hallucinated: bool
    hallucination_category: str
    entropy_analysis: str
    grounding_analysis: str
    spatial_region_proof: str
    why_hallucinated_explanation: str
    confidence_verdict: str


