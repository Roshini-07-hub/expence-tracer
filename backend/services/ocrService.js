const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const { traceable } = require('langsmith/traceable');
const { wrapSDK } = require('langsmith/wrappers');

// Wrap Groq client so every call is auto-traced by LangSmith
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const groq = wrapSDK(groqClient);

/**
 * Parse the Groq response into structured fields — traced separately
 */
const parseOCRResponse = traceable(
  function parseOCRResponse(text) {
    const result = {
      rawText: '',
      vendor: 'Unknown',
      date: 'Unknown',
      totalAmount: 'Unknown',
      category: 'Other',
      items: [],
    };

    try {
      const rawTextMatch = text.match(/=== RAW TEXT ===([\s\S]*?)=== STRUCTURED DATA ===/);
      if (rawTextMatch) {
        result.rawText = rawTextMatch[1].trim();
      } else {
        result.rawText = text;
      }

      const structuredMatch = text.match(/=== STRUCTURED DATA ===([\s\S]*?)$/);
      const structuredText = structuredMatch ? structuredMatch[1] : text;

      const vendorMatch = structuredText.match(/Vendor:\s*(.+)/i);
      if (vendorMatch) result.vendor = vendorMatch[1].trim();

      const dateMatch = structuredText.match(/Date:\s*(.+)/i);
      if (dateMatch) result.date = dateMatch[1].trim();

      const amountMatch = structuredText.match(/Total Amount:\s*(.+)/i);
      if (amountMatch) result.totalAmount = amountMatch[1].trim();

      const categoryMatch = structuredText.match(/Category:\s*(.+)/i);
      if (categoryMatch) result.category = categoryMatch[1].trim();

      const itemsSection = structuredText.match(/Items:([\s\S]*?)$/i);
      if (itemsSection) {
        const itemLines = itemsSection[1].split('\n').filter((line) => line.trim().startsWith('-'));
        result.items = itemLines.map((line) => line.replace(/^-\s*/, '').trim()).filter(Boolean);
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
    }

    return result;
  },
  { name: 'parse-ocr-response', run_type: 'tool' }
);

/**
 * Call Groq Vision API — traced as an LLM call
 */
const callGroqVision = traceable(
  async function callGroqVision({ base64Image, mimeType, prompt }) {
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 1024,
    });

    return response.choices[0]?.message?.content || '';
  },
  { name: 'groq-vision-ocr', run_type: 'llm' }
);

/**
 * Main pipeline — top-level trace wrapping the full OCR flow
 */
const extractExpenseFromImage = traceable(
  async function extractExpenseFromImage(imagePath) {
    // Read image and encode
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypeMap = {
      '.jpg':  'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png':  'image/png',
      '.gif':  'image/gif',
      '.webp': 'image/webp',
    };
    const mimeType = mimeTypeMap[ext] || 'image/jpeg';

    const prompt = `You are an expense receipt analyzer. Analyze this receipt/bill image and extract all information.

Please provide:
1. RAW TEXT: Extract ALL text visible in the image exactly as it appears.
2. STRUCTURED DATA: Parse the following fields:
   - Vendor/Store Name
   - Date of purchase
   - Total Amount (with currency symbol)
   - Category (e.g., Food, Transport, Shopping, Healthcare, Utilities, Entertainment, Other)
   - List of items with prices (if visible)

Format your response EXACTLY as follows:

=== RAW TEXT ===
[All text from the image]

=== STRUCTURED DATA ===
Vendor: [vendor name]
Date: [date]
Total Amount: [amount]
Category: [category]
Items:
- [item 1]: [price]
- [item 2]: [price]
[continue for all items]`;

    // Step 1: Call Groq Vision (traced as LLM)
    const fullText = await callGroqVision({ base64Image, mimeType, prompt });

    // Step 2: Parse structured fields (traced as tool)
    const parsed = await parseOCRResponse(fullText);

    return {
      success: true,
      rawText: parsed.rawText || fullText,
      vendor: parsed.vendor,
      date: parsed.date,
      totalAmount: parsed.totalAmount,
      category: parsed.category,
      items: parsed.items,
      fullResponse: fullText,
    };
  },
  {
    name: 'expense-ocr-pipeline',
    run_type: 'chain',
    tags: ['expense-tracker', 'ocr', 'groq'],
  }
);

module.exports = { extractExpenseFromImage };
