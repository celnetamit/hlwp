'use client';

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Calendar, Eye, Heart, ChevronRight, X } from 'lucide-react';

const JournalLibrary = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [showCarouselPopup, setShowCarouselPopup] = useState(false);
  const [carouselShown, setCarouselShown] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [journals, setJournals] = useState([
    {
      id: 1,
      title: "Advances in Machine Learning and Neural Networks",
      description: "This comprehensive journal explores cutting-edge developments in artificial intelligence, focusing on deep learning architectures, neural network optimization, and real-world applications across various industries.",
      content: "Machine learning has revolutionized the way we approach complex problems across numerous domains. Recent advances in neural network architectures have led to breakthrough performance in tasks ranging from computer vision to natural language processing. This journal examines the latest developments in convolutional neural networks, transformer architectures, and generative adversarial networks. We explore optimization techniques such as attention mechanisms, batch normalization, and dropout regularization that have become fundamental to modern deep learning systems. The practical applications discussed include autonomous vehicles, medical diagnosis, financial modeling, and scientific research.",
      category: "Technology",
      date: "2024-01-15",
      readTime: "12 min",
      likes: 234
    },
    {
      id: 2,
      title: "Climate Change and Environmental Sustainability",
      description: "An in-depth analysis of current climate trends, environmental policies, and sustainable practices that can help mitigate the effects of global warming and preserve our planet for future generations.",
      content: "Climate change represents one of the most pressing challenges of our time, requiring immediate and sustained action across all sectors of society. This journal examines the latest scientific evidence regarding global temperature trends, sea level rise, and extreme weather patterns. We analyze the effectiveness of international climate agreements, carbon pricing mechanisms, and renewable energy adoption rates. The discussion includes innovative technologies such as carbon capture and storage, green hydrogen production, and sustainable agriculture practices that can significantly reduce greenhouse gas emissions.",
      category: "Environment",
      date: "2024-01-20",
      readTime: "15 min",
      likes: 189
    },
    {
      id: 3,
      title: "Modern Psychology and Mental Health Research",
      description: "Exploring recent breakthroughs in psychological research, including new therapeutic approaches, cognitive behavioral studies, and the intersection of technology with mental health treatment.",
      content: "The field of psychology continues to evolve with new insights into human behavior, cognition, and mental health treatment approaches. This journal reviews recent studies in cognitive behavioral therapy, mindfulness-based interventions, and digital mental health solutions. We examine the neurobiological basis of mental health disorders, including depression, anxiety, and PTSD, while discussing innovative treatment modalities such as virtual reality therapy, AI-assisted counseling, and personalized medicine approaches to psychiatric care.",
      category: "Psychology",
      date: "2024-01-25",
      readTime: "10 min",
      likes: 156
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Handle scroll for carousel popup - show once after scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500 && !carouselShown && currentPage === 'home') {
        setShowCarouselPopup(true);
        setCarouselShown(true);
        // Auto hide after 5 seconds
        setTimeout(() => {
          setShowCarouselPopup(false);
        }, 5000);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [carouselShown, currentPage]);

  const filteredJournals = journals.filter(journal =>
    journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journal.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const latestJournals = journals.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const relatedJournals = selectedJournal 
    ? journals.filter(j => j.id !== selectedJournal.id && j.category === selectedJournal.category).slice(0, 3)
    : [];

  const handleContactSubmit = () => {
    // Handle contact form submission
    alert('Thank you for your message! We will get back to you soon.');
    setContactData({ name: '', email: '', subject: '', message: '' });
    setShowContactForm(false);
  };

  if (currentPage === 'journal' && selectedJournal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <nav className="bg-white/30 backdrop-blur-md shadow-lg border-b border-gray-200/30 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button 
              onClick={() => setCurrentPage('home')}
              className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              <BookOpen className="w-6 h-6" />
              <span className="font-semibold text-gray-800">Journal Library</span>
            </button>
            <button 
              onClick={() => setCurrentPage('home')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <article className="lg:col-span-3">
            <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-8 border border-gray-200/30">
              <div className="flex items-center space-x-4 mb-6">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-700 border border-cyan-500/30 rounded-full text-sm font-medium">
                  {selectedJournal.category}
                </span>
                <div className="flex items-center text-gray-600 text-sm space-x-4">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedJournal.date).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{selectedJournal.readTime}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{selectedJournal.likes}</span>
                  </span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">
                {selectedJournal.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {selectedJournal.description}
              </p>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedJournal.content}
                </p>
                
                {selectedJournal.sections && selectedJournal.sections.map((section: any) => (
                  <div key={section.id} className="mt-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                      {section.heading}
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="lg:col-span-1">
            <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-200/30">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Related Journals</h3>
              <div className="space-y-4">
                {relatedJournals.map(journal => (
                  <div 
                    key={journal.id}
                    onClick={() => setSelectedJournal(journal)}
                    className="group cursor-pointer p-4 rounded-lg hover:bg-gray-200/30 transition-colors border border-gray-200/30"
                  >
                    <h4 className="font-medium text-gray-800 group-hover:text-cyan-600 transition-colors mb-2 line-clamp-2">
                      {journal.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {journal.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{journal.readTime}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/30 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-gray-800">Journal Library</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowContactForm(true)}
              className="text-gray-600 hover:text-cyan-600 transition-colors font-medium"
            >
              Contact Us
            </button>
            <button 
              onClick={() => setCurrentPage('latest')}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
            >
              <BookOpen className="w-5 h-5" />
              <span>Latest Journals</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Discover Knowledge
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive collection of academic journals and research papers
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search journals, topics, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-300 bg-white/30 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Journals List (Changed from Grid to Linear List) */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="space-y-6">
          {filteredJournals.map(journal => (
            <div 
              key={journal.id}
              className="bg-white/30 backdrop-blur-sm border border-gray-300/30 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden group hover:scale-[1.02] hover:border-cyan-500/50 cursor-pointer"
              onClick={() => {
                setSelectedJournal(journal);
                setCurrentPage('journal');
              }}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-700 border border-cyan-500/30 rounded-full text-sm font-medium">
                      {journal.category}
                    </span>
                    <div className="flex items-center space-x-4 text-gray-600 text-sm">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(journal.date).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{journal.readTime}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{journal.likes}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-cyan-600 transition-colors">
                  {journal.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {journal.description}
                </p>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-cyan-600 font-medium">
                    <span>Read More</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timed Carousel Popup */}
      {showCarouselPopup && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-white/40 backdrop-blur-md border border-gray-300/30 rounded-2xl shadow-2xl p-4 max-w-sm transform transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Latest Journals</h4>
              <button
                onClick={() => setShowCarouselPopup(false)}
                className="p-1 hover:bg-gray-600/30 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-2 mb-3">
              {latestJournals.slice(0, 2).map(journal => (
                <div 
                  key={journal.id}
                  onClick={() => {
                    setSelectedJournal(journal);
                    setCurrentPage('journal');
                    setShowCarouselPopup(false);
                  }}
                  className="p-3 rounded-lg hover:bg-gray-200/30 cursor-pointer transition-colors"
                >
                  <h5 className="font-medium text-sm text-gray-800 line-clamp-1">
                    {journal.title}
                  </h5>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {journal.category} • {journal.readTime}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setCurrentPage('latest');
                setShowCarouselPopup(false);
              }}
              className="w-full text-center text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors"
            >
              View All Latest →
            </button>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Contact Us</h3>
              <button 
                onClick={() => setShowContactForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Contact Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h4>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Address</h5>
                      <p className="text-gray-600 text-sm">123 Research Avenue<br />Academic District, Knowledge City<br />AC 12345, United States</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Phone</h5>
                      <p className="text-gray-600 text-sm">+1 (555) 123-4567<br />Mon - Fri, 9:00 AM - 6:00 PM EST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Email</h5>
                      <p className="text-gray-600 text-sm">info@journallibrary.com<br />support@journallibrary.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Office Hours</h5>
                      <p className="text-gray-600 text-sm">Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end p-6 border-t border-gray-200">
              <button 
                onClick={() => setShowContactForm(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalLibrary;
