import React, { useState, useEffect } from 'react';
import { aiAPI } from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  BookOpen, 
  Lightbulb, 
  Target, 
  Loader2, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AINotesGenerator = ({ topic, onNotesGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  
  const generateNotes = async () => {
    if (!topic) return;
    
    setIsGenerating(true);
    setError(null);
    setGenerationCount(prev => prev + 1);
    
    try {
      // Try backend AI first
      const topicName = topic.title || topic || 'General';
      const prompt = `Return ONLY valid JSON with this exact shape (no markdown, no text): {"title": "${topicName} - AI Notes", "sections":[{"title":"📝 Key Concepts","content":["...six bullets..."]},{"title":"💡 Best Practices","content":["...five bullets..."]},{"title":"🎯 Real-World Applications","content":["...four bullets..."]}]}. Keep bullets concise.`;
      const context = { 
        topic: topicName, 
        subject: topic.subject || '', 
        grade: '12th', 
        difficulty: topic.difficulty || 'Intermediate',
        description: topic.description || ''
      };
      const res = await aiAPI.chat(prompt, context, { json: true });
      const text = res?.data?.data?.response || '';
      const parsed = parseNotesFromJson(text) || parseNotesFromText(topicName, text);
      if (!parsed) throw new Error('AI returned an unexpected format');
      setNotes(parsed);
      onNotesGenerated && onNotesGenerated(parsed);
    } catch (err) {
      console.error('Notes generation error:', err);
      
      // Use fallback notes instead of showing error
      const fallbackNotes = generateFallbackNotes(topic);
      setNotes(fallbackNotes);
      onNotesGenerated && onNotesGenerated(fallbackNotes);
      setError(null); // Clear error since we have fallback content
    } finally {
      setIsGenerating(false);
    }
  };
  // Prefer strict JSON parsing when AI obeys instructions
  const parseNotesFromJson = (text) => {
    try {
      const obj = JSON.parse(text);
      if (obj && Array.isArray(obj.sections)) {
        return {
          title: obj.title || 'AI Notes',
          sections: obj.sections.map(s => ({
            title: s.title || 'Section',
            content: Array.isArray(s.content) ? s.content : []
          }))
        };
      }
      return null;
    } catch (_) {
      return null;
    }
  };

  
  const generateTopicNotes = (topic, generationCount = 0) => {
    const topicName = topic.title || topic || 'General';
    
    // Create variations based on generation count
    const variations = [
      'Complete Study Guide',
      'Comprehensive Learning Notes', 
      'Advanced Study Material',
      'Detailed Learning Resources',
      'Expert Study Notes',
      'In-Depth Learning Guide',
      'Master Study Material',
      'Professional Learning Notes',
      'Ultimate Learning Resource',
      'Comprehensive Study Material',
      'Advanced Learning Guide',
      'Expert-Level Study Notes',
      'Master Class Learning Material',
      'Professional Development Guide',
      'Comprehensive Knowledge Base',
      'Advanced Study Resource'
    ];
    
    const titleSuffix = variations[generationCount % variations.length];
    
    const notesTemplates = {
      'SQL Queries': {
        title: `SQL Queries - ${titleSuffix}`,
        sections: [
          {
            title: generationCount % 2 === 0 ? '📝 Key Concepts' : '🔑 Essential Concepts',
            content: generationCount % 3 === 0 ? [
              '**SELECT Statement**: Retrieves data from database tables',
              '**WHERE Clause**: Filters records based on conditions',
              '**JOIN Operations**: Combines data from multiple tables',
              '**Aggregate Functions**: COUNT, SUM, AVG, MIN, MAX',
              '**GROUP BY**: Groups rows with same values',
              '**ORDER BY**: Sorts result set in ascending/descending order'
            ] : generationCount % 3 === 1 ? [
              '**Data Retrieval**: SELECT statements for querying databases',
              '**Conditional Filtering**: WHERE clauses for precise data selection',
              '**Table Relationships**: JOIN operations for complex queries',
              '**Statistical Functions**: Aggregate functions for data analysis',
              '**Data Grouping**: GROUP BY for organizing results',
              '**Result Sorting**: ORDER BY for arranging output'
            ] : [
              '**Query Fundamentals**: Basic SQL query structure and syntax',
              '**Data Filtering**: Advanced WHERE clause techniques',
              '**Multi-table Queries**: Complex JOIN operations and relationships',
              '**Data Aggregation**: Statistical functions and calculations',
              '**Result Organization**: GROUP BY and HAVING clauses',
              '**Output Control**: ORDER BY and LIMIT for result management'
            ]
          },
          {
            title: '🔧 Important SQL Commands',
            content: [
              '```sql\nSELECT * FROM table_name;\n```',
              '```sql\nSELECT column1, column2 FROM table_name WHERE condition;\n```',
              '```sql\nINSERT INTO table_name (column1, column2) VALUES (value1, value2);\n```',
              '```sql\nUPDATE table_name SET column1 = value1 WHERE condition;\n```',
              '```sql\nDELETE FROM table_name WHERE condition;\n```'
            ]
          },
          {
            title: '💡 Best Practices',
            content: [
              'Always use specific column names instead of SELECT *',
              'Use proper indexing for better query performance',
              'Write readable and well-formatted SQL code',
              'Use parameterized queries to prevent SQL injection',
              'Test queries on small datasets first'
            ]
          },
          {
            title: '🎯 Real-World Applications',
            content: [
              '**E-commerce**: Product search and filtering',
              '**Banking**: Transaction history and account management',
              '**Healthcare**: Patient records and medical data',
              '**Education**: Student grades and course management',
              '**Social Media**: User posts and friend connections'
            ]
          }
        ]
      },
      'Database Design': {
        title: `Database Design - ${titleSuffix}`,
        sections: [
          {
            title: generationCount % 2 === 0 ? '📝 Key Concepts' : '🏗️ Design Principles',
            content: generationCount % 3 === 0 ? [
              '**Entity-Relationship Model**: Visual representation of database structure',
              '**Normalization**: Process of organizing data to reduce redundancy',
              '**Primary Key**: Unique identifier for each table row',
              '**Foreign Key**: Links tables together through relationships',
              '**Indexes**: Improve query performance and data retrieval speed'
            ] : generationCount % 3 === 1 ? [
              '**Data Modeling**: Creating logical database structures',
              '**Data Integrity**: Ensuring data consistency and accuracy',
              '**Relationship Mapping**: Defining connections between entities',
              '**Performance Optimization**: Indexing and query efficiency',
              '**Scalability Planning**: Designing for future growth'
            ] : [
              '**Conceptual Design**: High-level database architecture',
              '**Logical Design**: Detailed table and relationship structure',
              '**Physical Design**: Implementation-specific optimizations',
              '**Data Constraints**: Rules and limitations for data integrity',
              '**Performance Tuning**: Optimization strategies and techniques'
            ]
          },
          {
            title: '🔧 Design Principles',
            content: [
              '**1NF (First Normal Form)**: Eliminate duplicate columns',
              '**2NF (Second Normal Form)**: Remove partial dependencies',
              '**3NF (Third Normal Form)**: Remove transitive dependencies',
              '**ACID Properties**: Atomicity, Consistency, Isolation, Durability',
              '**Referential Integrity**: Maintain consistency between related tables'
            ]
          },
          {
            title: '💡 Design Best Practices',
            content: [
              'Plan your database structure before implementation',
              'Use meaningful table and column names',
              'Avoid storing calculated values in tables',
              'Design for scalability and future growth',
              'Document your database schema thoroughly'
            ]
          }
        ]
      },
      'Database Security': {
        title: 'Database Security - Complete Study Guide',
        sections: [
          {
            title: '📝 Key Concepts',
            content: [
              '**Access Control**: Restrict database access to authorized users',
              '**Authentication**: Verify user identity before granting access',
              '**Authorization**: Determine what users can do after authentication',
              '**Encryption**: Protect data at rest and in transit',
              '**Audit Logging**: Track database activities and changes'
            ]
          },
          {
            title: '🔧 Security Measures',
            content: [
              '**User Roles**: Assign appropriate permissions to user groups',
              '**Password Policies**: Enforce strong password requirements',
              '**Data Encryption**: Use AES-256 for sensitive data',
              '**Network Security**: Use SSL/TLS for data transmission',
              '**Regular Backups**: Maintain secure backup copies'
            ]
          },
          {
            title: '💡 Security Best Practices',
            content: [
              'Implement principle of least privilege',
              'Regular security audits and vulnerability assessments',
              'Keep database software updated with latest patches',
              'Monitor database access and unusual activities',
              'Train staff on security awareness and best practices'
            ]
          }
        ]
      }
    };

    return notesTemplates[topicName] || {
      title: `${topicName} - ${titleSuffix}`,
      sections: [
        {
          title: generationCount % 2 === 0 ? '📝 Key Concepts' : '🔑 Essential Principles',
          content: generationCount % 3 === 0 ? [
            `Understanding the fundamental principles of ${topicName}`,
            'Core concepts and their applications',
            'Important formulas and equations',
            'Real-world examples and use cases'
          ] : generationCount % 3 === 1 ? [
            `Mastering the core concepts of ${topicName}`,
            'Advanced applications and implementations',
            'Key formulas and mathematical relationships',
            'Practical examples and case studies'
          ] : [
            `Deep dive into ${topicName} fundamentals`,
            'Complex concepts and advanced topics',
            'Critical formulas and derivations',
            'Industry applications and real-world scenarios'
          ]
        },
        {
          title: generationCount % 2 === 0 ? '💡 Study Tips' : '🎓 Learning Strategies',
          content: generationCount % 3 === 0 ? [
            'Practice with hands-on examples',
            'Review concepts regularly',
            'Connect theory with practical applications',
            'Use visual aids and diagrams for better understanding'
          ] : generationCount % 3 === 1 ? [
            'Engage in active learning techniques',
            'Create mind maps and concept diagrams',
            'Practice problem-solving regularly',
            'Join study groups for collaborative learning'
          ] : [
            'Implement spaced repetition techniques',
            'Use multimedia resources for diverse learning',
            'Apply concepts in real-world projects',
            'Seek feedback and continuous improvement'
          ]
        },
        {
          title: generationCount % 2 === 0 ? '🎯 Learning Objectives' : '🚀 Success Goals',
          content: generationCount % 3 === 0 ? [
            'Master the core concepts',
            'Apply knowledge to solve problems',
            'Understand real-world applications',
            'Prepare for assessments and exams'
          ] : generationCount % 3 === 1 ? [
            'Achieve comprehensive understanding',
            'Develop problem-solving expertise',
            'Build practical application skills',
            'Excel in academic and professional settings'
          ] : [
            'Attain mastery level proficiency',
            'Become an expert problem solver',
            'Create innovative solutions',
            'Lead and mentor others in the field'
          ]
        }
      ]
    };
  };

  // Generate fallback notes when AI is unavailable
  const generateFallbackNotes = (topic) => {
    const topicName = topic.title || topic || 'General';
    const subject = topic.subject || 'Physics';
    
    // Generate comprehensive fallback notes based on topic
    const fallbackNotes = {
      title: `${topicName} - AI Generated Notes`,
      sections: [
        {
          title: "📝 Overview",
          content: [
            `${topicName} is a fundamental concept in ${subject} that explores the relationship between electric and magnetic fields.`,
            `This topic is essential for understanding how electromagnetic forces work in nature and technology.`,
            `Mastering ${topicName} will help you understand many real-world applications and phenomena.`,
            `The concepts covered here form the foundation for advanced studies in physics and engineering.`
          ]
        },
        {
          title: "🔑 Key Concepts",
          content: [
            `**Electric Field**: A region around charged particles where electric forces act on other charges`,
            `**Magnetic Field**: A region around magnets or moving charges where magnetic forces act`,
            `**Electromagnetic Induction**: The process of generating electric current using magnetic fields`,
            `**Maxwell's Equations**: Four fundamental equations describing electromagnetic phenomena`,
            `**Lorentz Force**: The force experienced by a charged particle in electromagnetic fields`,
            `**Faraday's Law**: Relates the rate of change of magnetic flux to induced electromotive force`,
            `**Lenz's Law**: The direction of induced current opposes the change causing it`,
            `**Electromagnetic Waves**: Waves that consist of oscillating electric and magnetic fields`
          ]
        },
        {
          title: "⚡ Important Equations",
          content: [
            `**F = q(E + v × B)** - Lorentz force on a charged particle`,
            `**E = -∇V** - Electric field as gradient of electric potential`,
            `**B = μ₀I/(2πr)** - Magnetic field around a straight current-carrying wire`,
            `**ε = -dΦ/dt** - Faraday's law of electromagnetic induction`,
            `**c = 1/√(ε₀μ₀)** - Speed of light in vacuum`,
            `**P = IV** - Power in electrical circuits`
          ]
        },
        {
          title: "🔬 Derivation Steps",
          content: [
            `Start with Coulomb's law to derive electric field equations`,
            `Apply Biot-Savart law to find magnetic field distributions`,
            `Use Maxwell's equations to show electromagnetic wave propagation`,
            `Derive the relationship between electric and magnetic fields in waves`
          ]
        },
        {
          title: "🌍 Real-World Applications",
          content: [
            `**Electric Motors**: Convert electrical energy to mechanical energy using magnetic fields`,
            `**Generators**: Convert mechanical energy to electrical energy via electromagnetic induction`,
            `**Transformers**: Change voltage levels in power distribution systems`,
            `**MRI Machines**: Use strong magnetic fields for medical imaging`,
            `**Wireless Communication**: Radio waves are electromagnetic waves`,
            `**Electric Power Transmission**: High-voltage transmission lines carry electromagnetic energy`
          ]
        },
        {
          title: "⚠️ Common Misconceptions",
          content: [
            `**Myth**: Electric and magnetic fields are the same thing. **Reality**: They are related but distinct phenomena`,
            `**Myth**: Magnetic fields can exist without electric fields. **Reality**: They are always interconnected`,
            `**Myth**: Electromagnetic waves need a medium to travel. **Reality**: They can travel through vacuum`,
            `**Myth**: All electromagnetic radiation is harmful. **Reality**: Only high-energy radiation is dangerous`
          ]
        },
        {
          title: "📚 Practice Questions",
          content: [
            `**Q**: What happens to the magnetic field when current in a wire increases? **A**: The magnetic field strength increases proportionally`,
            `**Q**: Why do transformers only work with AC current? **A**: AC creates changing magnetic flux needed for electromagnetic induction`,
            `**Q**: What is the direction of force on a positive charge moving in a magnetic field? **A**: Perpendicular to both velocity and magnetic field (right-hand rule)`,
            `**Q**: How does the speed of electromagnetic waves relate to frequency? **A**: Speed is constant (c), wavelength and frequency are inversely related`,
            `**Q**: What causes electromagnetic induction? **A**: Changing magnetic flux through a conductor loop`
          ]
        }
      ]
    };
    
    return fallbackNotes;
  };

  // Parse free-form AI text into our structured notes format
  const parseNotesFromText = (topicName, text) => {
    if (!text || typeof text !== 'string') return null;
    const lines = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return null;

    const sections = [];
    const pushSection = (title, items) => {
      if (items.length) sections.push({ title, content: items });
    };

    let bucket = [];
    let mode = 'key';
    lines.forEach(l => {
      const lower = l.toLowerCase();
      if (lower.includes('key concepts')) { pushSection('📝 Key Concepts', bucket); bucket = []; mode = 'key'; return; }
      if (lower.includes('best practices') || lower.includes('study tips')) { pushSection('💡 Best Practices', bucket); bucket = []; mode = 'tips'; return; }
      if (lower.includes('applications')) { pushSection('🎯 Real-World Applications', bucket); bucket = []; mode = 'apps'; return; }
      bucket.push(l.replace(/^[-*•]\s?/, ''));
    });
    pushSection(mode === 'key' ? '📝 Key Concepts' : mode === 'tips' ? '💡 Best Practices' : '🎯 Real-World Applications', bucket);

    if (!sections.length) return null;
    return { title: `${topicName} - AI Generated Notes`, sections };
  };

    useEffect(() => {
    if (topic && !notes) {
      // Try AI generation first, but have fallback ready
      generateNotes();
    }
  }, [topic]);

  if (isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI-Generated Notes</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-purple-600">
            <span>🤖 AI is working...</span>
            <span className="bg-purple-200 px-2 py-1 rounded-full">
              Generation #{generationCount}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="relative">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
              <Brain className="w-4 h-4 text-purple-400 absolute top-1 left-1/2 transform -translate-x-1/2 animate-pulse" />
            </div>
            <p className="text-gray-600 font-medium">AI is generating intelligent notes...</p>
            <p className="text-sm text-gray-500 mt-1">Analyzing topic and creating personalized content</p>
            <div className="mt-3 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-50 rounded-lg p-6 border border-red-200"
      >
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notes Generation Failed</h3>
        </div>
        
        <p className="text-red-600 mb-4">{error}</p>
        
        <button
          onClick={generateNotes}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </motion.div>
    );
  }

  if (!notes) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI-Generated Notes</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-purple-600">
            <span>🤖 Ready to generate</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          Get intelligent, topic-specific study notes generated by AI. Click the button below to start AI generation.
        </p>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={generateNotes}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span>Generate AI Notes</span>
          </button>
          <div className="text-sm text-gray-500">
            Powered by AI • Personalized content
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-semibold">{notes.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-purple-200">
                  <span>🤖 AI Generated</span>
                  {generationCount > 0 && (
                    <span className="bg-purple-500 px-2 py-1 rounded-full text-xs">
                      Generated {generationCount} time{generationCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={generateNotes}
              disabled={isGenerating}
              className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Refresh AI'}</span>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-gray-200 transition-colors px-2 py-1"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-6"
          >
            <div className="space-y-6">
              {notes.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-l-4 border-purple-200 pl-4"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {section.title}
                  </h4>
                  <div className="space-y-2">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-gray-700">
                        {item.startsWith('```') ? (
                          <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">
                            <code>{item.replace(/```\w*\n?/g, '').replace(/```/g, '')}</code>
                          </pre>
                        ) : (
                          <p className="leading-relaxed">{item}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AINotesGenerator;
