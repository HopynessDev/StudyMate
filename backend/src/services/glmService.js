const axios = require('axios');

class GLMService {
  constructor() {
    this.apiKey = process.env.GLM_API_KEY;
    this.baseUrl = process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';

    if (!this.apiKey) {
      console.warn('GLM_API_KEY not found in environment variables');
    }
  }

  /**
   * Extract text from an image using GLM Vision API
   */
  async extractTextFromImage(imageUrl, language = 'en') {
    try {
      const prompt = language === 'es'
        ? 'Por favor, extrae todo el texto legible de esta imagen. Organiza el contenido de manera clara y estructurada. Si hay encabezados, listas o secciones diferentes, maintén esa estructura en el texto extraído.'
        : 'Please extract all readable text from this image. Organize the content clearly and maintain any structure like headings, lists, or different sections.';

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: process.env.GLM_VISION_MODEL || 'glm-4v',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error extracting text from image with GLM:', error.response?.data || error.message);
      throw new Error('Failed to extract text from image using GLM');
    }
  }

  /**
   * Generate flashcards from text using GLM Text API
   */
  async generateFlashcards(text, language = 'en', count = 10) {
    try {
      const systemPrompt = 'You are an educational content creator. Always respond with valid JSON.';
      const userPrompt = language === 'es'
        ? `Genera ${count} tarjetas de estudio basadas en el siguiente texto.
           Para cada tarjeta, proporciona:
           - pregunta: una pregunta clara basada en el contenido
           - respuesta: una respuesta concisa y precisa

           Formato JSON:
           {
             "flashcards": [
               {
                 "question": "...",
                 "answer": "..."
               }
             ]
           }

           Texto: ${text}`
        : `Generate ${count} flashcards from the following text.
           For each flashcard, provide:
           - question: a clear question based on the content
           - answer: a concise and accurate answer

           JSON format:
           {
             "flashcards": [
               {
                 "question": "...",
                 "answer": "..."
               }
             ]
           }

           Text: ${text}`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: process.env.GLM_TEXT_MODEL || 'glm-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = JSON.parse(response.data.choices[0].message.content);
      return content.flashcards || [];
    } catch (error) {
      console.error('Error generating flashcards with GLM:', error.response?.data || error.message);
      throw new Error('Failed to generate flashcards using GLM');
    }
  }

  /**
   * Generate quiz from text using GLM Text API
   */
  async generateQuiz(text, language = 'en', questionCount = 5) {
    try {
      const systemPrompt = 'You are an educational content creator. Always respond with valid JSON.';
      const userPrompt = language === 'es'
        ? `Genera un cuestionario de ${questionCount} preguntas de opción múltiple basado en el siguiente texto.
           Para cada pregunta, proporciona:
           - question: la pregunta
           - options: un array de 4 opciones
           - correctAnswer: el índice de la respuesta correcta (0-3)
           - explanation: una breve explicación de por qué esa respuesta es correcta

           Formato JSON:
           {
             "questions": [
               {
                 "question": "...",
                 "options": ["...", "...", "...", "..."],
                 "correctAnswer": 0,
                 "explanation": "..."
               }
             ]
           }

           Texto: ${text}`
        : `Generate a quiz with ${questionCount} multiple choice questions from the following text.
           For each question, provide:
           - question: the question
           - options: an array of 4 options
           - correctAnswer: the index of the correct answer (0-3)
           - explanation: a brief explanation of why that answer is correct

           JSON format:
           {
             "questions": [
               {
                 "question": "...",
                 "options": ["...", "...", "...", "..."],
                 "correctAnswer": 0,
                 "explanation": "..."
               }
             ]
           }

           Text: ${text}`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: process.env.GLM_TEXT_MODEL || 'glm-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = JSON.parse(response.data.choices[0].message.content);
      return content.questions || [];
    } catch (error) {
      console.error('Error generating quiz with GLM:', error.response?.data || error.message);
      throw new Error('Failed to generate quiz using GLM');
    }
  }

  /**
   * Generate summary from text using GLM Text API
   */
  async generateSummary(text, language = 'en', length = 'medium') {
    try {
      const systemPrompt = 'You are an educational content creator. Always respond with valid JSON.';
      const lengthInstruction = {
        'short': 'Keep it under 100 words',
        'medium': 'Keep it between 100-300 words',
        'long': 'Keep it between 300-500 words'
      }[length] || 'Keep it between 100-300 words';

      const userPrompt = language === 'es'
        ? `Genera un resumen del siguiente texto. ${lengthInstruction}.
           Organiza el resumen con:
           - puntos clave: los conceptos más importantes
           - explicación breve: una descripción general

           Formato JSON:
           {
             "keyPoints": ["...", "..."],
             "explanation": "..."
           }

           Texto: ${text}`
        : `Generate a summary of the following text. ${lengthInstruction}.
           Organize the summary with:
           - keyPoints: the most important concepts
           - briefExplanation: a general overview

           JSON format:
           {
             "keyPoints": ["...", "..."],
             "explanation": "..."
           }

           Text: ${text}`;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: process.env.GLM_TEXT_MODEL || 'glm-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.5,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = JSON.parse(response.data.choices[0].message.content);
      return content;
    } catch (error) {
      console.error('Error generating summary with GLM:', error.response?.data || error.message);
      throw new Error('Failed to generate summary using GLM');
    }
  }
}

// Create and export singleton instance
const glmService = new GLMService();
module.exports = glmService;