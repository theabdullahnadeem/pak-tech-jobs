export interface SalaryRole {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  city: string;
  salaryRange: {
    junior: { min: number; max: number };
    mid: { min: number; max: number };
    senior: { min: number; max: number };
  };
  skills: string[];
  cityComparison: { city: string; junior: number; mid: number; senior: number }[];
  roadmap: { step: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export const salaryRoles: SalaryRole[] = [
  {
    slug: "mern-developer-salary-pakistan",
    title: "MERN Developer Salary in Pakistan (2026) — Lahore, Karachi & Islamabad",
    shortTitle: "MERN Developer",
    description: "Complete MERN stack developer salary guide for Pakistan 2026. Average MERN developer salary in Lahore, Karachi & Islamabad with junior to senior compensation data.",
    city: "Pakistan",
    salaryRange: {
      junior: { min: 40000, max: 80000 },
      mid: { min: 80000, max: 180000 },
      senior: { min: 180000, max: 400000 },
    },
    skills: ["MongoDB", "Express.js", "React.js", "Node.js", "TypeScript", "REST APIs", "Git", "Redux", "Next.js"],
    cityComparison: [
      { city: "Lahore", junior: 50000, mid: 120000, senior: 250000 },
      { city: "Karachi", junior: 55000, mid: 130000, senior: 280000 },
      { city: "Islamabad", junior: 60000, mid: 140000, senior: 300000 },
      { city: "Rawalpindi", junior: 45000, mid: 100000, senior: 220000 },
      { city: "Faisalabad", junior: 35000, mid: 80000, senior: 180000 },
    ],
    roadmap: [
      { step: "Learn HTML, CSS & JavaScript", description: "Build a strong foundation in front-end web technologies." },
      { step: "Master React.js", description: "Learn component-based architecture, hooks, state management with Redux or Context API." },
      { step: "Learn Node.js & Express", description: "Understand server-side programming, REST API design, and middleware." },
      { step: "Master MongoDB", description: "Learn NoSQL database design, Mongoose ODM, aggregation pipelines." },
      { step: "Build Full-Stack Projects", description: "Create 3-5 complete MERN projects for your portfolio." },
      { step: "Learn DevOps Basics", description: "Docker, CI/CD, cloud deployment on AWS or Vercel." },
    ],
    faqs: [
      { question: "What is the average MERN developer salary in Pakistan?", answer: "The average MERN developer salary in Pakistan ranges from PKR 40,000 for juniors to PKR 400,000+ for senior developers, depending on experience, skills, and city." },
      { question: "Which city pays MERN developers the most in Pakistan?", answer: "Islamabad and Karachi tend to offer the highest salaries for MERN developers, followed by Lahore." },
      { question: "How long does it take to become a MERN developer?", answer: "With dedicated learning, you can become job-ready as a junior MERN developer in 6-12 months." },
      { question: "Is MERN stack in demand in Pakistan?", answer: "Yes, MERN stack is one of the most in-demand tech stacks in Pakistan's software industry." },
    ],
  },
  {
    slug: "react-developer-salary-lahore",
    title: "React Developer Salary in Lahore (2026) — Frontend Developer Pay",
    shortTitle: "React Developer",
    description: "React developer salary in Lahore 2026. Compare frontend developer salary in Lahore with Karachi & Islamabad. Junior to senior level React.js pay scale.",
    city: "Lahore",
    salaryRange: {
      junior: { min: 40000, max: 75000 },
      mid: { min: 75000, max: 160000 },
      senior: { min: 160000, max: 350000 },
    },
    skills: ["React.js", "JavaScript", "TypeScript", "Redux", "Next.js", "CSS/Tailwind", "Testing (Jest)", "GraphQL"],
    cityComparison: [
      { city: "Lahore", junior: 50000, mid: 110000, senior: 250000 },
      { city: "Karachi", junior: 55000, mid: 120000, senior: 270000 },
      { city: "Islamabad", junior: 55000, mid: 130000, senior: 280000 },
      { city: "Rawalpindi", junior: 40000, mid: 90000, senior: 200000 },
      { city: "Faisalabad", junior: 35000, mid: 75000, senior: 170000 },
    ],
    roadmap: [
      { step: "Master JavaScript Fundamentals", description: "Deep dive into ES6+, closures, async/await, and the event loop." },
      { step: "Learn React Core Concepts", description: "Components, JSX, props, state, hooks, and lifecycle management." },
      { step: "State Management", description: "Redux Toolkit, Zustand, or Context API for application state." },
      { step: "Learn Next.js", description: "Server-side rendering, static generation, and full-stack React development." },
      { step: "Testing & TypeScript", description: "Write type-safe code and unit/integration tests." },
      { step: "Build a Portfolio", description: "Showcase 3-5 polished React applications." },
    ],
    faqs: [
      { question: "What is the average React developer salary in Lahore?", answer: "React developers in Lahore earn between PKR 40,000 (junior) and PKR 350,000+ (senior) per month." },
      { question: "Is React development a good career in Pakistan?", answer: "Yes, React is one of the most popular front-end frameworks with strong demand across Pakistan." },
      { question: "What skills do React developers need?", answer: "Core skills include JavaScript, React, Redux/state management, CSS frameworks, and ideally TypeScript and Next.js." },
    ],
  },
  {
    slug: "backend-developer-salary-karachi",
    title: "Backend Developer Salary in Karachi (2026) — Node.js, Python & Java",
    shortTitle: "Backend Developer",
    description: "Backend developer salary in Karachi 2026. Node.js developer salary, Python developer pay & Java engineer compensation compared across Pakistan cities.",
    city: "Karachi",
    salaryRange: {
      junior: { min: 50000, max: 90000 },
      mid: { min: 90000, max: 200000 },
      senior: { min: 200000, max: 450000 },
    },
    skills: ["Node.js", "Python", "Java", "PostgreSQL", "MongoDB", "REST APIs", "GraphQL", "Docker", "AWS", "System Design"],
    cityComparison: [
      { city: "Karachi", junior: 60000, mid: 140000, senior: 300000 },
      { city: "Islamabad", junior: 60000, mid: 150000, senior: 320000 },
      { city: "Lahore", junior: 50000, mid: 130000, senior: 280000 },
      { city: "Rawalpindi", junior: 45000, mid: 100000, senior: 230000 },
      { city: "Peshawar", junior: 35000, mid: 80000, senior: 180000 },
    ],
    roadmap: [
      { step: "Choose a Language", description: "Start with Node.js (JavaScript), Python (Django/Flask), or Java (Spring Boot)." },
      { step: "Learn Databases", description: "Master SQL (PostgreSQL) and NoSQL (MongoDB) databases." },
      { step: "API Development", description: "Build RESTful APIs, learn authentication (JWT, OAuth), rate limiting." },
      { step: "Learn System Design", description: "Caching, load balancing, microservices, message queues." },
      { step: "DevOps & Cloud", description: "Docker, Kubernetes, CI/CD, AWS/GCP deployment." },
      { step: "Build & Contribute", description: "Work on open-source projects and build production-grade APIs." },
    ],
    faqs: [
      { question: "How much do backend developers earn in Karachi?", answer: "Backend developers in Karachi earn between PKR 50,000 (junior) and PKR 450,000+ (senior) monthly." },
      { question: "Which backend language pays the most in Pakistan?", answer: "Python (AI/ML) and Node.js tend to command the highest salaries in Pakistan's market." },
      { question: "What certifications help backend developers?", answer: "AWS Solutions Architect, Docker Certified Associate, and language-specific certifications add value." },
    ],
  },
  {
    slug: "ai-engineer-salary-pakistan",
    title: "AI Engineer Salary in Pakistan (2026) — Machine Learning & Data Science",
    shortTitle: "AI Engineer",
    description: "AI engineer salary in Pakistan 2026. Machine learning engineer salary, data scientist salary & AI specialist compensation in Lahore, Karachi & Islamabad.",
    city: "Pakistan",
    salaryRange: {
      junior: { min: 60000, max: 120000 },
      mid: { min: 120000, max: 300000 },
      senior: { min: 300000, max: 700000 },
    },
    skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "MLOps", "Statistics", "LLMs"],
    cityComparison: [
      { city: "Islamabad", junior: 80000, mid: 200000, senior: 500000 },
      { city: "Lahore", junior: 70000, mid: 180000, senior: 450000 },
      { city: "Karachi", junior: 75000, mid: 190000, senior: 480000 },
      { city: "Remote (International)", junior: 150000, mid: 400000, senior: 800000 },
    ],
    roadmap: [
      { step: "Learn Python & Math", description: "Master Python, linear algebra, calculus, probability, and statistics." },
      { step: "Machine Learning Fundamentals", description: "Supervised/unsupervised learning, scikit-learn, feature engineering." },
      { step: "Deep Learning", description: "Neural networks, CNNs, RNNs, Transformers using TensorFlow/PyTorch." },
      { step: "Specialize", description: "Choose NLP, Computer Vision, or Generative AI as your specialization." },
      { step: "Learn LLMs & Prompt Engineering", description: "Work with OpenAI, LangChain, RAG, fine-tuning LLMs." },
      { step: "MLOps", description: "Model deployment, monitoring, CI/CD for ML pipelines." },
    ],
    faqs: [
      { question: "What is the salary range for AI engineers in Pakistan?", answer: "AI engineers in Pakistan earn between PKR 60,000 (junior) and PKR 700,000+ (senior) per month, with remote roles paying even more." },
      { question: "Is AI a good career choice in Pakistan?", answer: "Absolutely. AI is the fastest-growing tech field globally, and Pakistani companies are increasingly investing in AI talent." },
      { question: "What degree do I need for AI engineering?", answer: "A CS/SE degree helps, but many successful AI engineers are self-taught through online courses and certifications." },
    ],
  },
  {
    slug: "frontend-developer-salary-islamabad",
    title: "Frontend Developer Salary in Islamabad (2026) — React, Vue & Angular",
    shortTitle: "Frontend Developer",
    description: "Frontend developer salary in Islamabad 2026. Compare frontend developer salary in Pakistan across Lahore, Karachi & Islamabad with skills guide.",
    city: "Islamabad",
    salaryRange: {
      junior: { min: 45000, max: 85000 },
      mid: { min: 85000, max: 180000 },
      senior: { min: 180000, max: 380000 },
    },
    skills: ["HTML/CSS", "JavaScript", "React.js", "Vue.js", "TypeScript", "Tailwind CSS", "Figma", "Responsive Design", "Performance Optimization"],
    cityComparison: [
      { city: "Islamabad", junior: 55000, mid: 130000, senior: 280000 },
      { city: "Lahore", junior: 50000, mid: 120000, senior: 260000 },
      { city: "Karachi", junior: 55000, mid: 125000, senior: 270000 },
      { city: "Rawalpindi", junior: 40000, mid: 90000, senior: 210000 },
    ],
    roadmap: [
      { step: "HTML, CSS & Responsive Design", description: "Master semantic HTML, CSS Grid, Flexbox, and mobile-first design." },
      { step: "JavaScript & TypeScript", description: "Learn modern JavaScript, DOM manipulation, and TypeScript." },
      { step: "Choose a Framework", description: "Master React.js (most popular) or Vue.js for component-based UI development." },
      { step: "Styling Frameworks", description: "Learn Tailwind CSS, CSS Modules, or Styled Components." },
      { step: "Build Performance Skills", description: "Lazy loading, code splitting, Core Web Vitals optimization." },
      { step: "Design Collaboration", description: "Learn Figma, understand UI/UX principles, and design systems." },
    ],
    faqs: [
      { question: "How much do frontend developers earn in Islamabad?", answer: "Frontend developers in Islamabad earn between PKR 45,000 (junior) and PKR 380,000 (senior) per month." },
      { question: "What frontend framework should I learn?", answer: "React.js has the highest demand in Pakistan, followed by Vue.js and Angular." },
    ],
  },
  {
    slug: "devops-engineer-salary-pakistan",
    title: "DevOps Engineer Salary in Pakistan (2026) — AWS, Docker & Kubernetes",
    shortTitle: "DevOps Engineer",
    description: "DevOps engineer salary in Pakistan 2026. Cloud engineer pay with AWS, Docker & Kubernetes across Lahore, Karachi, Islamabad & remote international roles.",
    city: "Pakistan",
    salaryRange: {
      junior: { min: 60000, max: 110000 },
      mid: { min: 110000, max: 250000 },
      senior: { min: 250000, max: 550000 },
    },
    skills: ["Linux", "Docker", "Kubernetes", "AWS/Azure/GCP", "Terraform", "Jenkins", "CI/CD", "Monitoring", "Bash/Python", "Networking"],
    cityComparison: [
      { city: "Islamabad", junior: 70000, mid: 170000, senior: 380000 },
      { city: "Lahore", junior: 65000, mid: 160000, senior: 350000 },
      { city: "Karachi", junior: 70000, mid: 165000, senior: 370000 },
      { city: "Remote (International)", junior: 120000, mid: 350000, senior: 700000 },
    ],
    roadmap: [
      { step: "Linux & Networking", description: "Master Linux administration, shell scripting, and networking fundamentals." },
      { step: "Containerization", description: "Learn Docker for containerizing applications and services." },
      { step: "Orchestration", description: "Kubernetes for managing container clusters at scale." },
      { step: "Cloud Platforms", description: "Master AWS, Azure, or GCP services and architecture." },
      { step: "Infrastructure as Code", description: "Terraform, CloudFormation, and Ansible for automation." },
      { step: "CI/CD & Monitoring", description: "Jenkins/GitHub Actions pipelines, Prometheus, Grafana, ELK stack." },
    ],
    faqs: [
      { question: "What is the average DevOps salary in Pakistan?", answer: "DevOps engineers earn between PKR 60,000 (junior) and PKR 550,000+ (senior) monthly in Pakistan." },
      { question: "Is DevOps in demand in Pakistan?", answer: "Yes, DevOps is highly in demand as companies move to cloud infrastructure and need automation expertise." },
      { question: "What cloud certification is best for Pakistan?", answer: "AWS certifications are most recognized, followed by Azure and GCP." },
    ],
  },
  {
    slug: "software-engineer-salary-pakistan",
    title: "Software Engineer Salary in Pakistan (2026) — Average Pay & Scope",
    shortTitle: "Software Engineer",
    description: "Software engineer salary in Pakistan 2026. Average salary of software engineer in Pakistan per month, starting salary for freshers, senior software engineer salary & scope of software engineering in Pakistan.",
    city: "Pakistan",
    salaryRange: {
      junior: { min: 40000, max: 90000 },
      mid: { min: 90000, max: 200000 },
      senior: { min: 200000, max: 500000 },
    },
    skills: ["JavaScript", "Python", "Java", "C++", "Data Structures", "Algorithms", "System Design", "Git", "SQL", "Cloud"],
    cityComparison: [
      { city: "Lahore", junior: 50000, mid: 130000, senior: 300000 },
      { city: "Karachi", junior: 55000, mid: 140000, senior: 320000 },
      { city: "Islamabad", junior: 60000, mid: 150000, senior: 350000 },
      { city: "Rawalpindi", junior: 45000, mid: 110000, senior: 250000 },
      { city: "Faisalabad", junior: 35000, mid: 90000, senior: 200000 },
    ],
    roadmap: [
      { step: "CS Fundamentals", description: "Master data structures, algorithms, OOP concepts, and operating systems." },
      { step: "Choose a Language", description: "Become proficient in JavaScript, Python, Java, or C++ depending on your target domain." },
      { step: "Build Projects", description: "Create 3-5 real-world projects covering web apps, APIs, or mobile applications." },
      { step: "Learn System Design", description: "Understand scalable architectures, databases, caching, and distributed systems." },
      { step: "Practice DSA", description: "Solve 200+ problems on LeetCode/HackerRank for technical interview preparation." },
      { step: "Get Experience", description: "Apply for internships, contribute to open source, freelance on Upwork or Fiverr." },
    ],
    faqs: [
      { question: "What is the salary of software engineer in Pakistan?", answer: "The salary of a software engineer in Pakistan ranges from PKR 40,000 for fresh graduates to PKR 500,000+ for senior engineers per month, depending on skills, experience and city." },
      { question: "What is the starting salary of software engineer in Pakistan?", answer: "The starting salary of a fresh graduate software engineer in Pakistan is typically PKR 40,000 to PKR 90,000 per month, depending on the company and city." },
      { question: "What is the average salary of software engineer in Pakistan per month?", answer: "The average software engineer salary per month in Pakistan is approximately PKR 120,000 to PKR 180,000, combining junior to senior level data across major cities." },
      { question: "What is the scope of software engineering in Pakistan?", answer: "Software engineering has excellent scope in Pakistan with growing demand from local tech companies, international remote jobs, and freelancing opportunities on global platforms." },
      { question: "What is the senior software engineer salary in Pakistan?", answer: "Senior software engineers in Pakistan earn between PKR 200,000 and PKR 500,000+ per month, with top earners at multinational companies or remote roles earning even more." },
      { question: "Computer science vs software engineering salary in Pakistan?", answer: "Both fields offer similar salary ranges. Software engineering may offer slightly higher pay in development roles, while CS graduates may earn more in specialized fields like AI and data science." },
    ],
  },
  {
    slug: "cyber-security-salary-pakistan",
    title: "Cyber Security Salary in Pakistan (2026) — InfoSec & Ethical Hacking",
    shortTitle: "Cyber Security",
    description: "Cyber security salary in Pakistan 2026. Computer security salary, cybersecurity jobs salary, ethical hacker pay & information security analyst compensation across Lahore, Karachi & Islamabad.",
    city: "Pakistan",
    salaryRange: {
      junior: { min: 50000, max: 100000 },
      mid: { min: 100000, max: 250000 },
      senior: { min: 250000, max: 600000 },
    },
    skills: ["Network Security", "Ethical Hacking", "Penetration Testing", "SIEM", "Firewalls", "Linux", "Python", "Incident Response", "SOC", "Compliance"],
    cityComparison: [
      { city: "Islamabad", junior: 65000, mid: 170000, senior: 400000 },
      { city: "Karachi", junior: 60000, mid: 160000, senior: 380000 },
      { city: "Lahore", junior: 55000, mid: 150000, senior: 350000 },
      { city: "Remote (International)", junior: 120000, mid: 350000, senior: 700000 },
    ],
    roadmap: [
      { step: "Networking Fundamentals", description: "Learn TCP/IP, DNS, VPNs, firewalls, and network architecture basics." },
      { step: "Linux & Scripting", description: "Master Linux command line, Bash scripting, and Python for automation." },
      { step: "Security Concepts", description: "Study OWASP Top 10, CIA triad, encryption, authentication protocols." },
      { step: "Ethical Hacking & Pentesting", description: "Learn tools like Nmap, Burp Suite, Metasploit, and Wireshark." },
      { step: "Get Certified", description: "Pursue CEH, CompTIA Security+, OSCP, or CISSP certifications." },
      { step: "SOC & Incident Response", description: "Learn SIEM tools, log analysis, threat hunting, and incident handling." },
    ],
    faqs: [
      { question: "What is the cyber security salary in Pakistan?", answer: "Cyber security professionals in Pakistan earn between PKR 50,000 (junior) and PKR 600,000+ (senior) per month, making it one of the highest paying tech fields." },
      { question: "Are cyber security jobs in demand in Pakistan?", answer: "Yes, cyber security jobs are rapidly growing in Pakistan as companies and government organizations invest heavily in digital security infrastructure." },
      { question: "What certifications help for cyber security jobs in Pakistan?", answer: "CEH (Certified Ethical Hacker), CompTIA Security+, OSCP, and CISSP are the most valued certifications for cyber security roles in Pakistan." },
      { question: "What is the computer security salary in Pakistan?", answer: "Computer security analysts earn between PKR 80,000 and PKR 400,000+ per month in Pakistan depending on experience and specialization." },
    ],
  },
  {
    slug: "full-stack-developer-salary-pakistan",
    title: "Full Stack Developer Salary in Pakistan (2026) — Lahore, Karachi & Islamabad",
    shortTitle: "Full Stack Developer",
    description: "Full stack developer salary in Pakistan 2026. Compare full stack developer salary in Lahore, Karachi & Islamabad with skills roadmap and career growth guide.",
    city: "Pakistan",
    salaryRange: {
      junior: { min: 45000, max: 90000 },
      mid: { min: 90000, max: 200000 },
      senior: { min: 200000, max: 450000 },
    },
    skills: ["React.js", "Node.js", "TypeScript", "PostgreSQL", "MongoDB", "REST APIs", "Docker", "Git", "Next.js", "AWS"],
    cityComparison: [
      { city: "Lahore", junior: 55000, mid: 130000, senior: 280000 },
      { city: "Karachi", junior: 60000, mid: 140000, senior: 300000 },
      { city: "Islamabad", junior: 65000, mid: 150000, senior: 320000 },
      { city: "Rawalpindi", junior: 45000, mid: 110000, senior: 240000 },
      { city: "Faisalabad", junior: 38000, mid: 85000, senior: 190000 },
    ],
    roadmap: [
      { step: "Frontend Mastery", description: "Learn HTML, CSS, JavaScript, React.js, and responsive design." },
      { step: "Backend Development", description: "Master Node.js, Express, REST APIs, and authentication systems." },
      { step: "Databases", description: "Learn both SQL (PostgreSQL) and NoSQL (MongoDB) databases." },
      { step: "Full Stack Frameworks", description: "Build projects with Next.js for server-side rendering and full-stack capabilities." },
      { step: "DevOps Basics", description: "Docker, CI/CD pipelines, and cloud deployment on AWS or Vercel." },
      { step: "Portfolio & Interview Prep", description: "Build 3-5 full-stack projects and practice system design questions." },
    ],
    faqs: [
      { question: "What is the full stack developer salary in Pakistan?", answer: "Full stack developers in Pakistan earn between PKR 45,000 (junior) and PKR 450,000+ (senior) per month, depending on skills, experience, and city." },
      { question: "Full stack developer salary in Lahore vs Karachi?", answer: "Karachi and Islamabad tend to offer 10-15% higher salaries than Lahore for full stack developers, though Lahore's market is growing rapidly." },
      { question: "How long to become a full stack developer?", answer: "With dedicated learning, you can become job-ready as a junior full stack developer in 8-12 months of consistent practice and project building." },
    ],
  },
  {
    slug: "data-scientist-salary-pakistan",
    title: "Data Scientist Salary in Pakistan (2026) — Analytics & Machine Learning",
    shortTitle: "Data Scientist",
    description: "Data scientist salary in Pakistan 2026. Data analyst salary, machine learning engineer salary & business intelligence compensation across Lahore, Karachi & Islamabad.",
    city: "Pakistan",
    salaryRange: {
      junior: { min: 55000, max: 110000 },
      mid: { min: 110000, max: 280000 },
      senior: { min: 280000, max: 650000 },
    },
    skills: ["Python", "R", "SQL", "Machine Learning", "Statistics", "Pandas", "Scikit-learn", "Tableau", "Power BI", "TensorFlow"],
    cityComparison: [
      { city: "Islamabad", junior: 75000, mid: 190000, senior: 450000 },
      { city: "Karachi", junior: 70000, mid: 180000, senior: 430000 },
      { city: "Lahore", junior: 65000, mid: 170000, senior: 400000 },
      { city: "Remote (International)", junior: 140000, mid: 380000, senior: 750000 },
    ],
    roadmap: [
      { step: "Mathematics & Statistics", description: "Master probability, statistics, linear algebra, and calculus fundamentals." },
      { step: "Python & SQL", description: "Learn Python (Pandas, NumPy, Matplotlib) and SQL for data manipulation and querying." },
      { step: "Machine Learning", description: "Study supervised/unsupervised learning, model evaluation, and feature engineering with scikit-learn." },
      { step: "Data Visualization", description: "Master Tableau, Power BI, and Python visualization libraries for storytelling with data." },
      { step: "Deep Learning", description: "Learn neural networks, CNNs, RNNs, and NLP with TensorFlow or PyTorch." },
      { step: "Build a Portfolio", description: "Complete Kaggle competitions and real-world data science projects for your resume." },
    ],
    faqs: [
      { question: "What is the data scientist salary in Pakistan?", answer: "Data scientists in Pakistan earn between PKR 55,000 (junior) and PKR 650,000+ (senior) per month, with remote international roles paying significantly more." },
      { question: "Data analyst vs data scientist salary in Pakistan?", answer: "Data analysts typically earn 20-30% less than data scientists. Analysts focus on reporting while scientists build predictive models using machine learning." },
      { question: "What degree is needed for data science in Pakistan?", answer: "A CS, Mathematics, or Statistics degree helps, but many data scientists are self-taught through bootcamps, Kaggle, and online certifications." },
      { question: "Is data science a good career in Pakistan?", answer: "Absolutely. Data science is one of the fastest-growing fields in Pakistan with increasing demand from banks, telecom, e-commerce, and tech companies." },
    ],
  },
];

export function getSalaryBySlug(slug: string): SalaryRole | undefined {
  return salaryRoles.find((role) => role.slug === slug);
}

export function formatSalary(amount: number): string {
  if (amount >= 100000) {
    return `PKR ${(amount / 1000).toFixed(0)}K`;
  }
  return `PKR ${amount.toLocaleString()}`;
}
