export async function callGeminiAPI(prompt: string, systemInstruction: string = "", customApiKey: string = ""): Promise<string> {
  const apiKey = customApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  if (!apiKey) {
    return "Vui lòng cấu hình khóa API Key của Gemini để kích hoạt trợ lý học tập thông minh này nhé!";
  }
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=" + apiKey;
  let retries = 5;
  let delay = 1000;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    ...(systemInstruction && { systemInstruction: { parts: [{ text: systemInstruction }] } })
  };
  while (retries > 0) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Error: " + response.status);
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "Không có kết quả trả về từ AI.";
    } catch (err) {
      retries--;
      if (retries === 0) throw new Error("Không thể kết nối đến Gemini.");
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
  return "";
}