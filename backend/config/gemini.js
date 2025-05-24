const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiModel = (modelName = "gemini-2.0-flash-lite") => { 
  return genAI.getGenerativeModel({ model: modelName });
};

module.exports = { getGeminiModel , genAI };