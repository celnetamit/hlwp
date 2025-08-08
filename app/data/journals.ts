export interface Journal {
  id: number
  title: string
  description: string
  content: string
  category: string
  date: string
  dateModified?: string
  readTime: string
  likes: number
  authors?: { name: string; affiliation?: string }[]
  volume?: string
  issue?: string
  firstPage?: string
  lastPage?: string
  doi?: string
  keywords?: string[]
  sections?: { id: string; heading: string; content: string }[]
}

export const journals: Journal[] = [
  {
    id: 1,
    title: "Advances in Machine Learning and Neural Networks",
    description: "This comprehensive journal explores cutting-edge developments in artificial intelligence, focusing on deep learning architectures, neural network optimization, and real-world applications across various industries.",
    content: "Machine learning has revolutionized the way we approach complex problems across numerous domains. Recent advances in neural network architectures have led to breakthrough performance in tasks ranging from computer vision to natural language processing. This journal examines the latest developments in convolutional neural networks, transformer architectures, and generative adversarial networks. We explore optimization techniques such as attention mechanisms, batch normalization, and dropout regularization that have become fundamental to modern deep learning systems. The practical applications discussed include autonomous vehicles, medical diagnosis, financial modeling, and scientific research.",
    category: "Technology",
    date: "2024-01-15",
    dateModified: "2024-01-20",
    readTime: "12 min",
    likes: 234,
    authors: [
      { name: "Dr. Sarah Chen", affiliation: "MIT AI Laboratory" },
      { name: "Prof. Michael Rodriguez", affiliation: "Stanford University" }
    ],
    volume: "15",
    issue: "3",
    firstPage: "45",
    lastPage: "72",
    doi: "10.12345/jl.ml.2024.001",
    keywords: ["machine learning", "neural networks", "deep learning", "AI", "artificial intelligence"],
    sections: [
      {
        id: "introduction",
        heading: "Introduction to Modern Neural Architectures",
        content: "The field of machine learning has witnessed unprecedented growth in recent years, driven primarily by advances in neural network architectures and computational capabilities."
      },
      {
        id: "methodology",
        heading: "Optimization Techniques and Best Practices",
        content: "Modern neural networks rely on sophisticated optimization techniques to achieve state-of-the-art performance across various domains."
      }
    ]
  },
  {
    id: 2,
    title: "Climate Change and Environmental Sustainability",
    description: "An in-depth analysis of current climate trends, environmental policies, and sustainable practices that can help mitigate the effects of global warming and preserve our planet for future generations.",
    content: "Climate change represents one of the most pressing challenges of our time, requiring immediate and sustained action across all sectors of society. This journal examines the latest scientific evidence regarding global temperature trends, sea level rise, and extreme weather patterns. We analyze the effectiveness of international climate agreements, carbon pricing mechanisms, and renewable energy adoption rates. The discussion includes innovative technologies such as carbon capture and storage, green hydrogen production, and sustainable agriculture practices that can significantly reduce greenhouse gas emissions.",
    category: "Environment",
    date: "2024-01-20",
    dateModified: "2024-01-25",
    readTime: "15 min",
    likes: 189,
    authors: [
      { name: "Dr. Emily Watson", affiliation: "Harvard Environmental Institute" },
      { name: "Prof. James Thompson", affiliation: "University of California Berkeley" }
    ],
    volume: "8",
    issue: "2",
    firstPage: "15",
    lastPage: "34",
    doi: "10.12345/jl.env.2024.002",
    keywords: ["climate change", "environmental sustainability", "global warming", "renewable energy", "carbon emissions"]
  },
  {
    id: 3,
    title: "Modern Psychology and Mental Health Research",
    description: "Exploring recent breakthroughs in psychological research, including new therapeutic approaches, cognitive behavioral studies, and the intersection of technology with mental health treatment.",
    content: "The field of psychology continues to evolve with new insights into human behavior, cognition, and mental health treatment approaches. This journal reviews recent studies in cognitive behavioral therapy, mindfulness-based interventions, and digital mental health solutions. We examine the neurobiological basis of mental health disorders, including depression, anxiety, and PTSD, while discussing innovative treatment modalities such as virtual reality therapy, AI-assisted counseling, and personalized medicine approaches to psychiatric care.",
    category: "Psychology",
    date: "2024-01-25",
    dateModified: "2024-01-30",
    readTime: "10 min",
    likes: 156,
    authors: [
      { name: "Dr. Lisa Martinez", affiliation: "Johns Hopkins School of Medicine" },
      { name: "Prof. David Kim", affiliation: "Yale University" }
    ],
    volume: "22",
    issue: "1",
    firstPage: "78",
    lastPage: "95",
    doi: "10.12345/jl.psych.2024.003",
    keywords: ["psychology", "mental health", "cognitive behavioral therapy", "neurobiology", "digital therapy"]
  }
]