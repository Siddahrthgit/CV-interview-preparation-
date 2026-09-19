export interface SampleCV {
  id: string;
  role: string;
  name: string;
  headline: string;
  content: string;
}

export const SAMPLE_CVS: SampleCV[] = [
  {
    id: 'fullstack-dev',
    role: 'Senior Full Stack Engineer',
    name: 'Alex Rivera',
    headline: 'Senior Full Stack Engineer (React, TypeScript, Node.js, AWS)',
    content: `Alex Rivera
San Francisco, CA | alex.rivera@email.com | (555) 234-5678 | github.com/arivera | linkedin.com/in/alex-rivera

PROFESSIONAL SUMMARY
Results-driven Senior Full Stack Engineer with 6+ years of experience building scalable web applications, microservices, and distributed cloud architectures. Proven track record reducing system latency by 42% and leading teams of 5 engineers to deliver high-impact fintech and SaaS products.

CORE SKILLS
- Languages: TypeScript, JavaScript (ES6+), Python, Go, SQL, HTML5/CSS3
- Frontend: React 18, Next.js, Redux Toolkit, Tailwind CSS, WebSockets, Jest, React Testing Library
- Backend: Node.js, Express, NestJS, GraphQL, REST APIs, PostgreSQL, MongoDB, Redis
- Cloud & DevOps: AWS (ECS, Lambda, S3, RDS), Docker, Kubernetes, CI/CD (GitHub Actions), Terraform
- Practices: Agile/Scrum, System Architecture, Microservices, Test-Driven Development (TDD)

WORK EXPERIENCE

Senior Software Engineer | FinScale Technologies | 2022 - Present
- Architected and deployed a multi-tenant payment gateway processing $14M+ monthly volume with 99.99% uptime.
- Transitioned legacy monolith to event-driven microservices with Kafka and NestJS, decreasing average response time from 480ms to 95ms.
- Mentored 4 mid-level developers and conducted 80+ technical interviews for engineering hiring.
- Implemented automated end-to-end testing pipeline reducing production regression incidents by 65%.

Software Engineer | CloudPulse Solutions | 2019 - 2022
- Developed responsive dashboard analytics for enterprise SaaS clients using React, TypeScript, and D3.js.
- Built scalable RESTful APIs in Node.js/PostgreSQL handling 5,000+ requests per second.
- Spearheaded database query optimization and indexing strategy, improving slow query execution by 70%.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2015 - 2019
Certifications: AWS Certified Solutions Architect (Associate)`,
  },
  {
    id: 'product-manager',
    role: 'Product Manager',
    name: 'Sarah Chen',
    headline: 'Product Manager (B2B SaaS, AI Products, Growth)',
    content: `Sarah Chen
New York, NY | sarah.chen@email.com | (555) 876-5432 | linkedin.com/in/sarah-chen-pm

PROFESSIONAL SUMMARY
Strategic and data-informed Product Manager with 5 years of experience leading cross-functional teams across AI-powered software, user retention, and monetization. Championed 0-to-1 product launches generating $3.2M ARR in year one.

CORE SKILLS
- Product Strategy: Product Roadmapping, 0-to-1 Product Development, Go-To-Market (GTM), User Journey Mapping
- Technical & AI: LLM/AI prompt engineering workflows, API-first integrations, SQL data modeling, A/B testing
- Analytics & Tools: Amplitude, Mixpanel, Jira, Figma, Looker, Google Analytics, Postman
- Leadership: Cross-functional stakeholder alignment (Design, Eng, Sales, Legal), Customer Discovery

WORK EXPERIENCE

Lead Product Manager | Nexus Intelligence AI | 2022 - Present
- Spearheaded the launch of an AI-assisted customer support copilot, achieving $2.4M ARR within 9 months.
- Led discovery interviews with 60+ enterprise customers to refine pricing, packaging, and UX workflows.
- Improved 30-day user retention rate from 38% to 54% through personalized onboarding funnels.
- Managed a cross-functional squad of 8 engineers, 2 designers, and 1 data scientist using 2-week agile sprints.

Product Manager | Velocity SaaS | 2020 - 2022
- Owned the self-serve checkout funnel and subscription lifecycle, increasing conversion rate by 22%.
- Defined and tracked key performance metrics (CAC, LTV, Churn, ARR) reporting directly to the VP of Product.

EDUCATION
B.A. in Economics & Information Science | Columbia University | 2016 - 2020`,
  },
  {
    id: 'data-scientist',
    role: 'Data Scientist & ML Engineer',
    name: 'Marcus Vance',
    headline: 'Data Scientist & Machine Learning Engineer (Python, PyTorch, LLMs, NLP)',
    content: `Marcus Vance
Austin, TX | marcus.vance@email.com | (555) 432-1098 | github.com/mvance-ml

PROFESSIONAL SUMMARY
Machine Learning Engineer and Data Scientist with 4+ years specializing in natural language processing (NLP), recommendation engines, and end-to-end ML pipelines in production. Experience taking deep learning models from research prototypes to production serving millions of users.

CORE SKILLS
- Programming & Frameworks: Python, PyTorch, TensorFlow, Scikit-learn, Hugging Face, Pandas, NumPy
- Machine Learning / AI: LLMs, Fine-tuning, RAG (Retrieval-Augmented Generation), Vector DBs (Pinecone, Chroma), Transformers, RecSys
- Data & Cloud: Apache Spark, SQL, BigQuery, AWS SageMaker, Docker, MLflow, Airflow

WORK EXPERIENCE

Machine Learning Engineer | DataSphere Analytics | 2022 - Present
- Designed and deployed a semantic search and RAG engine utilizing embeddings and hybrid reranking, improving document retrieval accuracy by 34%.
- Fine-tuned open-source LLMs with LoRA on domain-specific corpora, reducing inference cost by 50% compared to proprietary API endpoints.
- Built automated model retraining and drift detection pipelines using MLflow and Airflow.

Data Scientist | OmniRetail Tech | 2020 - 2022
- Developed collaborative filtering and gradient boosting recommendation algorithms boosting average order value (AOV) by 14%.
- Conducted extensive causal inference and A/B test experiments for personalized marketing campaigns.

EDUCATION
M.S. in Data Science | University of Texas at Austin | 2018 - 2020
B.S. in Statistics and Applied Mathematics | 2014 - 2018`,
  }
];
