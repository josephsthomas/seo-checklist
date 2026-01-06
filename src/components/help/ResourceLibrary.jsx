import React, { useState, useMemo } from 'react';
import { Search, Book, Video, FileText, Filter, ExternalLink } from 'lucide-react';
import { resources, resourceCategories, resourceTypes, difficultyLevels } from '../../data/resources';
import ReactMarkdown from 'react-markdown';

export default function ResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedResource, setSelectedResource] = useState(null);

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      // Enhanced search: split query into words for better matching
      if (searchQuery !== '') {
        const queryWords = searchQuery.toLowerCase().trim().split(/\s+/);
        const searchableText = [
          resource.title,
          resource.description,
          ...resource.tags,
          resource.category,
          resource.type,
          resource.difficulty
        ].join(' ').toLowerCase();

        const matchesSearch = queryWords.every(word => searchableText.includes(word));
        if (!matchesSearch) return false;
      }

      const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
      const matchesType = selectedType === 'All' || resource.type === selectedType;
      const matchesDifficulty = selectedDifficulty === 'All' || resource.difficulty === selectedDifficulty;

      return matchesCategory && matchesType && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedType, selectedDifficulty]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Guide': return <Book className="w-5 h-5" />;
      case 'Tutorial': return <FileText className="w-5 h-5" />;
      case 'Video': return <Video className="w-5 h-5" />;
      default: return <Book className="w-5 h-5" />;
    }
  };

  const difficultyColor = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800'
  };

  if (selectedResource) {
    return (
      <div className="min-h-screen bg-charcoal-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setSelectedResource(null)}
            className="btn btn-secondary mb-6"
          >
            ← Back to Library
          </button>

          <article className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                {getTypeIcon(selectedResource.type)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColor[selectedResource.difficulty]}`}>
                  {selectedResource.difficulty}
                </span>
                <span className="text-sm text-charcoal-500">{selectedResource.duration}</span>
              </div>
              <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
                {selectedResource.title}
              </h1>
              <p className="text-charcoal-600">{selectedResource.description}</p>
            </div>

            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{selectedResource.content}</ReactMarkdown>
            </div>

            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedResource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-charcoal-100 text-charcoal-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Resource Library</h1>
          <p className="text-charcoal-600">
            Comprehensive guides, tutorials, and best practices for SEO success
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              {resourceCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              {resourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input"
            >
              {difficultyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resource Grid */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No resources found</h3>
            <p className="text-charcoal-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <div
                key={resource.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedResource(resource)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-charcoal-500">{resource.category}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 line-clamp-2">
                  {resource.title}
                </h3>

                <p className="text-sm text-charcoal-600 mb-4 line-clamp-3">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor[resource.difficulty]}`}>
                    {resource.difficulty}
                  </span>
                  <span className="text-xs text-charcoal-500">{resource.duration}</span>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs text-charcoal-500">
                        #{tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="text-xs text-charcoal-500">
                        +{resource.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
