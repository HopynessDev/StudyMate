import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { materialsApi } from '../services/api';
import type { StudyMaterial } from '../types';
import {
  BookOpen,
  Filter,
  Search,
  Plus,
  Grid3x3,
  List,
  Trash2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

const Materials: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'flashcard' | 'quiz' | 'summary'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const loadMaterials = async () => {
      try {
        setLoading(true);
        const response = await materialsApi.getMaterials({
          search: searchQuery,
          type: filterType === 'all' ? undefined : filterType
        });
        setMaterials(response.data.data.materials);
      } catch (error) {
        console.error('Error loading materials:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, [searchQuery, filterType, isAuthenticated, authLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      await materialsApi.deleteMaterial(id);
      setMaterials(materials.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const handleBookmark = async (id: string, currentStatus: boolean) => {
    try {
      const response = await materialsApi.updateMaterial(id, {
        isBookmarked: !currentStatus
      });
      setMaterials(materials.map(m =>
        m.id === id ? response.data.data.material : m
      ));
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flashcard':
        return '🎴';
      case 'quiz':
        return '📝';
      case 'summary':
        return '📋';
      default:
        return '📚';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading materials...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Study Materials</h1>
          <p className="text-white/80">Manage and review your study materials</p>
        </div>
        <Link
          to="/materials/create"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create New</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={20} className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filter and View Options */}
          <div className="flex items-center space-x-4">
            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="flashcard">Flashcards</option>
                <option value="quiz">Quizzes</option>
                <option value="summary">Summaries</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Grid/List */}
      {materials.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {materials.map((material) => (
            <div
              key={material.id}
              className="card hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getTypeIcon(material.type)}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{material.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{material.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBookmark(material.id, material.isBookmarked)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {material.isBookmarked ? (
                      <BookmarkCheck size={20} className="text-primary-600" />
                    ) : (
                      <Bookmark size={20} className="text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} className="text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {material.subject && (
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span className="font-medium">Subject:</span>
                    <span>{material.subject}</span>
                  </div>
                )}
                {material.topic && (
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span className="font-medium">Topic:</span>
                    <span>{material.topic}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <span className="font-medium">Difficulty:</span>
                  <span className="capitalize">{material.difficulty}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <span className="font-medium">Progress:</span>
                  <span className="text-primary-600 font-medium">
                    {material.progress.completedItems}/{material.progress.totalItems}
                  </span>
                  <span className="text-gray-500">
                    ({Math.round((material.progress.completedItems / material.progress.totalItems) * 100)}%)
                  </span>
                </div>
              </div>

              <Link
                to={`/materials/${material.type}/${material.id}`}
                className="btn-primary block text-center"
              >
                {material.progress.completedItems < material.progress.totalItems ? 'Continue' : 'Review'}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen size={64} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Materials Found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first study material'
          }
          </p>
          <Link to="/materials/create" className="btn-primary inline-block">
            Create Your First Material
          </Link>
        </div>
      )}
    </div>
  );
};

export default Materials;