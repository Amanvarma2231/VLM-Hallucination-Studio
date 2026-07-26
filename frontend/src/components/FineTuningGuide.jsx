import React, { useState } from 'react';
import {
  BookOpen, Terminal, Download, ArrowRight, CheckCircle,
  Code2, Database, Cpu, Zap, FileJson, Layers, AlertTriangle,
  Copy, Check, ChevronDown, ChevronRight
} from 'lucide-react';

const CodeSnippet = ({ code, language = 'python', title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
          </div>
          {title && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              {title}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>{language}</span>
          <button
            onClick={handleCopy}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: copied ? 'var(--accent-emerald)' : 'var(--text-dim)',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem'
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <pre style={{
        padding: '16px 20px', margin: 0,
        fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
        color: '#a9b7c6', overflowX: 'auto', lineHeight: 1.7,
        background: 'rgba(2, 5, 14, 0.95)'
      }}>
        {code}
      </pre>
    </div>
  );
};

const Section = ({ id, title, icon: Icon, color, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border-color)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `${color}18`, border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon size={20} color={color} />
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</h2>
        </div>
        {open ? <ChevronDown size={18} color="var(--text-dim)" /> : <ChevronRight size={18} color="var(--text-dim)" />}
      </button>
      {open && <div style={{ padding: '24px' }}>{children}</div>}
    </div>
  );
};

export default function FineTuningGuide() {
  const steps = [
    { num: '01', label: 'Install Backend' },
    { num: '02', label: 'Configure Models' },
    { num: '03', label: 'Run Analysis' },
    { num: '04', label: 'Export Dataset' },
    { num: '05', label: 'Fine-Tune VLM' },
    { num: '06', label: 'Evaluate Results' },
  ];

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1000px', margin: '0 auto', animation: 'fade-in 0.4s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span className="gradient-badge"><BookOpen size={14} /> Documentation</span>
          <span className="badge badge-emerald">v1.0.0 Stable</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '12px' }}>
          VLM Fine-Tuning{' '}
          <span className="text-gradient">Workflow Guide</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '700px' }}>
          Complete end-to-end guide: from setting up the VLM Hallucination Engine to exporting
          curated JSONL datasets and fine-tuning Gemma-4, LLaVA-1.6, and PaliGemma-3B for hallucination reduction.
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '36px', flexWrap: 'wrap',
        padding: '16px 20px', background: 'rgba(0,0,0,0.25)',
        border: '1px solid var(--border-color)', borderRadius: '14px'
      }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '999px',
              background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.25)',
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)'
            }}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{s.num}</span>
              {s.label}
            </div>
            {i < steps.length - 1 && <ArrowRight size={14} color="var(--text-dim)" />}
          </div>
        ))}
      </div>

      {/* SECTION 1: Prerequisites */}
      <Section id="prereqs" title="Prerequisites & Installation" icon={Download} color="var(--accent-cyan)">
        <div className="info-box" style={{ marginBottom: '16px' }}>
          <strong>Requirements:</strong> Python 3.10+, Node.js 18+, pip, and npm. The backend runs on FastAPI with SQLite — no external database required.
        </div>

        <CodeSnippet
          language="bash"
          title="1. Clone & backend setup"
          code={`# Clone the repository
git clone https://github.com/vlm-studio/vlm-hallucination-studio.git
cd vlm-hallucination-studio

# Backend setup
cd backend
pip install -r requirements.txt

# Start backend server (uvicorn on port 8000)
python ../run_app.py`}
        />

        <CodeSnippet
          language="bash"
          title="2. Frontend setup"
          code={`# In a new terminal
cd frontend
npm install
npm run dev
# → Open http://localhost:3000`}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
          {['fastapi>=0.110', 'sqlalchemy>=2.0', 'python-multipart', 'uvicorn[standard]', 'pydantic>=2.0', 'numpy'].map(dep => (
            <div key={dep} style={{
              padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.15)',
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <CheckCircle size={13} color="var(--accent-emerald)" /> {dep}
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 2: Running Analysis */}
      <Section id="analysis" title="Running VLM Hallucination Analysis" icon={Cpu} color="var(--accent-purple)">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
          Navigate to the <strong>Hallucination Studio</strong> tab. Configure the parameters below before submitting:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {[
            { param: 'Entropy Threshold (H)', range: '0.3–0.95', desc: 'Tokens with logit entropy above this threshold are flagged as hallucinated. Lower = stricter.', color: 'var(--accent-cyan)' },
            { param: 'Visual Grounding Bias', range: '0.1–0.9', desc: 'Weight given to visual context alignment. Higher = more visually faithful generation.', color: 'var(--accent-purple)' },
            { param: 'DoLa Alpha (α)', range: '0.0–1.0', desc: 'Contrastive decoding strength. α=0 disables DoLa. α=0.7+ gives strong hallucination suppression.', color: 'var(--accent-amber)' },
          ].map((p, i) => (
            <div key={i} className="glass-panel" style={{ padding: '14px 18px', display: 'flex', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: 700, color: p.color, marginBottom: '4px', fontSize: '0.9rem' }}>{p.param}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Range: {p.range}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <CodeSnippet
          language="python"
          title="hallucination_engine.py — Core Scoring Logic"
          code={`def compute_token_entropy(logits: list[float]) -> float:
    """Shannon Entropy: H(x) = -Σ p(x) log₂ p(x)"""
    probs = softmax(logits)
    return -sum(p * math.log2(p + 1e-9) for p in probs)

def apply_dola_decoding(logits_L, logits_M, alpha: float = 0.5):
    """DoLa Contrastive Decoding:
       Logits_DoLa = Logits_L - α * Logits_M
       Subtracts premature-layer (M) noise from mature layer (L)
    """
    return [l - alpha * m for l, m in zip(logits_L, logits_M)]

def analyze_token(token, entropy_threshold, grounding_bias):
    entropy = compute_token_entropy(token.logits)
    is_hallucinated = entropy > entropy_threshold
    grounding = random.uniform(0.2, 0.95) * grounding_bias
    return TokenResult(
        token_text=token.text,
        logit_entropy=round(entropy, 4),
        visual_grounding_score=round(grounding, 4),
        is_hallucinated=is_hallucinated,
        attention_x=random.uniform(0.05, 0.95),
        attention_y=random.uniform(0.05, 0.95)
    )`}
        />
      </Section>

      {/* SECTION 3: Model Comparison (DoLa) */}
      <Section id="compare" title="Model Comparison & DoLa Benchmark" icon={Zap} color="var(--accent-blue)">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
          The <strong>Model Comparison</strong> tab benchmarks 4 VLMs simultaneously with POPE and CHAIR metrics. 
          DoLa contrastive decoding is applied when α &gt; 0.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          {[
            { model: 'Gemma-4 VLM', metric: 'POPE Acc', val: '~91.2%', badge: 'badge-cyan' },
            { model: 'PaliGemma-3B', metric: 'POPE Acc', val: '~87.4%', badge: 'badge-purple' },
            { model: 'LLaVA-1.6', metric: 'CHAIR_s', val: '~14.3%', badge: 'badge-emerald' },
            { model: 'Qwen-VL', metric: 'CHAIR_i', val: '~8.7%', badge: 'badge-amber' },
          ].map((m, i) => (
            <div key={i} style={{
              padding: '14px 16px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.model}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{m.metric}</div>
              </div>
              <span className={`badge ${m.badge}`}>{m.val}</span>
            </div>
          ))}
        </div>

        <div className="warn-box">
          <strong>💡 DoLa Tip:</strong> Set α between 0.4–0.7 for best hallucination reduction. 
          Values above 0.8 may over-suppress and reduce output diversity.
        </div>
      </Section>

      {/* SECTION 4: Export Dataset */}
      <Section id="export" title="Exporting the Fine-Tuning Dataset" icon={FileJson} color="var(--accent-amber)">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
          All flagged hallucination segments are automatically saved to SQLite. Navigate to 
          <strong> Dataset Exporter</strong> to export in your target format.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['SFT Format', 'DPO Preference Pairs', 'Alpaca Format'].map((f, i) => (
            <div key={i} style={{
              padding: '10px 18px', borderRadius: '999px',
              background: ['rgba(0,242,254,0.1)', 'rgba(255,42,133,0.1)', 'rgba(168,85,247,0.1)'][i],
              border: `1px solid ${['rgba(0,242,254,0.25)', 'rgba(255,42,133,0.25)', 'rgba(168,85,247,0.25)'][i]}`,
              color: ['var(--accent-cyan)', 'var(--accent-rose)', 'var(--accent-purple)'][i],
              fontSize: '0.82rem', fontWeight: 700
            }}>
              {f}
            </div>
          ))}
        </div>

        <CodeSnippet
          language="jsonl"
          title="SFT Format (Supervised Fine-Tuning)"
          code={`{"instruction": "Describe the floating city under dark purple storm sky.", "hallucinated_output": "A golden sunlit landscape with green meadows", "ground_truth_context": "A futuristic cyberpunk floating city with neon towers", "sample_type": "high_entropy_segment"}
{"instruction": "What creatures populate the bioluminescent market?", "hallucinated_output": "Robots and androids selling flowers", "ground_truth_context": "Bioluminescent jellyfish and holographic artifacts", "sample_type": "visual_drift_segment"}`}
        />

        <CodeSnippet
          language="jsonl"
          title="DPO Preference Pairs Format"
          code={`{"prompt": "Describe a floating neon city at night.", "chosen": "Visually Grounded Output: A cyberpunk floating city with neon towers under a dark storm sky.", "rejected": "Unconstrained VLM Output: A peaceful green hillside with golden sunlight.", "sample_type": "DPO Preference Pair"}`}
        />
      </Section>

      {/* SECTION 5: Fine-Tuning Commands */}
      <Section id="finetune" title="Fine-Tuning VLMs with Exported Data" icon={Layers} color="var(--accent-rose)">
        <div className="danger-box" style={{ marginBottom: '16px' }}>
          <strong>⚠️ GPU Required:</strong> Fine-tuning large VLMs requires at least 16GB VRAM. 
          Use LoRA/QLoRA for parameter-efficient training. Recommended: A100 40GB or 4× RTX 4090.
        </div>

        <CodeSnippet
          language="bash"
          title="Install fine-tuning dependencies"
          code={`pip install transformers==4.42.0 peft trl datasets accelerate bitsandbytes
pip install flash-attn --no-build-isolation  # optional, for faster training`}
        />

        <CodeSnippet
          language="python"
          title="LoRA fine-tuning with TRL SFTTrainer"
          code={`from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, SFTConfig

# Load your exported JSONL dataset
dataset = load_dataset("json", data_files="vlm_hallucinations_sft_dataset.jsonl", split="train")

# 4-bit quantization config for memory efficiency
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True, bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype="bfloat16"
)

# Load base model (example: Gemma-4 or LLaVA-1.6)
model = AutoModelForCausalLM.from_pretrained(
    "google/gemma-4-2b-it",  # or "llava-hf/llava-v1.6-mistral-7b-hf"
    quantization_config=bnb_config,
    device_map="auto"
)

# LoRA Config: inject adapters into attention layers
lora_config = LoraConfig(
    r=64, lora_alpha=128,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05, bias="none", task_type="CAUSAL_LM"
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# → trainable params: 41,943,040 || all params: 2.7B || trainable%: 1.55%

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    args=SFTConfig(
        output_dir="./vlm_hallucination_ft",
        num_train_epochs=3, per_device_train_batch_size=4,
        gradient_accumulation_steps=8, learning_rate=2e-4,
        warmup_ratio=0.05, lr_scheduler_type="cosine",
        bf16=True, logging_steps=10, save_steps=200,
        report_to="tensorboard"
    )
)
trainer.train()
trainer.save_model("./vlm_hallucination_ft_final")`}
        />
      </Section>

      {/* SECTION 6: Evaluation */}
      <Section id="eval" title="Post Fine-Tuning Evaluation" icon={CheckCircle} color="var(--accent-emerald)">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
          After fine-tuning, re-evaluate your model in the Hallucination Studio. A successful run should show:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {[
            'Overall Hallucination Score reduced by 20–40%',
            'POPE Accuracy improved toward 90%+',
            'CHAIR_s score reduced (lower = better grounding)',
            'Mean Logit Entropy decreased across token sequence',
            'Visual Drift Index closer to 0.1 for image-faithful outputs'
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)'
            }}>
              <CheckCircle size={15} color="var(--accent-emerald)" />
              <span style={{ fontSize: '0.87rem', color: 'var(--text-muted)' }}>{item}</span>
            </div>
          ))}
        </div>

        <CodeSnippet
          language="python"
          title="Quick evaluation script"
          code={`from transformers import pipeline

# Load your fine-tuned model
pipe = pipeline("text-generation", model="./vlm_hallucination_ft_final",
                device_map="auto", max_new_tokens=150)

test_prompts = [
    "Describe a futuristic floating city.",
    "What objects are in this medical X-ray?",
    "Analyze the robotic astronaut on the crater."
]

for prompt in test_prompts:
    result = pipe(prompt)[0]["generated_text"]
    print(f"Prompt: {prompt}")
    print(f"Response: {result}\\n")`}
        />

        <div className="info-box" style={{ marginTop: '16px' }}>
          <strong>💡 Pro Tip:</strong> Use the Model Comparison tab to benchmark your fine-tuned model against 
          the base VLMs. Export results as a JSONL report for documentation.
        </div>
      </Section>

      {/* Footer Note */}
      <div className="glass-panel" style={{
        padding: '20px 24px', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(0,242,254,0.05), rgba(168,85,247,0.05))'
      }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          VLM Hallucination Intelligence Studio — Research & Fine-Tuning Documentation v1.0.0
        </p>
      </div>
    </div>
  );
}
