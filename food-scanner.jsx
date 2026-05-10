import { useState, useRef, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0a;
    font-family: 'DM Sans', sans-serif;
    color: #f0ede6;
    min-height: 100vh;
  }

  .app {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #111108 50%, #0a0a0a 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
  }

  .app::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(ellipse at 60% 20%, rgba(212,175,55,0.06) 0%, transparent 50%),
                radial-gradient(ellipse at 20% 80%, rgba(180,140,30,0.04) 0%, transparent 40%);
    pointer-events: none;
    z-index: 0;
  }

  .header {
    text-align: center;
    margin-bottom: 2.5rem;
    position: relative;
    z-index: 1;
  }

  .header-tag {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #d4af37;
    margin-bottom: 0.75rem;
    opacity: 0.8;
  }

  .header h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 6vw, 3rem);
    font-weight: 700;
    color: #f0ede6;
    line-height: 1.1;
  }

  .header h1 span {
    color: #d4af37;
  }

  .header p {
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: #888;
    font-weight: 300;
  }

  .camera-container {
    width: 100%;
    max-width: 480px;
    position: relative;
    z-index: 1;
  }

  .camera-frame {
    width: 100%;
    aspect-ratio: 4/3;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    background: #111;
    border: 1px solid rgba(212,175,55,0.2);
    box-shadow: 0 0 60px rgba(212,175,55,0.08), 0 20px 60px rgba(0,0,0,0.5);
  }

  .camera-frame video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .camera-frame canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .camera-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border-color: #d4af37;
    border-style: solid;
    opacity: 0.7;
  }
  .corner-tl { top: 16px; left: 16px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
  .corner-tr { top: 16px; right: 16px; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
  .corner-bl { bottom: 16px; left: 16px; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
  .corner-br { bottom: 16px; right: 16px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }

  .camera-idle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1rem;
    color: #444;
  }

  .camera-idle-icon {
    width: 64px;
    height: 64px;
    border: 2px dashed #333;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
  }

  .camera-idle p {
    font-size: 0.85rem;
    color: #555;
  }

  .controls {
    display: flex;
    gap: 1rem;
    margin-top: 1.25rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.75rem 1.75rem;
    border: none;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    letter-spacing: 0.02em;
  }

  .btn-primary {
    background: linear-gradient(135deg, #d4af37, #b8941a);
    color: #0a0a0a;
    box-shadow: 0 4px 20px rgba(212,175,55,0.3);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(212,175,55,0.4);
  }

  .btn-secondary {
    background: rgba(255,255,255,0.06);
    color: #aaa;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(255,255,255,0.1);
    color: #f0ede6;
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .upload-hint {
    margin-top: 0.75rem;
    text-align: center;
  }

  .upload-hint label {
    font-size: 0.8rem;
    color: #555;
    cursor: pointer;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }

  .upload-hint label:hover { color: #d4af37; }

  .result-card {
    width: 100%;
    max-width: 480px;
    margin-top: 2rem;
    position: relative;
    z-index: 1;
    animation: slideUp 0.4s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .result-inner {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(212,175,55,0.15);
    border-radius: 16px;
    padding: 1.75rem;
    backdrop-filter: blur(10px);
  }

  .result-dish {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .result-dish-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: #f0ede6;
    line-height: 1.2;
  }

  .result-dish-desc {
    margin-top: 0.4rem;
    font-size: 0.82rem;
    color: #666;
    line-height: 1.5;
    font-weight: 300;
  }

  .calorie-badge {
    flex-shrink: 0;
    text-align: center;
    background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05));
    border: 1px solid rgba(212,175,55,0.3);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    min-width: 80px;
  }

  .calorie-number {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    color: #d4af37;
    line-height: 1;
  }

  .calorie-label {
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #888;
    margin-top: 0.25rem;
  }

  .macros {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .macro-item {
    text-align: center;
    padding: 0.75rem 0.5rem;
    background: rgba(255,255,255,0.03);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.05);
  }

  .macro-value {
    font-size: 1.1rem;
    font-weight: 500;
    color: #f0ede6;
  }

  .macro-label {
    font-size: 0.7rem;
    color: #555;
    margin-top: 0.2rem;
    letter-spacing: 0.05em;
  }

  .health-note {
    font-size: 0.8rem;
    color: #666;
    line-height: 1.6;
    font-style: italic;
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .analyzing-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    color: #555;
    font-size: 0.85rem;
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 2px solid rgba(212,175,55,0.15);
    border-top-color: #d4af37;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .error-box {
    background: rgba(220,50,50,0.08);
    border: 1px solid rgba(220,50,50,0.2);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    color: #e07070;
    font-size: 0.85rem;
    margin-top: 1rem;
    max-width: 480px;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .captured-preview {
    position: relative;
  }

  .captured-label {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    padding: 0.3rem 0.75rem;
    border-radius: 50px;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #d4af37;
    border: 1px solid rgba(212,175,55,0.3);
  }

  input[type="file"] { display: none; }

  .confidence-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .confidence-bar {
    flex: 1;
    height: 3px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px;
    overflow: hidden;
  }

  .confidence-fill {
    height: 100%;
    background: linear-gradient(90deg, #d4af37, #b8941a);
    border-radius: 2px;
    transition: width 1s ease;
  }

  .confidence-text {
    font-size: 0.72rem;
    color: #555;
    white-space: nowrap;
  }
`;

const SYSTEM_PROMPT = `You are a food recognition and nutrition expert. When given an image of food, analyze it and respond ONLY with a valid JSON object (no markdown, no extra text) in this exact format:
{
  "dish": "Name of the dish",
  "description": "Brief 1-2 sentence description of the dish",
  "calories": 450,
  "protein": "28g",
  "carbs": "42g",
  "fat": "14g",
  "confidence": 88,
  "healthNote": "One brief health insight about this meal"
}

The calories should be a number (integer). Confidence is 0-100. Be realistic with estimates. If you cannot identify a food item, return: {"error": "Could not identify food in image"}`;

export default function FoodScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [mode, setMode] = useState("idle"); // idle | camera | captured | analyzing
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode("camera");
    } catch {
      setError("לא ניתן לגשת למצלמה. נסה להעלות תמונה.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    setMode("captured");
  }, [stopCamera]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target.result);
      stopCamera();
      setMode("captured");
    };
    reader.readAsDataURL(file);
  }, [stopCamera]);

  const analyzeFood = useCallback(async () => {
    if (!capturedImage) return;
    setMode("analyzing");
    setError(null);
    setResult(null);

    try {
      const base64 = capturedImage.split(",")[1];
      const mediaType = capturedImage.startsWith("data:image/png") ? "image/png" : "image/jpeg";

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: "What food is in this image? Provide nutrition estimates." }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (parsed.error) {
        setError(parsed.error);
        setMode("captured");
      } else {
        setResult(parsed);
        setMode("captured");
      }
    } catch (err) {
      setError("שגיאה בניתוח התמונה. נסה שוב.");
      setMode("captured");
    }
  }, [capturedImage]);

  const reset = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setResult(null);
    setError(null);
    setMode("idle");
  }, [stopCamera]);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-tag">AI · Nutrition · Analysis</div>
          <h1>סורק <span>קלוריות</span></h1>
          <p>צלם מנה וקבל מידע תזונתי מיידי</p>
        </div>

        <div className="camera-container">
          <div className="camera-frame">
            {mode === "idle" && (
              <div className="camera-idle">
                <div className="camera-idle-icon">📷</div>
                <p>לחץ על "פתח מצלמה" להתחלה</p>
              </div>
            )}

            {mode === "camera" && (
              <div className="captured-preview">
                <video ref={videoRef} playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div className="camera-overlay">
                  <div className="corner corner-tl" />
                  <div className="corner corner-tr" />
                  <div className="corner corner-bl" />
                  <div className="corner corner-br" />
                </div>
              </div>
            )}

            {(mode === "captured" || mode === "analyzing") && capturedImage && (
              <div className="captured-preview">
                <img src={capturedImage} alt="captured food" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div className="captured-label">
                  {mode === "analyzing" ? "מנתח..." : "תמונה צולמה"}
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="controls">
            {mode === "idle" && (
              <button className="btn btn-primary" onClick={startCamera}>
                📷 פתח מצלמה
              </button>
            )}

            {mode === "camera" && (
              <>
                <button className="btn btn-primary" onClick={capture}>
                  ⚡ צלם עכשיו
                </button>
                <button className="btn btn-secondary" onClick={reset}>
                  ✕ בטל
                </button>
              </>
            )}

            {mode === "captured" && (
              <>
                <button className="btn btn-primary" onClick={analyzeFood}>
                  🔍 נתח קלוריות
                </button>
                <button className="btn btn-secondary" onClick={reset}>
                  ↩ מחדש
                </button>
              </>
            )}

            {mode === "analyzing" && (
              <button className="btn btn-secondary" disabled>
                מנתח תמונה...
              </button>
            )}
          </div>

          {(mode === "idle" || mode === "captured") && (
            <div className="upload-hint">
              <label>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} />
                📁 או העלה תמונה מהגלריה
              </label>
            </div>
          )}
        </div>

        {mode === "analyzing" && (
          <div className="result-card">
            <div className="analyzing-state">
              <div className="spinner" />
              <span>מנתח את המנה שלך...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-box">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="result-inner">
              <div className="result-dish">
                <div>
                  <div className="result-dish-name">{result.dish}</div>
                  <div className="result-dish-desc">{result.description}</div>
                </div>
                <div className="calorie-badge">
                  <div className="calorie-number">{result.calories}</div>
                  <div className="calorie-label">קלוריות</div>
                </div>
              </div>

              {result.confidence && (
                <div className="confidence-row">
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${result.confidence}%` }} />
                  </div>
                  <span className="confidence-text">דיוק {result.confidence}%</span>
                </div>
              )}

              <div className="macros">
                <div className="macro-item">
                  <div className="macro-value">{result.protein}</div>
                  <div className="macro-label">חלבון</div>
                </div>
                <div className="macro-item">
                  <div className="macro-value">{result.carbs}</div>
                  <div className="macro-label">פחמימות</div>
                </div>
                <div className="macro-item">
                  <div className="macro-value">{result.fat}</div>
                  <div className="macro-label">שומן</div>
                </div>
              </div>

              {result.healthNote && (
                <div className="health-note">💡 {result.healthNote}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
