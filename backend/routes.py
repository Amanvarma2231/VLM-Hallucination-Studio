import os
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from database import (
    get_db, SessionModel, ExtractedTokenModel, TrainingSampleModel,
    MedicalReviewModel, ModelComparisonModel, PuzzleModel, PuzzleEvalModel
)
from schemas import (
    AnalyzeRequest, SessionResponse, TrainingSampleResponse, DashboardStats, TokenDetail,
    CompareRequest, CompareResponse, CompareResultItem, MedicalGuardRequest, MedicalReviewResponse,
    PuzzleCreate, PuzzleResponse, PuzzleEvalRequest, PuzzleEvalResponse,
    ExplainTokenRequest, ExplainTokenResponse
)
from hallucination_engine import VLMHallucinationEngine

router = APIRouter(prefix="/api")
engine_instance = VLMHallucinationEngine()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/health")
def health_check():
    return {"status": "online", "system": "VLM Hallucination Intelligence Backend", "version": "1.0.0"}


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_sessions = db.query(SessionModel).count()
    sessions = db.query(SessionModel).all()
    avg_score = float(sum(s.overall_hallucination_score for s in sessions) / len(sessions)) if sessions else 0.0

    total_tokens = db.query(ExtractedTokenModel).filter(ExtractedTokenModel.is_hallucinated == True).count()
    total_samples = db.query(TrainingSampleModel).count()

    total_puzzles = db.query(PuzzleModel).count()
    evals = db.query(PuzzleEvalModel).all()
    correct_evals = sum(1 for e in evals if e.is_correct)
    pass_rate = float(correct_evals / len(evals)) if evals else 0.0

    return DashboardStats(
        total_sessions=total_sessions,
        avg_hallucination_score=round(avg_score, 3),
        total_hallucinated_tokens=total_tokens,
        total_training_samples=total_samples,
        models_active=["Gemma-4 VLM", "PaliGemma-3B", "LLaVA-1.6", "Custom Vision-Language Transformer"],
        total_puzzles=total_puzzles,
        puzzle_pass_rate=round(pass_rate, 3)
    )



@router.post("/analyze", response_model=SessionResponse)
async def analyze_prompt(
    prompt: str = Form(...),
    model_name: Optional[str] = Form("Gemma-4 VLM (Multimodal)"),
    entropy_threshold: Optional[float] = Form(0.65),
    grounding_bias: Optional[float] = Form(0.5),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    session_id = str(uuid.uuid4())
    image_filename = None

    if image and image.filename:
        ext = os.path.splitext(image.filename)[1]
        image_filename = f"{session_id}{ext}"
        file_path = os.path.join(UPLOAD_DIR, image_filename)
        contents = await image.read()
        with open(file_path, "wb") as f:
            f.write(contents)

    # Run VLM Hallucination Engine
    result = engine_instance.analyze_prompt_and_image(
        prompt=prompt,
        has_image=image_filename is not None,
        entropy_threshold=entropy_threshold,
        grounding_bias=grounding_bias
    )

    # Persist Session to SQLite DB
    session_db = SessionModel(
        id=session_id,
        prompt=prompt,
        image_filename=image_filename,
        model_name=model_name,
        overall_hallucination_score=result["overall_hallucination_score"],
        visual_drift_index=result["visual_drift_index"],
        mean_entropy=result["mean_entropy"],
        hallucination_intensity=result["hallucination_intensity"],
        generated_text=result["generated_text"]
    )
    db.add(session_db)
    db.commit()

    # Persist Token Analysis
    tokens_db = []
    for t in result["tokens"]:
        token_obj = ExtractedTokenModel(
            session_id=session_id,
            token_index=t["token_index"],
            token_text=t["token_text"],
            logit_entropy=t["logit_entropy"],
            visual_grounding_score=t["visual_grounding_score"],
            is_hallucinated=t["is_hallucinated"],
            attention_x=t["attention_x"],
            attention_y=t["attention_y"]
        )
        db.add(token_obj)
        tokens_db.append(token_obj)

    # Save Extracted Hallucinated Training Samples
    for seg in result["extracted_segments"]:
        sample_obj = TrainingSampleModel(
            session_id=session_id,
            prompt=seg["prompt"],
            hallucinated_segment=seg["hallucinated_segment"],
            ground_truth_context=prompt,
            sample_type=seg["sample_type"]
        )
        db.add(sample_obj)

    db.commit()
    db.refresh(session_db)

    return session_db


@router.post("/compare", response_model=CompareResponse)
def compare_models_endpoint(req: CompareRequest, db: Session = Depends(get_db)):
    comp_id = str(uuid.uuid4())
    results = engine_instance.compare_models(prompt=req.prompt, dola_alpha=req.dola_alpha)

    results_objs = [CompareResultItem(**r) for r in results]

    db_obj = ModelComparisonModel(
        id=comp_id,
        prompt=req.prompt,
        dola_alpha=req.dola_alpha,
        results_json=json.dumps(results)
    )
    db.add(db_obj)
    db.commit()

    return CompareResponse(
        id=comp_id,
        prompt=req.prompt,
        dola_alpha=req.dola_alpha,
        results=results_objs,
        created_at=db_obj.created_at
    )


@router.post("/medical-guard", response_model=MedicalReviewResponse)
def check_medical_guard_endpoint(req: MedicalGuardRequest, db: Session = Depends(get_db)):
    review_id = str(uuid.uuid4())
    res = engine_instance.check_medical_guard(
        patient_id=req.patient_id or "PX-9042",
        modality=req.modality or "Chest X-Ray (PA View)",
        finding_prompt=req.finding_prompt
    )

    db_obj = MedicalReviewModel(
        id=review_id,
        patient_id=res["patient_id"],
        modality=res["modality"],
        finding_prompt=res["finding_prompt"],
        ai_generated_diagnosis=res["ai_generated_diagnosis"],
        anatomical_grounding_score=res["anatomical_grounding_score"],
        hallucination_risk_level=res["hallucination_risk_level"],
        flagged_entities=json.dumps(res["flagged_entities"])
    )
    db.add(db_obj)
    db.commit()

    return MedicalReviewResponse(
        id=db_obj.id,
        patient_id=db_obj.patient_id,
        modality=db_obj.modality,
        finding_prompt=db_obj.finding_prompt,
        ai_generated_diagnosis=db_obj.ai_generated_diagnosis,
        anatomical_grounding_score=db_obj.anatomical_grounding_score,
        hallucination_risk_level=db_obj.hallucination_risk_level,
        flagged_entities=res["flagged_entities"],
        created_at=db_obj.created_at
    )


@router.get("/medical-reviews", response_model=List[MedicalReviewResponse])
def get_medical_reviews(db: Session = Depends(get_db)):
    reviews = db.query(MedicalReviewModel).order_by(MedicalReviewModel.created_at.desc()).all()
    resp = []
    for r in reviews:
        flagged = json.loads(r.flagged_entities) if r.flagged_entities else []
        resp.append(MedicalReviewResponse(
            id=r.id,
            patient_id=r.patient_id,
            modality=r.modality,
            finding_prompt=r.finding_prompt,
            ai_generated_diagnosis=r.ai_generated_diagnosis,
            anatomical_grounding_score=r.anatomical_grounding_score,
            hallucination_risk_level=r.hallucination_risk_level,
            flagged_entities=flagged,
            created_at=r.created_at
        ))
    return resp


@router.get("/sessions", response_model=List[SessionResponse])
def get_sessions(limit: int = 50, db: Session = Depends(get_db)):
    sessions = db.query(SessionModel).order_by(SessionModel.created_at.desc()).limit(limit).all()
    return sessions


@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session_detail(session_id: str, db: Session = Depends(get_db)):
    session_db = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session_db:
        raise HTTPException(status_code=404, detail="Session not found")
    return session_db


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    session_db = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session_db:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session_db)
    db.commit()
    return {"message": f"Session {session_id} deleted successfully"}


@router.delete("/clear-sessions")
def clear_all_sessions(db: Session = Depends(get_db)):
    db.query(SessionModel).delete()
    db.query(ExtractedTokenModel).delete()
    db.query(TrainingSampleModel).delete()
    db.query(MedicalReviewModel).delete()
    db.query(ModelComparisonModel).delete()
    db.commit()
    return {"message": "All session database records cleared successfully"}


@router.get("/uploads/{filename}")
def get_uploaded_image(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    return FileResponse(file_path)


@router.get("/training-samples", response_model=List[TrainingSampleResponse])
def get_training_samples(db: Session = Depends(get_db)):
    samples = db.query(TrainingSampleModel).order_by(TrainingSampleModel.created_at.desc()).all()
    return samples


@router.post("/export-dataset")
def export_dataset(db: Session = Depends(get_db)):
    samples = db.query(TrainingSampleModel).all()
    lines = []
    for s in samples:
        record = {
            "instruction": s.prompt,
            "hallucinated_output": s.hallucinated_segment,
            "ground_truth_context": s.ground_truth_context or "",
            "sample_type": s.sample_type,
            "created_at": s.created_at.isoformat()
        }
        lines.append(json.dumps(record))

    jsonl_content = "\n".join(lines)
    return Response(
        content=jsonl_content,
        media_type="application/jsonlines",
        headers={"Content-Disposition": "attachment; filename=vlm_hallucinations_dataset.jsonl"}
    )


@router.post("/explain-token", response_model=ExplainTokenResponse)
def explain_token_endpoint(req: ExplainTokenRequest):
    res = engine_instance.explain_token_hallucination(
        token_text=req.token_text,
        logit_entropy=req.logit_entropy,
        visual_grounding_score=req.visual_grounding_score,
        attention_x=req.attention_x,
        attention_y=req.attention_y,
        context_prompt=req.context_prompt or ""
    )
    return ExplainTokenResponse(**res)


@router.get("/puzzles", response_model=List[PuzzleResponse])
def get_puzzles(db: Session = Depends(get_db)):
    # Auto seed initial unknown visual puzzles if empty
    if db.query(PuzzleModel).count() == 0:
        seed_puzzles_in_db(db)

    puzzles = db.query(PuzzleModel).order_by(PuzzleModel.created_at.desc()).all()
    return puzzles


@router.post("/puzzles", response_model=PuzzleResponse)
def create_puzzle(req: PuzzleCreate, db: Session = Depends(get_db)):
    p_id = str(uuid.uuid4())
    puzzle_db = PuzzleModel(
        id=p_id,
        title=req.title,
        category=req.category,
        question=req.question,
        ground_truth_answer=req.ground_truth_answer,
        explanation=req.explanation,
        image_url=req.image_url,
        difficulty=req.difficulty or "Hard"
    )
    db.add(puzzle_db)
    db.commit()
    db.refresh(puzzle_db)
    return puzzle_db


@router.post("/puzzles/evaluate", response_model=PuzzleEvalResponse)
def evaluate_puzzle(req: PuzzleEvalRequest, db: Session = Depends(get_db)):
    puzzle_db = db.query(PuzzleModel).filter(PuzzleModel.id == req.puzzle_id).first()
    if not puzzle_db:
        raise HTTPException(status_code=404, detail="Puzzle not found")

    res = engine_instance.evaluate_unknown_puzzle(
        puzzle_id=puzzle_db.id,
        title=puzzle_db.title,
        category=puzzle_db.category,
        question=puzzle_db.question,
        ground_truth=puzzle_db.ground_truth_answer,
        explanation=puzzle_db.explanation,
        model_name=req.model_name or "Gemma-4 VLM (Multimodal)"
    )

    eval_id = str(uuid.uuid4())
    eval_db = PuzzleEvalModel(
        id=eval_id,
        puzzle_id=puzzle_db.id,
        model_name=res["model_name"],
        vlm_response=res["vlm_response"],
        is_correct=res["is_correct"],
        hallucination_score=res["hallucination_score"],
        hallucination_type=res["hallucination_type"],
        diagnostic_proof=res["diagnostic_proof"]
    )
    db.add(eval_db)
    db.commit()
    db.refresh(eval_db)
    return eval_db


def seed_puzzles_in_db(db: Session):
    default_puzzles = [
        {
            "id": "puz-001",
            "title": "3D Isometric Cube Count Trick",
            "category": "Spatial 3D",
            "question": "How many total unit cubes are required to build this isometric structure including hidden support cubes?",
            "ground_truth_answer": "Exactly 14 unit cubes (9 visible, 5 hidden base supports).",
            "explanation": "VLMs often count only surface visible faces (9) or hallucinate non-existent floating cubes (18+) without verifying structural physics support logic.",
            "difficulty": "Hard"
        },
        {
            "id": "puz-002",
            "title": "Café Wall Optical Line Parallelism",
            "category": "Optical Illusion",
            "question": "Are the horizontal mortar lines between the black and white tiles perfectly parallel or tilted?",
            "ground_truth_answer": "They are perfectly parallel.",
            "explanation": "VLMs succumb to luminance optical illusions, declaring lines to be slanted at 15 degrees due to feature map distortion in early conv/vit layers.",
            "difficulty": "Medium"
        },
        {
            "id": "puz-003",
            "title": "Counterfactual Gravity-Defying Clock",
            "category": "Counterfactual Logic",
            "question": "Describe the clock hands in this image and state if it obeys standard wall mounting physics.",
            "ground_truth_answer": "The clock face is inverted with counter-clockwise numbers; it is mounted upside down floating without a wall mount.",
            "explanation": "Standard VLMs hallucinate 'mounted on a white wall ticking clockwise at 3:00' due to strong training dataset prior bias, completely ignoring counterfactual visual anomaly.",
            "difficulty": "Extreme"
        },
        {
            "id": "puz-004",
            "title": "Mirror Image OCR Text Read Direction",
            "category": "Text OCR Trick",
            "question": "Transcribe the text on the store window as seen through the rearview mirror reflection.",
            "ground_truth_answer": "AMBULANCE EMERGENCY PHARMACY",
            "explanation": "VLMs fail spatial mirror reflection inversion and hallucinate scrambled gibberish tokens ('AMB-LANCE-99') when reading mirrored typography.",
            "difficulty": "Hard"
        }
    ]

    for p in default_puzzles:
        puzzle_db = PuzzleModel(**p)
        db.add(puzzle_db)

        # Add initial evaluation sample for Gemma-4
        res = engine_instance.evaluate_unknown_puzzle(
            puzzle_id=p["id"],
            title=p["title"],
            category=p["category"],
            question=p["question"],
            ground_truth=p["ground_truth_answer"],
            explanation=p["explanation"],
            model_name="Gemma-4 VLM (Multimodal)"
        )
        eval_db = PuzzleEvalModel(
            id=str(uuid.uuid4()),
            puzzle_id=p["id"],
            model_name=res["model_name"],
            vlm_response=res["vlm_response"],
            is_correct=res["is_correct"],
            hallucination_score=res["hallucination_score"],
            hallucination_type=res["hallucination_type"],
            diagnostic_proof=res["diagnostic_proof"]
        )
        db.add(eval_db)

    db.commit()


@router.post("/seed-demo")
def seed_demo_data(db: Session = Depends(get_db)):
    if db.query(SessionModel).count() == 0:
        demo_prompts = [
            "A robotic astronaut standing on a glowing red crater with transparent crystal towers in the background.",
            "An ancient temple built inside a giant floating water droplet surrounded by neon lightning.",
            "A futuristic cyberpunk street market selling bioluminescent jellyfish and holographic artifacts."
        ]

        for p in demo_prompts:
            res = engine_instance.analyze_prompt_and_image(prompt=p, has_image=True)
            sess_id = str(uuid.uuid4())
            session_db = SessionModel(
                id=sess_id,
                prompt=p,
                model_name="Gemma-4 VLM (Multimodal)",
                overall_hallucination_score=res["overall_hallucination_score"],
                visual_drift_index=res["visual_drift_index"],
                mean_entropy=res["mean_entropy"],
                hallucination_intensity=res["hallucination_intensity"],
                generated_text=res["generated_text"]
            )
            db.add(session_db)

            for t in res["tokens"]:
                token_obj = ExtractedTokenModel(
                    session_id=sess_id,
                    token_index=t["token_index"],
                    token_text=t["token_text"],
                    logit_entropy=t["logit_entropy"],
                    visual_grounding_score=t["visual_grounding_score"],
                    is_hallucinated=t["is_hallucinated"],
                    attention_x=t["attention_x"],
                    attention_y=t["attention_y"]
                )
                db.add(token_obj)

            for seg in res["extracted_segments"]:
                sample_obj = TrainingSampleModel(
                    session_id=sess_id,
                    prompt=seg["prompt"],
                    hallucinated_segment=seg["hallucinated_segment"],
                    ground_truth_context=p,
                    sample_type=seg["sample_type"]
                )
                db.add(sample_obj)

    if db.query(PuzzleModel).count() == 0:
        seed_puzzles_in_db(db)

    db.commit()
    return {"message": "Demo sessions and unknown puzzle benchmarks seeded successfully."}


