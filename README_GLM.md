# StudyMate 🎓 - GLM Edition

AI-powered study companion platform that helps students generate study materials from handwritten notes using **GLM (Chinese LLM)** image recognition and text generation.

## Features ✨

- **🖼️ Image Recognition**: Upload photos of handwritten notes
- **🤖 AI Content Generation**: Generate flashcards, quizzes, and summaries using GLM
- **📚 Study Materials**: Organize and manage study materials by subject/topic
- **💚 Mental Health Support**: Track stress levels and access relaxation exercises
- **📊 Progress Tracking**: Monitor learning progress and achievements
- **🌍 Bilingual Support**: English and Spanish language support
- **🏆 Achievement System**: Unlock achievements as you study
- **🎯 Goal Setting**: Set and track learning goals

## Tech Stack 🛠️

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** - Database
- **GLM API** - AI content generation (Chinese LLM)
- **JWT** - Authentication
- **Multer** - File uploads
- **Axios** - HTTP client for GLM API

### Frontend
- **React.js** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API client
- **Lucide React** - Icons

## GLM Integration 🇨🇳

### Why GLM?
- **Cost-effective**: Often cheaper than OpenAI
- **No minimum commitment**: Pay for what you use
- **Good Chinese/English bilingual support**
- **Reliable performance** for educational content

### Models Used
- **glm-4v**: Vision model for text extraction from images
- **glm-4**: Text generation model for flashcards, quizzes, and summaries

## Getting Started 🚀

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- GLM API key ([Get one here](https://open.bigmodel.cn/))

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd StudyMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/studymate

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d

   # GLM API Configuration
   GLM_API_KEY=your_glm_api_key_here
   GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
   GLM_VISION_MODEL=glm-4v
   GLM_TEXT_MODEL=glm-4

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend Configuration
   FRONTEND_URL=http://localhost:5173

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod

   # Or update MONGODB_URI for MongoDB Atlas
   ```

5. **Run development servers**
   ```bash
   # Run both backend and frontend
   npm run dev

   # Or run separately
   npm run server    # Backend on port 5000
   npm run client     # Frontend on port 5173
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## Getting GLM API Key 🔑

1. **Register at GLM Platform**
   - Visit https://open.bigmodel.cn/
   - Create an account
   - Verify your email

2. **Get API Key**
   - Go to API Keys section
   - Create a new API key
   - Copy the key

3. **Add to .env file**
   - Paste your GLM API key in the `.env` file
   - The application will now use GLM for all AI features

## GLM Pricing 💰

GLM pricing is generally competitive:

- **Pay-as-you-go**: No minimum commitment
- **Cost-effective**: Often cheaper than other providers
- **Free tier**: May have free credits for testing

Check [GLM Pricing](https://open.bigmodel.cn/pricing) for current rates.

## API Endpoints 🔌

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Materials
- `POST /api/materials/generate` - Generate study material from image
- `GET /api/materials` - Get all materials
- `GET /api/materials/:id` - Get single material
- `PUT /api/materials/:id` - Update material
- `PUT /api/materials/:id/progress` - Update progress
- `DELETE /api/materials/:id` - Delete material
- `GET /api/materials/subjects` - Get subjects/topics

### Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `DELETE /api/upload/file/:filename` - Delete uploaded file

### Wellness
- `POST /api/wellness/record` - Record wellness check-in
- `GET /api/wellness/history` - Get wellness history
- `GET /api/wellness/trends` - Get wellness trends
- `GET /api/wellness/relaxation` - Get relaxation content
- `GET /api/wellness/resources` - Get mental health resources

### Progress
- `POST /api/progress/sessions` - Record study session
- `GET /api/progress/sessions` - Get study sessions
- `GET /api/progress/statistics` - Get statistics
- `GET /api/progress/achievements` - Get achievements
- `GET /api/progress/goals` - Get goals
- `POST /api/progress/goals` - Create goal
- `PUT /api/progress/goals/:id` - Update goal progress
- `DELETE /api/progress/goals/:id` - Delete goal

## GLM Service Details 🔧

### Supported Models
- **glm-4v**: Vision model for text extraction from images
- **glm-4**: Text generation model for creating study materials
- **glm-3**: Alternative text model (if needed)

### Features
- **Multilingual**: Supports both English and Spanish
- **Vision Capabilities**: Can read handwritten and printed text
- **JSON Response**: Structured output for flashcards, quizzes, and summaries
- **Error Handling**: Comprehensive error handling and retry logic

## Environment Variables 🔐

| Variable | Description | Default |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/studymate` |
| `JWT_SECRET` | Secret key for JWT tokens | - |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `GLM_API_KEY` | GLM API key | - |
| `GLM_BASE_URL` | GLM API base URL | `https://open.bigmodel.cn/api/paas/v4` |
| `GLM_VISION_MODEL` | Vision model name | `glm-4v` |
| `GLM_TEXT_MODEL` | Text model name | `glm-4` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` |

## Troubleshooting 🔧

### GLM API Issues

If you see GLM API errors:
1. Verify your `GLM_API_KEY` is correct
2. Check your GLM account has available credits
3. Ensure `GLM_BASE_URL` is correct
4. Check your internet connection to Chinese servers

### Model Errors

If specific GLM models don't work:
1. Try alternative model names: `glm-4`, `glm-3`, etc.
2. Check GLM documentation for current available models
3. Update model names in `.env` file

### Rate Limiting

GLM may have rate limits:
1. Check your usage in GLM dashboard
2. Implement request queuing if needed
3. Add retry logic with exponential backoff

## Deployment 📦

### Backend Deployment

1. Set `NODE_ENV=production` in environment variables
2. Update `MONGODB_URI` for production database
3. Update `FRONTEND_URL` for production frontend
4. Add your GLM API key to production environment
5. Deploy to platforms like Heroku, Railway, or Vercel

### Frontend Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy `dist` folder to platforms like Vercel, Netlify, or GitHub Pages

3. Update `FRONTEND_URL` in backend environment variables

## Contributing 🤝

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under MIT License.

## Support 💬

For GLM API support: https://open.bigmodel.cn/support
For StudyMate application support: Open an issue in the repository

---

Made with ❤️ using GLM AI technology
🇨🇳 Powered by Chinese AI Innovation