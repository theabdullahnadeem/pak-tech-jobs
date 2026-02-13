export interface Course {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  duration: string;
  skills: string[];
  whyLearn: string;
  content: string;
  courseraLink: string;
  udemyLink: string;
  whatsappLink: string;
}

const WHATSAPP_NUMBER = "923161404891"; // Replace with actual WhatsApp number
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

export const courses: Course[] = [
  {
    slug: "mern-stack-development",
    title: "MERN Stack Web Development — Complete Course",
    shortTitle: "MERN Stack Development",
    description: "Master MongoDB, Express.js, React.js, and Node.js to build full-stack web applications from scratch.",
    icon: "🌐",
    category: "Web Development",
    difficulty: "Beginner to Advanced",
    duration: "12–16 weeks",
    skills: ["MongoDB", "Express.js", "React.js", "Node.js", "TypeScript", "REST APIs", "Redux", "Next.js"],
    whyLearn: "MERN stack is the most in-demand web development stack in Pakistan. Companies from startups to enterprises actively seek MERN developers, offering salaries from PKR 50,000 to PKR 400,000+ per month.",
    content: `
## What You'll Learn

This comprehensive MERN stack course takes you from zero to full-stack developer. You'll learn how to build production-ready web applications using JavaScript/TypeScript across the entire stack.

### Module 1: Frontend with React.js
- Components, JSX, Props, and State
- React Hooks (useState, useEffect, useContext)
- React Router for navigation
- State management with Redux Toolkit
- Styling with Tailwind CSS

### Module 2: Backend with Node.js & Express
- Node.js fundamentals and npm ecosystem
- Express.js routing and middleware
- RESTful API design patterns
- JWT authentication and authorization
- Input validation and error handling

### Module 3: Database with MongoDB
- MongoDB CRUD operations
- Mongoose ODM and schema design
- Aggregation pipelines
- Indexing and query optimization

### Module 4: Full-Stack Integration
- Connecting React frontend to Express API
- File uploads and image handling
- Real-time features with Socket.io
- Deployment to Vercel and Railway

### Module 5: Advanced Topics
- Next.js for server-side rendering
- TypeScript for type safety
- Testing with Jest and React Testing Library
- CI/CD with GitHub Actions

## Career Outcomes

After completing this course, you'll be able to:
- Build and deploy full-stack MERN applications
- Apply for junior to mid-level developer positions
- Freelance on platforms like Upwork and Fiverr
- Expected starting salary: PKR 50,000–80,000/month
    `,
    courseraLink: "https://www.coursera.org/specializations/full-stack-react",
    udemyLink: "https://www.udemy.com/course/mern-stack-front-to-back/",
    whatsappLink: `${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I'm interested in the MERN Stack Development in-person training. Can you share more details?")}`,
  },
  {
    slug: "python-ai-machine-learning",
    title: "Python for AI & Machine Learning — Complete Guide",
    shortTitle: "AI & Machine Learning",
    description: "Learn Python, data science fundamentals, and build AI/ML models from scratch. Master TensorFlow, PyTorch, and LLMs.",
    icon: "🤖",
    category: "AI & Data Science",
    difficulty: "Intermediate",
    duration: "14–20 weeks",
    skills: ["Python", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "NLP", "Computer Vision", "LLMs"],
    whyLearn: "AI and Machine Learning engineers are the highest-paid tech professionals in Pakistan, with senior roles commanding PKR 300,000–700,000+ per month. The global demand for AI talent continues to skyrocket.",
    content: `
## What You'll Learn

This course covers the complete AI/ML journey — from Python basics to deploying production ML models.

### Module 1: Python Foundations
- Python programming essentials
- Data structures and algorithms
- Object-oriented programming
- NumPy and Pandas for data manipulation

### Module 2: Mathematics for ML
- Linear algebra essentials
- Probability and statistics
- Calculus fundamentals
- Optimization techniques

### Module 3: Machine Learning
- Supervised learning (regression, classification)
- Unsupervised learning (clustering, dimensionality reduction)
- Feature engineering and selection
- Model evaluation and cross-validation
- Scikit-learn practical projects

### Module 4: Deep Learning
- Neural network fundamentals
- CNNs for computer vision
- RNNs and LSTMs for sequences
- Transfer learning
- TensorFlow and PyTorch implementations

### Module 5: Generative AI & LLMs
- Transformer architecture
- Working with OpenAI, Gemini APIs
- LangChain for LLM applications
- RAG (Retrieval-Augmented Generation)
- Fine-tuning pre-trained models

### Module 6: MLOps & Deployment
- Model serving with FastAPI
- Docker containers for ML
- Cloud deployment (AWS SageMaker, GCP)
- Model monitoring and retraining

## Career Outcomes

- Build and deploy production ML models
- Work as an AI/ML engineer or data scientist
- Expected salary: PKR 80,000–500,000+/month depending on experience
    `,
    courseraLink: "https://www.coursera.org/specializations/machine-learning-introduction",
    udemyLink: "https://www.udemy.com/course/machinelearning/",
    whatsappLink: `${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I'm interested in the AI & Machine Learning in-person training. Can you share more details?")}`,
  },
  {
    slug: "react-native-mobile-development",
    title: "React Native Mobile App Development",
    shortTitle: "React Native Mobile",
    description: "Build cross-platform iOS and Android apps using React Native. One codebase, two platforms.",
    icon: "📱",
    category: "Mobile Development",
    difficulty: "Intermediate",
    duration: "10–14 weeks",
    skills: ["React Native", "JavaScript", "TypeScript", "Expo", "Redux", "Navigation", "Native Modules", "App Store Deployment"],
    whyLearn: "Mobile developers are in huge demand in Pakistan. Companies need cross-platform apps and React Native lets you build for both iOS and Android. Salaries range from PKR 60,000 to PKR 400,000+ per month.",
    content: `
## What You'll Learn

Build professional mobile applications for iOS and Android using React Native and Expo.

### Module 1: React Native Fundamentals
- Setting up the development environment
- Core components (View, Text, Image, ScrollView)
- Styling with StyleSheet and Flexbox
- Handling user input and gestures

### Module 2: Navigation & State
- React Navigation (Stack, Tab, Drawer)
- State management with Redux Toolkit
- AsyncStorage for local data
- Context API patterns

### Module 3: API Integration
- Fetching data with Axios/fetch
- Authentication flows (login, signup, token refresh)
- Push notifications
- Real-time features with WebSockets

### Module 4: Advanced Features
- Camera and image picker
- Maps and location services
- Animations with Reanimated
- Custom native modules
- Offline-first architecture

### Module 5: Deployment
- App Store (iOS) submission
- Google Play Store submission
- Over-the-air updates with EAS
- CI/CD for mobile apps

## Career Outcomes

- Build and publish mobile apps to both stores
- Freelance mobile development projects
- Expected salary: PKR 60,000–350,000+/month
    `,
    courseraLink: "https://www.coursera.org/professional-certificates/meta-react-native-developer",
    udemyLink: "https://www.udemy.com/course/the-complete-react-native-and-redux-course/",
    whatsappLink: `${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I'm interested in the React Native Mobile Development in-person training. Can you share more details?")}`,
  },
  {
    slug: "devops-cloud-engineering",
    title: "DevOps & Cloud Engineering — AWS, Docker, Kubernetes",
    shortTitle: "DevOps & Cloud",
    description: "Master cloud infrastructure, containerization, CI/CD pipelines, and site reliability engineering with AWS.",
    icon: "☁️",
    category: "DevOps & Cloud",
    difficulty: "Intermediate to Advanced",
    duration: "12–16 weeks",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions", "Linux", "Monitoring", "CI/CD"],
    whyLearn: "DevOps engineers are among the highest-paid in Pakistan's tech industry. As companies migrate to cloud, the demand for cloud/DevOps professionals continues to grow exponentially.",
    content: `
## What You'll Learn

Become a DevOps and cloud engineering professional capable of managing production infrastructure at scale.

### Module 1: Linux & Networking
- Linux administration essentials
- Shell scripting (Bash)
- Networking fundamentals (DNS, TCP/IP, HTTP)
- SSH, firewalls, and security basics

### Module 2: Containerization with Docker
- Docker fundamentals and Dockerfiles
- Multi-container apps with Docker Compose
- Image optimization and security scanning
- Registry management (DockerHub, ECR)

### Module 3: Orchestration with Kubernetes
- Kubernetes architecture
- Pods, Deployments, Services, Ingress
- Helm charts for package management
- Scaling and auto-scaling strategies

### Module 4: Cloud with AWS
- EC2, S3, RDS, Lambda
- VPC and networking
- IAM and security best practices
- CloudFormation and CDK

### Module 5: Infrastructure as Code
- Terraform for multi-cloud IaC
- Ansible for configuration management
- GitOps workflows
- State management and modules

### Module 6: CI/CD & Monitoring
- GitHub Actions and Jenkins pipelines
- Automated testing in pipelines
- Prometheus and Grafana monitoring
- ELK stack for logging
- Incident response and SRE practices

## Career Outcomes

- Manage production cloud infrastructure
- Build CI/CD pipelines for development teams
- Expected salary: PKR 80,000–550,000+/month
    `,
    courseraLink: "https://www.coursera.org/professional-certificates/aws-cloud-solutions-architect",
    udemyLink: "https://www.udemy.com/course/learn-devops-the-complete-kubernetes-course/",
    whatsappLink: `${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I'm interested in the DevOps & Cloud Engineering in-person training. Can you share more details?")}`,
  },
  {
    slug: "digital-marketing-seo",
    title: "Digital Marketing & SEO Mastery",
    shortTitle: "Digital Marketing & SEO",
    description: "Learn search engine optimization, social media marketing, Google Ads, and content strategy to grow businesses online.",
    icon: "📈",
    category: "Digital Marketing",
    difficulty: "Beginner",
    duration: "8–12 weeks",
    skills: ["SEO", "Google Ads", "Social Media Marketing", "Content Strategy", "Analytics", "Email Marketing", "Copywriting"],
    whyLearn: "Every business needs a digital presence. Digital marketing skills let you work as a freelancer, start your own agency, or join any company's marketing team. It's one of the most accessible tech-adjacent careers.",
    content: `
## What You'll Learn

Master the complete digital marketing toolkit — from SEO to paid ads to social media strategy.

### Module 1: SEO Fundamentals
- How search engines work
- Keyword research and analysis
- On-page SEO (title tags, meta descriptions, headers)
- Technical SEO (site speed, schema, sitemap)
- Link building strategies

### Module 2: Content Marketing
- Content strategy and planning
- Blog writing and copywriting
- Video content creation
- Content distribution channels

### Module 3: Social Media Marketing
- Platform strategies (LinkedIn, Instagram, Facebook, TikTok)
- Content calendars and scheduling
- Community building and engagement
- Influencer marketing basics

### Module 4: Paid Advertising
- Google Ads (Search, Display, YouTube)
- Facebook/Instagram Ads
- Budget management and ROI tracking
- A/B testing and optimization

### Module 5: Analytics & Reporting
- Google Analytics 4 setup and tracking
- Conversion tracking and funnels
- Monthly reporting dashboards
- Data-driven decision making

## Career Outcomes

- Run marketing campaigns for businesses
- Start your own digital marketing agency
- Freelance on content writing and SEO
- Expected earnings: PKR 40,000–300,000+/month
    `,
    courseraLink: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce",
    udemyLink: "https://www.udemy.com/course/complete-digital-marketing-course/",
    whatsappLink: `${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I'm interested in the Digital Marketing & SEO in-person training. Can you share more details?")}`,
  },
  {
    slug: "ui-ux-design-figma",
    title: "UI/UX Design with Figma — Complete Course",
    shortTitle: "UI/UX Design (Figma)",
    description: "Learn user interface and experience design using Figma. Create stunning, user-friendly designs for web and mobile apps.",
    icon: "🎨",
    category: "Design",
    difficulty: "Beginner",
    duration: "8–10 weeks",
    skills: ["Figma", "UI Design", "UX Research", "Wireframing", "Prototyping", "Design Systems", "User Testing"],
    whyLearn: "Good design is what separates successful products from failures. UI/UX designers are essential for every tech company, and the demand in Pakistan is growing rapidly with salaries ranging from PKR 50,000 to PKR 300,000+.",
    content: `
## What You'll Learn

Master the complete UI/UX design process using Figma — from research to polished, developer-ready designs.

### Module 1: UX Fundamentals
- User research methodologies
- Creating user personas and journeys
- Information architecture
- Usability principles and heuristics

### Module 2: Wireframing & Prototyping
- Low-fidelity wireframes
- Interactive prototypes in Figma
- User flow diagrams
- Iterative design process

### Module 3: Visual Design
- Color theory and palette creation
- Typography selection and hierarchy
- Iconography and illustrations
- Grid systems and spacing

### Module 4: Figma Mastery
- Components and variants
- Auto Layout for responsive design
- Design tokens and styles
- Plugins and productivity tools

### Module 5: Design Systems
- Building a component library
- Documentation best practices
- Design-to-development handoff
- Maintaining consistency at scale

### Module 6: Portfolio & Career
- Building a design portfolio
- Case study presentation
- Interview preparation
- Freelance design business

## Career Outcomes

- Design interfaces for web and mobile applications
- Build and maintain design systems
- Expected salary: PKR 50,000–300,000+/month
    `,
    courseraLink: "https://www.coursera.org/professional-certificates/google-ux-design",
    udemyLink: "https://www.udemy.com/course/complete-web-designer-mobile-designer-zero-to-mastery/",
    whatsappLink: `${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I'm interested in the UI/UX Design in-person training. Can you share more details?")}`,
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}
