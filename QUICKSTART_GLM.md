# Quick Start Guide - GLM Edition 🚀

## Prerequisites Checklist ✅

Before starting, ensure you have:
- [ ] Node.js installed (v16 or higher)
- [ ] MongoDB running (local or MongoDB Atlas)
- [ ] GLM API key ([Get one here](https://open.bigmodel.cn/))

## Installation Steps 📦

###1. Install Dependencies

```bash
# Backend dependencies (includes axios for GLM API)
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
- `GLM_API_KEY` - Your GLM API key (required!)
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT tokens

### 3. Get GLM API Key

**Step 1: Register at GLM Platform**
1. Visit https://open.bigmodel.cn/
2. Create an account
3. Verify your email address

**Step 2: Get API Key**
1. Go to "API Keys" section in your GLM dashboard
2. Create a new API key
3. Copy the key to your clipboard

**Step 3: Add to .env file**
```env
GLM_API_KEY=your_actual_glm_api_key_here
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### 5. Run the Application

```bash
# Run both backend and frontend
npm run dev

# Or run separately
npm run server    # Backend on port 5000
npm run client     # Frontend on port 5173
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## First Steps 🎯

1. **Register an Account**
   - Navigate to http://localhost:5173
   - Click "Sign up"
   - Fill in username, email, and password
   - Choose your preferred language (English/Spanish)

2. **Create Your First Study Material**
   - Go to "Materials" → "Create New"
   - Upload an image of handwritten notes
   - Choose: Flashcards, Quiz, or Summary
   - Click "Generate" (this will use your GLM API key!)

3. **Study and Track Progress**
   - Start studying with your GLM-generated materials
   - Track your wellness in the "Wellness" section
   - Monitor progress in the "Progress" section

## Troubleshooting 🔧

### GLM API Connection Issues

If you see "GLM API connection error":
1. Verify your `GLM_API_KEY` is correct in `.env`
2. Check your GLM account has available credits
3. Ensure `GLM_BASE_URL` is correct: `https://open.bigmodel.cn/api/paas/v4`
4. Check your internet connection (GLM servers are in China)
5. Try accessing https://open.bigmodel.cn/ in a browser to verify connectivity

### MongoDB Connection Issues

If you see "MongoDB connection error":
1. Make sure MongoDB is running
2. Check your `MONGODB_URI` in `.env`
3. For local MongoDB, ensure path is correct: `mongodb://localhost:27017/studymate`

### File Upload Issues

If image uploads fail:
1. Check `MAX_FILE_SIZE` in `.env` (default: 10MB)
2. Ensure uploaded images are JPEG or PNG format
3. Check that `backend/uploads` directory exists

### GLM Model Errors

If GLM models don't work:
1. Try alternative model names: `glm-4`, `glm-3`, `glm-4v`
2. Check GLM documentation for current available models
3. Update model names in `.env`:
   ```env
   GLM_VISION_MODEL=glm-4v
   GLM_TEXT_MODEL=glm-4
   ```

## Development Tips 💡

### Backend Development

- The backend server automatically restarts on file changes
- Check console logs for GLM API errors
- Use MongoDB Compass to inspect database data
- GLM API responses are logged for debugging

### Frontend Development

- The frontend includes hot module replacement
- Browser console shows detailed error messages
- React DevTools helps with component debugging
- Network tab shows GLM API calls

### Testing GLM API

Test your GLM API key before running the full app:

```bash
# Test GLM connection
curl -X POST https://open.bigmodel.cn/api/paas/v4/chat/completions \
  -H "Authorization: Bearer YOUR_GLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4","messages":[{"role":"user","content":"Hello!"}]}'
```

## GLM API Cost Information 💰

### Typical Usage Costs

**Per Study Material:**
- Flashcard set: ~$0.003-0.008 (depending on complexity)
- Quiz: ~$0.005-0.015 (depending on number of questions)
- Summary: ~$0.002-0.006 (depending on length)

**Monthly Estimates:**
- Light student (1-2 materials/week): ~$0.10-0.30/month
- Moderate student (5-10 materials/week): ~$0.30-1.00/month
- Heavy student (15-20 materials/week): ~$1.00-3.00/month

*Note: Actual costs depend on current GLM pricing and your usage.*

### Cost Monitoring

1. Check your GLM dashboard for real-time usage
2. Set spending alerts if available
3. Monitor costs regularly, especially during testing

## Next Steps 🚀

1. **Customize the Application**
   - Modify colors in `frontend/tailwind.config.js`
   - Update logo and branding
   - Add your own mental health resources

2. **Deploy to Production**
   - Backend: Heroku, Railway, or Render
   - Frontend: Vercel, Netlify, or GitHub Pages
   - Update environment variables for production
   - Add your GLM API key to production environment

3. **Enhance GLM Integration**
   - Try different GLM models for better quality
   - Optimize prompts for GLM's capabilities
   - Add error handling for GLM-specific issues
   - Implement rate limiting to avoid API limits

## Advantages of GLM 🇨🇳

✅ **Cost-effective** - Often cheaper than other AI providers
✅ **No minimum commitment** - Pay for what you use
✅ **Good multilingual support** - Works well with English and Spanish
✅ **Reliable infrastructure** - Stable Chinese AI platform
✅ **Fast performance** - Good response times for educational content
✅ **Vision capabilities** - Strong image text extraction

## Support 📚

- **GLM Documentation**: https://open.bigmodel.cn/docs
- **GLM Support**: https://open.bigmodel.cn/support
- **Application Documentation**: See README_GLM.md for detailed information
- **API Health Check**: http://localhost:5000/api/health

---

Happy studying with GLM AI! 🎓✨
🇨🇳 Powered by Chinese Innovation