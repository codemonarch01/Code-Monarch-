// Mock data for the e-learning platform

export const classes = [
  {
    id: '11th',
    name: '11th Grade',
    description: 'Foundation level science and mathematics',
    icon: '🎓',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: '12th',
    name: '12th Grade',
    description: 'Advanced level preparation for competitive exams',
    icon: '📚',
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 'btech',
    name: 'B.Tech',
    description: 'Engineering fundamentals and advanced concepts',
    icon: '⚙️',
    color: 'from-orange-500 to-red-600'
  }
];

export const subjects = {
  '11th': [
    {
      id: 'physics-11',
      name: 'Physics',
      description: 'Mechanics, Thermodynamics, and Waves',
      icon: '⚛️',
      color: 'from-blue-400 to-blue-600',
      topics: 15
    },
    {
      id: 'chemistry-11',
      name: 'Chemistry',
      description: 'Organic, Inorganic, and Physical Chemistry',
      icon: '🧪',
      color: 'from-green-400 to-green-600',
      topics: 12
    },
    {
      id: 'math-11',
      name: 'Mathematics',
      description: 'Algebra, Trigonometry, and Coordinate Geometry',
      icon: '📐',
      color: 'from-purple-400 to-purple-600',
      topics: 18
    },
    {
      id: 'biology-11',
      name: 'Biology',
      description: 'Cell Biology, Genetics, and Ecology',
      icon: '🧬',
      color: 'from-emerald-400 to-emerald-600',
      topics: 14
    }
  ],
  '12th': [
    {
      id: 'physics-12',
      name: 'Physics',
      description: 'Electromagnetism, Optics, and Modern Physics',
      icon: '⚛️',
      color: 'from-blue-400 to-blue-600',
      topics: 16
    },
    {
      id: 'chemistry-12',
      name: 'Chemistry',
      description: 'Advanced Organic and Physical Chemistry',
      icon: '🧪',
      color: 'from-green-400 to-green-600',
      topics: 14
    },
    {
      id: 'math-12',
      name: 'Mathematics',
      description: 'Calculus, Vectors, and Probability',
      icon: '📐',
      color: 'from-purple-400 to-purple-600',
      topics: 20
    },
    {
      id: 'cs-12',
      name: 'Computer Science',
      description: 'Programming, Data Structures, and Algorithms',
      icon: '💻',
      color: 'from-indigo-400 to-indigo-600',
      topics: 12
    }
  ],
  'btech': [
    {
      id: 'dsa',
      name: 'Data Structures & Algorithms',
      description: 'Arrays, Trees, Graphs, and Algorithm Design',
      icon: '🌳',
      color: 'from-cyan-400 to-cyan-600',
      topics: 25
    },
    {
      id: 'dbms',
      name: 'Database Management',
      description: 'SQL, NoSQL, and Database Design',
      icon: '🗄️',
      color: 'from-yellow-400 to-yellow-600',
      topics: 18
    },
    {
      id: 'os',
      name: 'Operating Systems',
      description: 'Process Management, Memory, and File Systems',
      icon: '🖥️',
      color: 'from-red-400 to-red-600',
      topics: 22
    },
    {
      id: 'networks',
      name: 'Computer Networks',
      description: 'TCP/IP, Routing, and Network Security',
      icon: '🌐',
      color: 'from-teal-400 to-teal-600',
      topics: 16
    }
  ]
};

export const topics = {
  'physics-11': [
    {
      id: 'mechanics-1',
      name: 'Laws of Motion',
      description: 'Newton\'s laws and their applications',
      duration: '45 min',
      difficulty: 'Beginner'
    },
    {
      id: 'mechanics-2',
      name: 'Work, Energy & Power',
      description: 'Conservation of energy and work-energy theorem',
      duration: '50 min',
      difficulty: 'Intermediate'
    },
    {
      id: 'waves-1',
      name: 'Wave Motion',
      description: 'Types of waves and wave properties',
      duration: '40 min',
      difficulty: 'Beginner'
    }
  ],
  'chemistry-11': [
    {
      id: 'organic-1',
      name: 'Hydrocarbons',
      description: 'Alkanes, alkenes, and alkynes',
      duration: '55 min',
      difficulty: 'Intermediate'
    },
    {
      id: 'inorganic-1',
      name: 'Periodic Table',
      description: 'Trends and properties of elements',
      duration: '60 min',
      difficulty: 'Beginner'
    },
    {
      id: 'molecular-structures',
      name: 'Molecular Structures in 3D',
      description: 'Visualizing geometry and bonding using 3D models',
      duration: '42 min',
      difficulty: 'Intermediate'
    }
  ],
  'math-11': [
    {
      id: 'algebra-1',
      name: 'Quadratic Equations',
      description: 'Solving and graphing quadratic functions',
      duration: '45 min',
      difficulty: 'Intermediate'
    },
    {
      id: 'trigonometry-1',
      name: 'Trigonometric Functions',
      description: 'Sin, cos, tan and their properties',
      duration: '50 min',
      difficulty: 'Beginner'
    }
  ],
  'dsa': [
    {
      id: 'arrays-1',
      name: 'Array Fundamentals',
      description: 'Basic operations and time complexity',
      duration: '60 min',
      difficulty: 'Beginner'
    },
    {
      id: 'trees-1',
      name: 'Binary Trees',
      description: 'Tree traversals and basic operations',
      duration: '75 min',
      difficulty: 'Intermediate'
    },
    {
      id: 'graphs-1',
      name: 'Graph Algorithms',
      description: 'BFS, DFS, and shortest path algorithms',
      duration: '90 min',
      difficulty: 'Advanced'
    }
  ]
};

export const topicContent = {
  'mechanics-1': {
    videoUrl: 'https://www.youtube.com/embed/2m5M9XK4C6A',
    notes: `
# Newton's Laws of Motion

## First Law (Law of Inertia)
An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.

## Second Law
The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.

**Formula:** F = ma

Where:
- F = Force (Newtons)
- m = Mass (kg)
- a = Acceleration (m/s²)

## Third Law
For every action, there is an equal and opposite reaction.

## Key Points
- Forces always occur in pairs
- Net force determines acceleration
- Mass is a measure of inertia
- Weight = mg (where g = 9.8 m/s²)

## Applications
- Vehicle safety systems
- Rocket propulsion
- Sports mechanics
- Engineering design
    `
  },
  'molecular-structures': {
    videoUrl: 'https://www.youtube.com/embed/TMubSggUOVE',
    notes: `
# Molecular Structures in 3D

## VSEPR Basics
Electron pairs repel and arrange themselves to minimize repulsion, giving rise to characteristic molecular shapes.

## Common Geometries
- Linear (CO2)
- Trigonal Planar (BF3)
- Tetrahedral (CH4)
- Trigonal Bipyramidal (PCl5)
- Octahedral (SF6)

## Hybridization
- sp, sp2, sp3 explain observed bond angles and geometry.

## Practice
Rotate the 3D model, identify bond angles, and predict geometry from formula.
    `
  },
  'arrays-1': {
    videoUrl: 'https://www.youtube.com/embed/Po3VwR2ZB0Y',
    notes: `
# Array Fundamentals

## What is an Array?
An array is a collection of elements stored in contiguous memory locations. Each element can be accessed using an index.

## Key Characteristics
- **Fixed Size**: Size is determined at creation
- **Homogeneous**: All elements are of the same data type
- **Indexed**: Elements accessed via zero-based indexing

## Time Complexities
- **Access**: O(1) - Direct access via index
- **Search**: O(n) - Linear search through elements
- **Insertion**: O(n) - May require shifting elements
- **Deletion**: O(n) - May require shifting elements

## Common Operations
\`\`\`python
# Creating an array
arr = [1, 2, 3, 4, 5]

# Accessing elements
first = arr[0]  # O(1)

# Searching for an element
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
\`\`\`

## Applications
- Storing collections of data
- Implementing other data structures
- Mathematical computations
- Image processing
    `
  }
};
