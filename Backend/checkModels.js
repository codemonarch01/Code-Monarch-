const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkAvailableModels() {
  try {
    const genAI = new GoogleGenerativeAI('AIzaSyA54Z4dI95MMWBG_3c-Exz1x0fvy0E5QPo');
    
    console.log('🔍 Checking available models...\n');
    
    // Try different model names
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'text-bison-001',
      'gemini-1.0-pro'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, test message');
        const response = await result.response;
        console.log(`✅ ${modelName} - WORKS!`);
        console.log(`Response: ${response.text().substring(0, 100)}...\n`);
        break; // Stop at first working model
      } catch (error) {
        console.log(`❌ ${modelName} - Error: ${error.message.substring(0, 100)}...\n`);
      }
    }
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

checkAvailableModels();
