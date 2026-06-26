require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

console.log("KEY:", process.env.GOOGLE_GENAI_API_KEY?.substring(0, 15));

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

async function main() {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Say Hello",
    });

    console.log(res.text);
  } catch (e) {
    console.dir(e, { depth: null });
  }
}

main();