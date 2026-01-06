import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Tag, Link as LinkIcon } from 'lucide-react';
import { glossaryTerms, glossaryCategories } from '../../data/glossary';

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTerm, setSelectedTerm] = useState(null);

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(term => {
      // Enhanced search: split query into words for better matching
      if (searchQuery !== '') {
        const queryWords = searchQuery.toLowerCase().trim().split(/\s+/);
        const searchableText = [
          term.term,
          term.definition,
          ...term.relatedTerms,
          term.category
        ].join(' ').toLowerCase();

        const matchesSearch = queryWords.every(word => searchableText.includes(word));
        if (!matchesSearch) return false;
      }

      const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;

      return matchesCategory;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory]);

  // Group terms by first letter
  const groupedTerms = useMemo(() => {
    const groups = {};
    filteredTerms.forEach(term => {
      const firstLetter = term.term[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const letters = Object.keys(groupedTerms).sort();

  return (
    <div className="min-h-screen bg-charcoal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">SEO Glossary</h1>
          <p className="text-charcoal-600">
            Comprehensive definitions of SEO terms and concepts
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input md:w-64"
            >
              {glossaryCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Total Terms</p>
                <p className="text-3xl font-bold text-charcoal-900">{glossaryTerms.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Categories</p>
                <p className="text-3xl font-bold text-primary-600">{glossaryCategories.length - 1}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Tag className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Filtered Results</p>
                <p className="text-3xl font-bold text-green-600">{filteredTerms.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Search className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Terms List */}
        {filteredTerms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <BookOpen className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No terms found</h3>
            <p className="text-charcoal-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {letters.map(letter => (
              <div key={letter} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-primary-600 text-white px-6 py-3">
                  <h2 className="text-2xl font-bold">{letter}</h2>
                </div>
                <div className="divide-y">
                  {groupedTerms[letter].map(term => (
                    <div
                      key={term.id}
                      className="p-6 hover:bg-charcoal-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTerm(selectedTerm?.id === term.id ? null : term)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-charcoal-900">
                              {term.term}
                            </h3>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
                              {term.category}
                            </span>
                          </div>

                          <p className="text-charcoal-700 mb-3">{term.definition}</p>

                          {selectedTerm?.id === term.id && (
                            <div className="mt-4 space-y-3">
                              {term.example && (
                                <div className="bg-charcoal-50 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-charcoal-900 mb-2">
                                    Example:
                                  </h4>
                                  <code className="text-sm text-charcoal-700 block overflow-x-auto">
                                    {term.example}
                                  </code>
                                </div>
                              )}

                              {term.relatedTerms && term.relatedTerms.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-charcoal-900 mb-2 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    Related Terms:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {term.relatedTerms.map((related, index) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-charcoal-100 text-charcoal-700 rounded-full text-sm hover:bg-charcoal-200 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSearchQuery(related);
                                        }}
                                      >
                                        {related}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium ml-4">
                          {selectedTerm?.id === term.id ? 'Show less' : 'Show more'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
