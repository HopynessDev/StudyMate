const StudyMaterial = require('../models/StudyMaterial');
const glmService = require('../services/glmService');

/**
 * Extract text from image and generate study materials
 */
exports.extractAndGenerate = async (req, res) => {
  try {
    const { imageUrl, type, subject, topic, language = 'en', options = {} } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    if (!['flashcard', 'quiz', 'summary'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid material type. Must be flashcard, quiz, or summary'
      });
    }

    // Extract text from image
    const extractedText = await glmService.extractTextFromImage(imageUrl, language);

    // Generate study material based on type
    let generatedContent;
    let title;
    let metadata = {};

    switch (type) {
      case 'flashcard':
        const flashcardCount = options.count || 10;
        generatedContent = await glmService.generateFlashcards(extractedText, language, flashcardCount);
        title = `${subject || 'Study'} - Flashcards`;
        metadata.totalItems = generatedContent.length;
        break;

      case 'quiz':
        const questionCount = options.questionCount || 5;
        generatedContent = await glmService.generateQuiz(extractedText, language, questionCount);
        title = `${subject || 'Study'} - Quiz`;
        metadata.totalItems = generatedContent.length;
        break;

      case 'summary':
        const summaryLength = options.length || 'medium';
        generatedContent = await glmService.generateSummary(extractedText, language, summaryLength);
        title = `${subject || 'Study'} - Summary`;
        metadata.wordCount = generatedContent.explanation?.split(' ').length || 0;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid material type'
        });
    }

    // Create study material document
    const studyMaterial = await StudyMaterial.create({
      user: req.user.id,
      type,
      title,
      subject,
      topic,
      content: generatedContent,
      originalText: extractedText,
      imageUrl,
      language,
      difficulty: options.difficulty || 'medium',
      tags: options.tags || [],
      metadata: {
        ...metadata,
        wordCount: extractedText.split(' ').length,
        aiGenerated: true
      },
      progress: {
        totalItems: metadata.totalItems || 1,
        completedItems: 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Study material generated successfully',
      data: { material: studyMaterial }
    });

  } catch (error) {
    console.error('Extract and generate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating study material',
      error: error.message
    });
  }
};

/**
 * Get all study materials for user
 */
exports.getMaterials = async (req, res) => {
  try {
    const { type, subject, page = 1, limit = 10, search } = req.query;

    const query = { user: req.user.id };

    if (type) query.type = type;
    if (subject) query.subject = subject;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    const materials = await StudyMaterial.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudyMaterial.countDocuments(query);

    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching materials',
      error: error.message
    });
  }
};

/**
 * Get single study material
 */
exports.getMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check ownership
    if (material.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this material'
      });
    }

    res.json({
      success: true,
      data: { material }
    });

  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching material',
      error: error.message
    });
  }
};

/**
 * Update study material
 */
exports.updateMaterial = async (req, res) => {
  try {
    const { title, subject, topic, tags, isBookmarked } = req.body;

    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check ownership
    if (material.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this material'
      });
    }

    const fieldsToUpdate = {};
    if (title) fieldsToUpdate.title = title;
    if (subject) fieldsToUpdate.subject = subject;
    if (topic) fieldsToUpdate.topic = topic;
    if (tags) fieldsToUpdate.tags = tags;
    if (typeof isBookmarked === 'boolean') fieldsToUpdate.isBookmarked = isBookmarked;

    const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Material updated successfully',
      data: { material: updatedMaterial }
    });

  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating material',
      error: error.message
    });
  }
};

/**
 * Update progress on study material
 */
exports.updateProgress = async (req, res) => {
  try {
    const { completedItems } = req.body;

    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check ownership
    if (material.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this material'
      });
    }

    material.progress.completedItems = Math.min(completedItems, material.progress.totalItems);
    material.progress.lastStudiedAt = new Date();
    material.progress.studyCount += 1;

    await material.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: { material }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

/**
 * Delete study material
 */
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check ownership
    if (material.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this material'
      });
    }

    await material.deleteOne();

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });

  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting material',
      error: error.message
    });
  }
};

/**
 * Get subjects/topics for user
 */
exports.getSubjects = async (req, res) => {
  try {
    const materials = await StudyMaterial.find({ user: req.user.id })
      .select('subject topic type')
      .sort({ subject: 1, topic: 1 });

    const subjects = {};

    materials.forEach(material => {
      if (!material.subject) return;

      if (!subjects[material.subject]) {
        subjects[material.subject] = {
          topics: [],
          materialCount: 0,
          types: {}
        };
      }

      if (material.topic && !subjects[material.subject].topics.includes(material.topic)) {
        subjects[material.subject].topics.push(material.topic);
      }

      subjects[material.subject].materialCount++;
      subjects[material.subject].types[material.type] = (subjects[material.subject].types[material.type] || 0) + 1;
    });

    res.json({
      success: true,
      data: { subjects }
    });

  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
};