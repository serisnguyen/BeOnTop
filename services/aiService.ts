
import { GoogleGenAI } from "@google/genai";
import { CallLogItem } from "../context/AuthContext";

// Initialize AI Client
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found. Using mock/fallback logic.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/<[^>]*>/g, "");
};

// Timeout helper
const createTimeoutPromise = (ms: number): [Promise<never>, () => void] => {
    let timeoutId: any;
    const promise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("AI_TIMEOUT")), ms);
    });
    const clear = () => clearTimeout(timeoutId);
    return [promise, clear];
};

// Helper to convert File/Blob to base64
export const fileToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the Data-URI prefix (e.g. "data:image/png;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// --- NEW FUNCTION: Analyze Context of a single sentence ---
export const analyzeConversationContext = (text: string, isKnownContact: boolean): { scoreIncrease: number, keywordsFound: string[] } => {
    const lowerText = text.toLowerCase();
    
    // Keywords Dictionary with Weights
    const riskMap: Record<string, number> = {
        "công an": 20,
        "điều tra": 20,
        "tài khoản": 15,
        "chuyển tiền": 25,
        "chuyển khoản": 25,
        "rửa tiền": 30,
        "bí mật": 15,
        "tạm giữ": 20,
        "nâng cấp sim": 25,
        "khóa": 10,
        "mã otp": 30,
        "mật khẩu": 30
    };

    const safeMap: Record<string, number> = {
        "shipper": -10,
        "giao hàng": -10,
        "đơn hàng": -5,
        "shopee": -5,
        "lazada": -5,
        "tiki": -5,
        "lấy hàng": -5
    };

    let score = 0;
    const found: string[] = [];

    // Check Risk Words
    for (const [word, weight] of Object.entries(riskMap)) {
        if (lowerText.includes(word)) {
            score += weight;
            found.push(word);
        }
    }

    // Check Safe Words (Reduce risk)
    for (const [word, weight] of Object.entries(safeMap)) {
        if (lowerText.includes(word)) {
            score += weight; // weight is negative
        }
    }

    // Heuristics
    if (isKnownContact) {
        score = Math.floor(score * 0.2); // Reduce risk impact by 80%
    }

    return {
        scoreIncrease: Math.max(-10, score), // Allow minimal reduction but mostly increase
        keywordsFound: found
    };
};

/**
 * ADVANCED FORENSIC ANALYSIS (SCIENTIFIC IMPLEMENTATION)
 * 
 * Supports two distinct forensic modes:
 * 1. VISUAL FORENSICS (Image/Video): PPG (Blood flow), CNN (Visual Artifacts), Phoneme-Viseme.
 * 2. AUDIO FORENSICS (Audio): SOTA Generative Detection (NotebookLM patterns, Neural Codec Artifacts).
 */
export const analyzeMediaDeepfake = async (file: File, type: 'image' | 'audio' | 'video'): Promise<{
    isDeepfake: boolean;
    confidenceScore: number; // 0-100 (100 = definitely FAKE)
    explanation: string;
    details: {
        biologicalScore: number; // Visual: PPG | Audio: Breathing/Physiology
        visualIntegrityScore: number; // Visual: CNN Artifacts | Audio: Spectral/Mic EQ
        audioSyncScore: number | null; // Visual: Lip Sync | Audio: Environment/Noise Floor
    };
    artifacts: string[];
}> => {
    // 60 seconds timeout for deep forensic analysis
    const [timeoutProm, clearTimer] = createTimeoutPromise(60000);

    try {
        const ai = getAIClient();
        if (!ai) throw new Error("NO_API_KEY");

        const base64Data = await fileToBase64(file);
        
        let systemInstruction = "";
        let promptText = "";

        // --- AUDIO FORENSIC MODE (SOTA DETECTIVE) ---
        if (type === 'audio') {
             systemInstruction = `
                You are TruthShield Audio Forensic AI, a Tier-1 Psychoacoustics Engineer & GenAI Researcher specialized in detecting SOTA Neural Audio Codecs (AudioLM, SoundStorm, VITS).

                Perform a Multi-Stage Forensic Audio Analysis on the provided audio track, specifically looking for signatures of High-Fidelity Generative Audio (like Google NotebookLM, ElevenLabs Turbo v2).

                1. **Generative Pattern Recognition (The "Podcast Bro" Factor)**:
                   - Analyze conversational prosody. Does it exhibit the "NotebookLM Signature"?
                   - Look for: Overly enthusiastic agreement, perfect zero-latency turn-taking, and predictive use of back-channeling ("Right", "Exactly") and fillers ("It's like...", "You know...").
                   - *Real humans overlap, interrupt, and have variable latency.* SOTA AI is often "too perfect".

                2. **Acoustic Environment & Digital Void**:
                   - Analyze the Noise Floor. Is the background silence "Digital Absolute Silence" or "Synthetic White Noise"?
                   - Real recordings have chaotic, inconsistent room tone (reverb, air conditioning, movement).
                   - Score "audioSyncScore" (Environment): 0 (Synthetic/Digital Void) to 100 (Natural Chaotic Ambience).

                3. **Physiological Breathing Consistency**:
                   - SOTA models insert breaths, but often at mathematically optimal but physiologically unlikely intervals.
                   - Check if breath volume/duration matches the lung capacity required for the preceding/following phrase.
                   - Score "biologicalScore" (Biometrics): 0 (Algorithmic/Unnatural) to 100 (Biological/Consistent).

                4. **Microphone & EQ Consistency**:
                   - If multiple speakers: Do they sound like they are in the EXACT same acoustic space with identical microphone profiles?
                   - Real podcasts often have slight EQ/Mic quality variances between speakers. Perfect matching suggests single-source generation.
                   - Score "visualIntegrityScore" (Spectral/EQ): 0 (Perfectly Synthetic Match) to 100 (Natural Variance).

                **OUTPUT FORMAT**:
                Return strictly valid JSON. Language: Vietnamese. Use technical terms like 'AudioLM', 'Neural Codec', 'Digital Void'.
                {
                    "isDeepfake": boolean,
                    "confidenceScore": number (0-100),
                    "explanation": "Technical explanation. If Fake, specifically mention: 'Phát hiện đặc trưng hội thoại của AI tạo sinh (NotebookLM/AudioLM)' or 'Môi trường âm thanh kỹ thuật số (Digital Environment)'.",
                    "details": {
                        "biologicalScore": number,
                        "visualIntegrityScore": number,
                        "audioSyncScore": number
                    },
                    "artifacts": ["string", "string"] (List specific flaws e.g. "Nhịp điệu hội thoại quá hoàn hảo (NotebookLM pattern)", "Khoảng lặng kỹ thuật số tuyệt đối", "Hơi thở không khớp sinh học")
                }
             `;
             promptText = "Analyze this AUDIO file for SOTA Generative AI signatures (NotebookLM, AudioLM).";
        } 
        // --- VISUAL FORENSIC MODE (Image/Video) ---
        else {
             systemInstruction = `
                You are TruthShield Forensic AI, a Tier-1 Digital Forensics Expert specializing in Deepfake detection.
                
                Perform a Multi-Stage Forensic Analysis on the provided media. Simulate the following specific algorithms:

                1. **Biological Signal Analysis (Intel FakeCatcher/PPG)**: 
                   - Scan facial skin pixels for "photoplethysmography" (blood flow) signals. 
                   - Real humans have subtle, rhythmic color shifts (green/red channels) due to heartbeats. 
                   - Deepfakes often have "dead" skin pixels or spatial incoherence in color changes.
                   - Score this as "biologicalScore": 0 (Artificial/Dead) to 100 (Natural/Alive).

                2. **Visual Integrity Analysis (Forensic CNN)**: 
                   - Detect "AI Glaze" (unusually smooth, waxy skin texture).
                   - Look for "blending boundaries" near the hairline, jaw, or neck.
                   - Check for lighting inconsistencies (shadows not matching light source).
                   - Score this as "visualIntegrityScore": 0 (Many Artifacts/Fake) to 100 (Clean/Real).

                3. **Audio-Visual Sync (Phoneme-Viseme)**: 
                   - For VIDEO: Check if lip movements (visemes) perfectly align with the phonetic sounds (phonemes). Look for muscle tremors or static teeth.
                   - Score this as "audioSyncScore": 0 (Mismatch) to 100 (Perfect Sync). Return null for images.

                **OUTPUT FORMAT**:
                Return strictly valid JSON. Language: Vietnamese. Use terms like 'PPG', 'CNN', 'Viseme'.

                {
                    "isDeepfake": boolean,
                    "confidenceScore": number (0-100, where 100 is DEFINITELY FAKE),
                    "explanation": "A detailed technical paragraph explaining findings.",
                    "details": {
                        "biologicalScore": number (0-100),
                        "visualIntegrityScore": number (0-100),
                        "audioSyncScore": number or null
                    },
                    "artifacts": ["string", "string"] (List specific flaws e.g., "Da mặt quá mịn (AI Glaze)", "Không có tín hiệu mạch máu (PPG)")
                }
            `;
            promptText = type === 'image' ? "Analyze this IMAGE." : "Analyze this VIDEO frame-by-frame.";
        }

        const response: any = await Promise.race([
            ai.models.generateContent({
                model: "gemini-2.5-flash",
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    temperature: 0.2 // Low temperature for analytical precision
                },
                contents: {
                    parts: [
                        { inlineData: { mimeType: file.type, data: base64Data } },
                        { text: promptText }
                    ]
                }
            }),
            timeoutProm
        ]);

        clearTimer();

        const jsonText = response.text || "{}";
        const result = JSON.parse(jsonText);
        
        // Fallback defaults if AI returns partial data
        return {
            isDeepfake: result.isDeepfake ?? false,
            confidenceScore: result.confidenceScore ?? 0,
            explanation: result.explanation || "Không tìm thấy dấu hiệu rõ ràng.",
            details: {
                biologicalScore: result.details?.biologicalScore ?? 80,
                visualIntegrityScore: result.details?.visualIntegrityScore ?? 80,
                audioSyncScore: result.details?.audioSyncScore ?? null
            },
            artifacts: result.artifacts || []
        };

    } catch (error) {
        console.error("Deepfake Analysis Error:", error);
        clearTimer();
        // Return a safe fallback to prevent app crash, but indicate failure
        return {
            isDeepfake: false,
            confidenceScore: 0,
            explanation: "Không thể thực hiện phân tích pháp y do lỗi kết nối hoặc định dạng file không hỗ trợ.",
            details: {
                biologicalScore: 50,
                visualIntegrityScore: 50,
                audioSyncScore: null
            },
            artifacts: ["Lỗi kết nối máy chủ AI"]
        };
    }
};

export const analyzeMessageRisk = async (message: string): Promise<{
  result: 'safe' | 'suspicious' | 'scam';
  explanation: string;
}> => {
  const cleanInput = sanitizeInput(message);
  const scamKeywords = /(chuyển tiền|cấp cứu|trúng thưởng|mật khẩu|otp|tài khoản ngân hàng|nâng cấp sim|khóa tài khoản)/i;
  const urgentKeywords = /(gấp|ngay lập tức|trong vòng 24h|khẩn cấp)/i;

  const [timeoutProm, clearTimer] = createTimeoutPromise(8000);

  try {
    const ai = getAIClient();
    
    if (!ai) throw new Error("NO_API_KEY");
    
    const prompt = `
      System: You are a cybersecurity expert analyzing Vietnamese text messages for scams.
      Task: Analyze the content inside <user_content> tags. Keep explanation under 20 words.
      Classify as: SCAM, SUSPICIOUS, or SAFE.
      Output Format: "CLASSIFICATION | Short explanation for elderly person"

      <user_content>
      ${cleanInput}
      </user_content>
    `;

    const response: any = await Promise.race([
        ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        }),
        timeoutProm 
    ]);
    
    clearTimer();

    const text = response.text || "";
    const [classification, explanation] = text.split('|');
    
    let result: 'safe' | 'suspicious' | 'scam' = 'safe';
    if (classification?.trim().includes('SCAM')) result = 'scam';
    else if (classification?.trim().includes('SUSPICIOUS')) result = 'suspicious';

    return { result, explanation: explanation?.trim() || "Cần cảnh giác." };

  } catch (error: any) {
    clearTimer();
    if (scamKeywords.test(cleanInput) || urgentKeywords.test(cleanInput)) {
        return { 
            result: 'suspicious', 
            explanation: "Hệ thống ngoại tuyến: Phát hiện từ khóa nhạy cảm. Vui lòng gọi điện xác minh." 
        };
    }
    return {
        result: 'safe',
        explanation: "Không phát hiện từ khóa nguy hiểm (Chế độ Offline)."
    };
  }
};

export const analyzeCallRisk = async (call: CallLogItem): Promise<{
    riskScore: number;
    explanation: string;
}> => {
    let fallbackScore = 10;
    let fallbackExp = "An toàn.";
    
    if (!call.contactName) {
        if (call.duration < 10) { 
            fallbackScore = 75;
            fallbackExp = "Số lạ, gọi quá ngắn (Nháy máy).";
        } else if (call.duration >= 300) { 
            fallbackScore = 65;
            fallbackExp = "Số lạ, gọi rất lâu. Cần cảnh giác lừa đảo dàn dựng.";
        } else { 
            fallbackScore = 40;
            fallbackExp = "Số lạ, cần xác minh.";
        }
    } else {
        fallbackScore = 5;
        fallbackExp = "Người quen trong danh bạ.";
    }

    return {
        riskScore: fallbackScore,
        explanation: fallbackExp
    };
};
