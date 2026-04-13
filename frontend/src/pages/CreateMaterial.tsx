import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadApi, materialsApi } from '../services/api';
import {
  Upload,
  X,
  Loader2,
  Sparkles,
  BookOpen,
  FileText,
  HelpCircle
} from 'lucide-react';

interface UploadedFile {
  file: File;
  url: string;
  filename: string;
}

const CreateMaterial: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [materialType, setMaterialType] = useState<'flashcard' | 'quiz' | 'summary'>('flashcard');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [options, setOptions] = useState({
    count: 10,
    questionCount: 5,
    length: 'medium',
    difficulty: 'medium'
  });

  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate files
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only JPEG and PNG images are allowed.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError(`File too large: ${file.name}. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setError('');

    // Create preview URLs
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      filename: file.name
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    const removedFile = files[index];
    URL.revokeObjectURL(removedFile.url);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAndGenerate = async () => {
    if (files.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload files
      const uploadPromises = files.map(async (uploadedFile) => {
        const formData = new FormData();
        formData.append('image', uploadedFile.file);

        const response = await uploadApi.uploadImage(formData);
        return response.data.data;
      });

      const uploadResults = await Promise.all(uploadPromises);
      setUploading(false);
      setGenerating(true);

      // Generate study materials from first uploaded image
      const firstImage = uploadResults[0];
      const response = await materialsApi.generate({
        imageUrl: `http://localhost:5000${firstImage.url}`,
        type: materialType,
        subject: subject || undefined,
        topic: topic || undefined,
        language,
        options: {
          count: materialType === 'flashcard' ? options.count : undefined,
          questionCount: materialType === 'quiz' ? options.questionCount : undefined,
          length: materialType === 'summary' ? options.length : undefined,
          difficulty: options.difficulty
        }
      });

      const material = response.data.data.material;

      // Navigate to the study page
      navigate(`/materials/${materialType}/${material.id}`);

    } catch (err: any) {
      setUploading(false);
      setGenerating(false);
      setError(err.response?.data?.message || 'Failed to create material. Please try again.');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flashcard':
        return <BookOpen size={24} className="text-primary-600" />;
      case 'quiz':
        return <HelpCircle size={24} className="text-secondary-600" />;
      case 'summary':
        return <FileText size={24} className="text-green-600" />;
      default:
        return <BookOpen size={24} className="text-gray-600" />;
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'flashcard':
        return 'Create interactive flashcards for quick review';
      case 'quiz':
        return 'Generate multiple-choice questions to test your knowledge';
      case 'summary':
        return 'Get a concise summary with key points';
      default:
        return '';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Study Material</h1>
        <p className="text-white/80">Upload your notes and let AI create study materials</p>
      </div>

      <div className="space-y-6">
        {/* Material Type Selection */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Material Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['flashcard', 'quiz', 'summary'].map((type) => (
              <button
                key={type}
                onClick={() => setMaterialType(type as any)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  materialType === type
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-center mb-3">
                  {getTypeIcon(type)}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 capitalize">{type}</h3>
                <p className="text-sm text-gray-600">{getTypeDescription(type)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Notes</h2>

          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-400 transition-colors cursor-pointer"
          >
            <Upload size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-600">
              JPEG and PNG images up to 10MB each
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File Previews */}
          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((uploadedFile, index) => (
                <div key={index} className="relative group">
                  <img
                    src={uploadedFile.url}
                    alt={uploadedFile.filename}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  <p className="mt-1 text-xs text-gray-600 truncate">
                    {uploadedFile.filename}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field"
                placeholder="e.g., Mathematics, History"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-field"
                placeholder="e.g., Calculus, World War II"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="es">Español (Spanish)</option>
              </select>
            </div>

            {/* Type-specific options */}
            {materialType === 'flashcard' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Flashcards
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={options.count}
                  onChange={(e) => setOptions({ ...options, count: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
            )}

            {materialType === 'quiz' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={options.questionCount}
                  onChange={(e) => setOptions({ ...options, questionCount: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
            )}

            {materialType === 'summary' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary Length
                </label>
                <select
                  value={options.length}
                  onChange={(e) => setOptions({ ...options, length: e.target.value })}
                  className="input-field"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            )}

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={options.difficulty}
                onChange={(e) => setOptions({ ...options, difficulty: e.target.value })}
                className="input-field"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleUploadAndGenerate}
          disabled={uploading || generating || files.length === 0}
          className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading || generating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>{generating ? 'Generating...' : 'Uploading...'}</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Generate {materialType}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateMaterial;