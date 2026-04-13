const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Extract text from an image using OpenAI Vision API
 */
exports.extractTextFromImage = async (imageUrl, language = 'en') => {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: language === 'es'
                ? 'Por favor, extrae todo el texto legible de esta imagen. Organiza el contenido de manera clara y estructurada. Si hay encabezados, listas o secciones diferentes, maintén esa estructura en el texto extraído.'
                : 'Please extract all readable text from this image. Organize the content clearly and maintain any structure like headings, lists, or different sections.'
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
      max_tokens: 2000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
};

/**
 * Generate flashcards from text using OpenAI Text API
 */
exports.generateFlashcards = async (text, language = 'en', count = 10) => {
  try {
    const prompt = language === 'es'
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational content creator. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500
    });

    const content = JSON.parse(response.choices[0].message.content);
    return content.flashcards || [];
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards');
  }
};

/**
 * Generate quiz from text using OpenAI Text API
 */
exports.generateQuiz = async (text, language = 'en', questionCount = 5) => {
  try {
    const prompt = language === 'es'
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational content creator. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000
    });

    const content = JSON.parse(response.choices[0].message.content);
    return content.questions || [];
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz');
  }
};

/**
 * Generate summary from text using OpenAI Text API
 */
exports.generateSummary = async (text, language = 'en', length = 'medium') => {
  try {
    const lengthInstruction = {
      'short': 'Keep it under 100 words',
      'medium': 'Keep it between 100-300 words',
      'long': 'Keep it between 300-500 words'
    }[length] || 'Keep it between 100-300 words';

    const prompt = language === 'es'
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational content creator. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000
    });

    const content = JSON.parse(response.choices[0].message.content);
    return content;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
};