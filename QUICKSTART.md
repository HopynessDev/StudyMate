# Quick Start Guide 🚀

## Prerequisites Checklist ✅

Before starting, ensure you have:
- [ ] Node.js installed (v16 or higher)
- [ ] MongoDB running (local or MongoDB Atlas)
- [ ] OpenAI API key ([Get one here](https://platform.openai.com/))

## Installation Steps 📦

### 1. Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `OPENAI_API_KEY` - Your OpenAI API key
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT tokens

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### 4. Run the Application

```bash
# Run both backend and frontend
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend (port 5000)
npm run server

# Terminal 2 - Frontend (port 5173)
npm run client
```

## Access the Application 🌐

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## First Steps 🎯

1. **Register an Account**
   - Navigate to http://localhost:5173
   - Click "Sign up"
   - Fill in username, email, and password
   - Choose your preferred language

2. **Create Your First Study Material**
   - Go to "Materials" → "Create New"
   - Upload an image of handwritten notes
   - Choose: Flashcards, Quiz, or Summary
   - Click "Generate"

3. **Study and Track Progress**
   - Start studying with your generated materials
   - Track your wellness in the "Wellness" section
   - Monitor progress in the "Progress" section

## Troubleshooting 🔧

### MongoDB Connection Issues

If you see "MongoDB connection error":
1. Make sure MongoDB is running
2. Check your `MONGODB_URI` in `.env`
3. For local MongoDB, ensure the path is correct: `mongodb://localhost:27017/studymate`

### OpenAI API Issues

If you see API errors:
1. Verify your `OPENAI_API_KEY` is correct
2. Check your OpenAI account has credits
3. Ensure the API key has the necessary permissions

### Port Conflicts

If port 5000 or 5173 is already in use:
1. Change the port in `.env`:
   ```
   PORT=3000  # Change 5000 to 3000
   ```
2. Or update frontend Vite config to use a different port

### File Upload Issues

If image uploads fail:
1. Check `MAX_FILE_SIZE` in `.env` (default: 10MB)
2. Ensure uploaded images are JPEG or PNG format
3. Check that the `backend/uploads` directory exists

## Development Tips 💡

### Backend Development

- The backend server automatically restarts on file changes
- Check console logs for API errors
- Use MongoDB Compass to inspect database data

### Frontend Development

- The frontend includes hot module replacement
- Browser console shows detailed error messages
- React DevTools helps with component debugging

### Testing APIs

Use tools like Postman or curl to test endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'
```

## Next Steps 🚀

1. **Customize the Application**
   - Modify colors in `frontend/tailwind.config.js`
   - Update the logo and branding
   - Add your own mental health resources

2. **Deploy to Production**
   - Backend: Heroku, Railway, or Render
   - Frontend: Vercel, Netlify, or GitHub Pages
   - Update environment variables for production

3. **Add Features**
   - Add more study material types
   - Integrate additional AI models
   - Enhance the wellness tracking
   - Add collaborative features

## Support 📚

- **Documentation**: See README.md for detailed information
- **API Documentation**: Check `/api/health` for status
- **Issues**: Report bugs in the issue tracker

---

Happy studying! 📚✨