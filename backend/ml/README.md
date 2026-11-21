# Machine Learning Subsystem & Future Acoustic Confidence Architecture

This directory is designated for learned ML model weights, training pipelines, and offline inference artifacts.

---

## 🎯 Planned Architectural Target: Acoustic Confidence Signal (CNN-BiLSTM)

In future phases, candidate speech audio can be processed through a hybrid Convolutional-Recurrent neural network to evaluate vocal confidence, hesitation acoustics, and speech cadence independently of LLM text parsing.

```text
Raw Audio Stream (Candidate Microphone)
       ↓
Pre-emphasis & Framing (25ms window, 10ms hop)
       ↓
Log-Mel Spectrogram / MFCC Feature Extraction (128 Mel bands)
       ↓
Convolutional Layers (Spatial acoustic pattern extraction & noise filtering)
       ↓
Bidirectional LSTM Layers (Temporal context & cadence modeling over time)
       ↓
Dense & Softmax / Sigmoid Head
       ↓
Acoustic Vocal Confidence & Hesitation Score (0.0 to 1.0)
```

---

## 📋 Prerequisites for Production Implementation

Per engineering standards, a learned model will only be merged here when all prerequisites are fulfilled:
1. **Defined Prediction Target**: Ground-truth labeled confidence and hesitation markers.
2. **Benchmark Training Dataset**: Labeled mock interview speech corpora with acoustic variation.
3. **Reproducible Training Pipeline**: Scripted data augmentations, cross-validation, and hyperparameter tuning.
4. **Measurable Metrics**: Verified F1-score, Precision/Recall, and EER benchmarks against test splits.
5. **Saved Model Artifact**: Serialized ONNX / TorchScript model package for low-latency inference.
6. **Inference Pipeline**: Real-time streaming or chunked inference integrated with FastAPI.

---

## ⚡ Current Version (V1) Approach

In V1, voice timing and linguistic metrics are computed deterministically via:
- High-precision WPM pacing tracking (`backend/nlp/structure_analysis.py`)
- Regex-based filler and hesitation analysis (`backend/nlp/filler_detection.py`)
- Assertiveness vs. tentative hedging detection (`backend/nlp/confidence_analysis.py`)
- Google Gemini multimodal speech and conversational intelligence.
