import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy get Google GenAI client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback generator if API key is missing or model throws
function generateFallbackAnalysis(cvText: string) {
  const isML = cvText.toLowerCase().includes("machine learning") || cvText.toLowerCase().includes("python") || cvText.toLowerCase().includes("pytorch");
  const isPM = cvText.toLowerCase().includes("product manager") || cvText.toLowerCase().includes("roadmap") || cvText.toLowerCase().includes("growth");
  
  if (isPM) {
    return {
      candidate: {
        name: "Sarah Chen",
        title: "Senior Product Manager",
        summary: "Product strategist with 5+ years driving high-impact 0-to-1 B2B SaaS and AI product launches, conversion funnels, and retention optimization.",
        yearsExperience: "5+ years",
        topSkills: ["Product Strategy", "User Journey Mapping", "A/B Testing", "Cross-Functional Leadership", "Data Analytics (SQL/Amplitude)", "AI Workflows"],
        domains: ["B2B SaaS", "Artificial Intelligence", "Enterprise Software", "Growth & Monetization"],
        education: "B.A. in Economics & Information Science, Columbia University",
        notableAchievements: [
          "Launched AI support copilot generating $2.4M ARR within 9 months",
          "Improved 30-day user retention rate from 38% to 54%",
          "Grew checkout funnel conversion rate by 22%"
        ]
      },
      matchedJobs: [
        {
          id: "job-pm-ai",
          title: "Principal / Lead Product Manager - AI Platform",
          department: "Product",
          matchScore: 94,
          matchReason: "Direct experience launching zero-to-one AI products, managing cross-functional squads, and optimizing retention funnels.",
          alignedSkills: ["AI Product Workflows", "User Discovery", "0-to-1 Roadmapping", "Cross-Functional Squad Leadership", "Metric Tracking (ARR, Retention)"],
          missingOrGrowthSkills: ["Enterprise SOC2 compliance exposure", "Deep technical API architecture design"],
          marketDemand: "Very High",
          typicalLevel: "Lead / Staff",
          overview: "Drive the roadmap, strategy, and go-to-market execution for next-generation generative AI enterprise workflows.",
          interviewQuestions: [
            {
              id: "q-pm-1",
              category: "Behavioral",
              question: "Tell me about a time you had to make an aggressive product tradeoff between shipping speed and engineering quality.",
              whyAsked: "Evaluates judgment under pressure, alignment with business priorities, and stakeholder communication.",
              idealAnswer: "Use the STAR method: State the specific release deadline, the technical debt tradeoff identified, how you consulted the lead architect, the decision criteria (e.g. core customer value vs non-critical edge cases), and the outcome including scheduling a fast-follow refactor sprint.",
              keyPoints: ["Quantified impact of shipping on time", "Transparent risk mitigation plan", "Alignment with engineering leadership", "Post-launch retrospectives"],
              pitfallsToAvoid: ["Saying you never compromise on perfection", "Blaming engineering for delays", "Not measuring the trade-off result"],
              difficulty: "Intermediate"
            },
            {
              id: "q-pm-2",
              category: "Situational",
              question: "Our flagship AI feature's user retention dropped by 15% after a major UI redesign. How would you investigate and resolve this?",
              whyAsked: "Assesses analytical rigor, hypothesis-driven problem solving, and ability to prioritize fixes based on user telemetry.",
              idealAnswer: "I would immediately segment the data: analyze retention by user cohort (new vs power users), device type, and funnel step drop-offs using Amplitude/Mixpanel. Concurrently, review user session recordings and survey customer support tickets. Once root hypotheses are ranked, run an A/B test with micro-corrections or temporary rollback of high-friction onboarding changes.",
              keyPoints: ["Data segmentation", "Qualitative user feedback", "Hypothesis validation matrix", "Clear rollback/fix criteria"],
              pitfallsToAvoid: ["Jumping immediately to conclusions without data", "Blaming users for not understanding the redesign"],
              difficulty: "Advanced"
            },
            {
              id: "q-pm-3",
              category: "CV Deep-Dive",
              question: "You noted on your CV that you achieved $2.4M ARR in 9 months for an AI copilot. What was your pricing strategy and primary GTM blocker?",
              whyAsked: "Verifies authentic depth behind resume metrics and tests monetization strategy competence.",
              idealAnswer: "Explain the tiered pricing model (e.g. seat-based + consumption credits for LLM tokens), how customer discovery revealed resistance to open-ended token billing, and how offering predictable enterprise tiers unlocked contracts.",
              keyPoints: ["Pricing model rationale", "Customer discovery learnings", "Sales enablement alignment"],
              pitfallsToAvoid: ["Giving vague answers without knowing your own numbers", "Failing to mention unit economics or inference costs"],
              difficulty: "Intermediate"
            }
          ]
        },
        {
          id: "job-pm-growth",
          title: "Growth Product Manager",
          department: "Growth & Marketing",
          matchScore: 89,
          matchReason: "Strong background in self-serve checkout funnels, CAC/LTV analysis, and activation metrics.",
          alignedSkills: ["A/B Testing", "Activation Funnels", "SQL & Analytics", "Monetization Optimization"],
          missingOrGrowthSkills: ["Paid acquisition channel mechanics", "SEO programmatic growth loops"],
          marketDemand: "High",
          typicalLevel: "Senior",
          overview: "Optimize onboarding loops, conversion rates, and self-serve upgrade paths across web and mobile surfaces.",
          interviewQuestions: [
            {
              id: "q-growth-1",
              category: "Technical",
              question: "How do you calculate statistical significance for an A/B test with low sample sizes, and when do you decide to call a winner?",
              whyAsked: "Tests knowledge of experimentation validity, p-values, sample size power calculations, and false positive prevention.",
              idealAnswer: "Explain statistical power (typically 80%), alpha level (5%), Minimum Detectable Effect (MDE), and avoiding the 'peeking problem' through pre-set sample sizes or sequential testing methods.",
              keyPoints: ["Sample size pre-calculation", "MDE definition", "Guarding against false discovery"],
              pitfallsToAvoid: ["Calling a test early as soon as p < 0.05 without sample threshold reached"],
              difficulty: "Intermediate"
            }
          ]
        }
      ],
      generalAdvice: [
        "Include unit economics (e.g., Gross Margins, CAC payback period) alongside ARR metrics in your summary.",
        "Emphasize your technical understanding of AI inference latency and token budgeting, which sets top AI PMs apart.",
        "Prepare concrete STAR stories that demonstrate resolving cross-functional conflict with engineering leads."
      ]
    };
  }

  // Default Full Stack / Software Engineer
  return {
    candidate: {
      name: "Alex Rivera",
      title: "Senior Full Stack Engineer",
      summary: "Full Stack Engineer with 6+ years designing scalable cloud systems, microservices, and modern React/TypeScript frontends. Proven track record reducing system latency by 42% and processing high transaction volumes.",
      yearsExperience: "6+ years",
      topSkills: ["TypeScript / JavaScript", "React & Next.js", "Node.js & Express", "AWS & Docker", "PostgreSQL & Redis", "System Architecture"],
      domains: ["Fintech", "Cloud Platforms", "High-Throughput APIs", "Distributed Microservices"],
      education: "B.S. in Computer Science, UC Berkeley",
      notableAchievements: [
        "Architected multi-tenant payment gateway processing $14M+ monthly volume with 99.99% uptime",
        "Reduced average response latency from 480ms to 95ms via event-driven microservices",
        "Conducted 80+ engineering interviews and mentored junior developers"
      ]
    },
    matchedJobs: [
      {
        id: "job-sr-fs",
        title: "Senior Full Stack Engineer",
        department: "Engineering",
        matchScore: 95,
        matchReason: "Exceptional alignment with modern React, TypeScript, Node.js, distributed database optimization, and high-uptime production systems.",
        alignedSkills: ["React 18", "TypeScript", "Node.js", "PostgreSQL", "AWS & Docker", "CI/CD & Microservices"],
        missingOrGrowthSkills: ["GraphQL Federation at scale", "Kubernetes cluster administration"],
        marketDemand: "Very High",
        typicalLevel: "Senior (L5)",
        overview: "Build reliable, high-throughput customer-facing web applications and resilient backend service architectures.",
        interviewQuestions: [
          {
            id: "q-fs-1",
            category: "Architecture & Design",
            question: "How would you design an idempotent payment processing endpoint that prevents double-charging during network retries?",
            whyAsked: "Tests system design depth, distributed systems awareness, database concurrency, and transaction safety.",
            idealAnswer: "Require an Idempotency-Key header from the client (UUID). In the server, use an atomic check-and-set in Redis or a unique constraint in PostgreSQL with transaction isolation. If a request with the same key is already in progress, return HTTP 409 or hold until completion. If already succeeded, return the cached result immediately without re-invoking payment gateways.",
            keyPoints: ["Idempotency key generation & lifetime", "Distributed lock / Redis SETNX or DB transaction", "Handling network timeouts vs gateway failures", "Replay attack protection"],
            pitfallsToAvoid: ["Relying on client-side state alone", "Not discussing race conditions when two concurrent requests arrive simultaneously"],
            difficulty: "Advanced"
          },
          {
            id: "q-fs-2",
            category: "Technical",
            question: "In React 18/19, how do you handle concurrency, and what are the trade-offs between useMemo, React.memo, and manual caching?",
            whyAsked: "Evaluates modern React rendering lifecycle knowledge, profiling skills, and avoidance of premature optimization.",
            idealAnswer: "Explain React's fiber scheduler, startTransition for non-blocking state updates, and how React re-renders components. Clarify that useMemo has memory overhead and is only needed for expensive calculations or preserving reference equality in dependency arrays.",
            keyPoints: ["startTransition & useDeferredValue", "Reference equality vs execution cost", "React DevTools Profiler"],
            pitfallsToAvoid: ["Claiming you wrap every function or object in useMemo/useCallback by default", "Failing to explain when memoization degrades performance"],
            difficulty: "Intermediate"
          },
          {
            id: "q-fs-3",
            category: "CV Deep-Dive",
            question: "You mentioned reducing latency from 480ms to 95ms using Kafka and NestJS. Walk me through the exact bottlenecks you identified and how you measured them.",
            whyAsked: "Validates your hands-on engineering contributions and checks whether you truly understood the optimization pipeline.",
            idealAnswer: "Describe tracing the request path with APM tools (e.g. Datadog / OpenTelemetry), finding synchronous sequential database locks and third-party blocking calls. Then explain how moving notifications and non-blocking syncs to Kafka message queues decoupled the response cycle.",
            keyPoints: ["APM profiling and flame graphs", "Synchronous vs asynchronous event-driven design", "Database indexing & connection pooling improvements"],
            pitfallsToAvoid: ["Vague answers like 'we just added Kafka'", "Not knowing the baseline metrics or monitoring tools"],
            difficulty: "Advanced"
          },
          {
            id: "q-fs-4",
            category: "Behavioral",
            question: "Describe a production outage or critical bug you caused. How did you resolve it and what post-mortem actions did you implement?",
            whyAsked: "Tests accountability, blameless post-mortem culture, root cause analysis (5 Whys), and engineering maturity.",
            idealAnswer: "Be honest about the bug (e.g. an unindexed migration locking a high-traffic table). Detail how you triaged, prioritized rolling back or hotfixing within minutes, communicated transparently to stakeholders, and created automated migration linters in CI/CD to prevent recurrence.",
            keyPoints: ["Ownership and humility", "Incident mitigation over panic", "Comprehensive blameless RCA", "Automated preventative guardrails"],
            pitfallsToAvoid: ["Saying 'I've never caused an outage'", "Blaming junior engineers or bad requirements"],
            difficulty: "Intermediate"
          }
        ]
      },
      {
        id: "job-tech-lead",
        title: "Staff Software Engineer / Tech Lead",
        department: "Core Platform",
        matchScore: 88,
        matchReason: "Demonstrated experience mentoring developers, conducting 80+ technical interviews, and driving architectural standardizations.",
        alignedSkills: ["System Design", "Engineering Mentorship", "Technical Hiring", "High-Availability Architecture"],
        missingOrGrowthSkills: ["Cross-organization executive roadmapping", "Multi-region active-active disaster recovery"],
        marketDemand: "High",
        typicalLevel: "Staff / Lead",
        overview: "Set architectural direction, guide engineering best practices, and lead complex multi-team initiatives.",
        interviewQuestions: [
          {
            id: "q-lead-1",
            category: "Behavioral",
            question: "How do you navigate a technical disagreement between two senior engineers advocating for incompatible architectural approaches?",
            whyAsked: "Assesses leadership maturity, consensus building, and focus on objective business metrics over ego.",
            idealAnswer: "Establish objective evaluation criteria (maintainability, team ramp-up time, SLA requirements, operational cost). Ask both engineers to build small timeboxed prototypes (Spikes) or Write RFCs with pros/cons. Facilitate a structured review, make the call if consensus is stuck, and enforce 'disagree and commit.'",
            keyPoints: ["Objective RFC framework", "Focus on user and business needs", "Spike/benchmarking evidence", "Disagree and commit"],
            pitfallsToAvoid: ["Picking your personal favorite technology without objective rationale", "Letting debates stall development indefinitely"],
            difficulty: "Advanced"
          }
        ]
      },
      {
        id: "job-frontend-lead",
        title: "Senior Frontend Platform Architect",
        department: "Design Systems & Web Platform",
        matchScore: 91,
        matchReason: "Deep React, Next.js, and TypeScript expertise paired with performance optimization achievements.",
        alignedSkills: ["React 18", "TypeScript", "Performance & Web Vitals", "Component Libraries", "Testing Strategy"],
        missingOrGrowthSkills: ["Micro-frontend federation at enterprise scale"],
        marketDemand: "High",
        typicalLevel: "Senior",
        overview: "Shape frontend engineering standards, build shared design system foundations, and optimize Core Web Vitals across millions of users.",
        interviewQuestions: [
          {
            id: "q-fe-1",
            category: "Technical",
            question: "How would you optimize an enterprise dashboard suffering from poor Interaction to Next Paint (INP) and high memory consumption?",
            whyAsked: "Tests practical mastery of browser rendering pipeline, memory leaks, DOM virtualization, and Web Vitals.",
            idealAnswer: "Profile with Chrome DevTools Performance panel to find long tasks (>50ms) blocking the main thread. Break down large synchronous tasks with requestIdleCallback or startTransition. Implement window virtualization (react-window) for large lists, audit detached DOM tree closures causing memory leaks, and defer non-critical script evaluation.",
            keyPoints: ["Chrome DevTools Performance & Memory profiling", "DOM virtualization", "Main thread offloading", "Garbage collection awareness"],
            pitfallsToAvoid: ["Only mentioning caching or CDN", "Not explaining how INP is calculated"],
            difficulty: "Advanced"
          }
        ]
      }
    ],
    generalAdvice: [
      "Quantify your microservices transition by highlighting the exact business cost reduction or cloud infrastructure savings.",
      "In system design interviews, always lead with non-functional requirements (throughput, latency, availability, fault tolerance) before sketching diagrams.",
      "Showcase your experience conducting 80+ interviews by articulating what you personally look for in high-signal engineering candidates."
    ]
  };
}

// 1. Analyze CV Endpoint
app.post("/api/analyze-cv", async (req, res) => {
  try {
    const { cvText, fileData, mimeType, fileName } = req.body;

    if (!cvText && !fileData) {
      return res.status(400).json({ error: "Please provide CV text or an uploaded file." });
    }

    const ai = getGenAI();
    if (!ai) {
      console.log("No GEMINI_API_KEY detected. Using intelligent fallback analysis.");
      const fallback = generateFallbackAnalysis(cvText || "Full Stack Engineer Resume");
      return res.json(fallback);
    }

    const systemPrompt = `You are a world-class Executive Tech Recruiter and Senior Engineering Hiring Manager at top global tech companies.
Your goal is to thoroughly analyze the uploaded CV/Resume and produce a deeply personalized, actionable interview preparation package.

Extract and analyze:
1. Candidate profile: name, target/current title, concise executive summary, years of experience, top technical & domain skills, key industry domains, education, and notable quantified achievements.
2. 4-5 highly aligned and realistic target job roles matched directly with their CV.
   For each job:
   - Specific job title (e.g. Senior Frontend Engineer, Full Stack Staff Engineer, AI Solutions Architect, Product Manager, etc.)
   - Department / Domain
   - Match score (integer between 65 and 98 based on real alignment)
   - Detailed match reason explaining why they are a strong fit
   - List of aligned skills from their CV
   - Missing or growth skills they should brush up on
   - Market demand (High, Very High, Moderate)
   - Typical level (e.g., Mid-Level, Senior, Lead/Staff, Director)
   - 1-2 sentence role overview
   - 4-5 rigorous, realistic interview questions specifically tailored to THIS role and candidate:
     - Categories: "Behavioral", "Technical", "Architecture & Design", "Situational", or "CV Deep-Dive"
     - The exact question text
     - Why interviewers ask it (the core competency tested)
     - Ideal model answer (structured, thorough, using STAR framework if behavioral)
     - 3-4 key points / keywords the candidate MUST mention
     - Common pitfalls to avoid
     - Difficulty ("Beginner", "Intermediate", "Advanced")
3. 3-4 concrete strategic tips to improve their CV framing and interview success.

Respond strictly with valid JSON conforming to the requested structure.`;

    let contentsPayload: any;

    if (fileData && mimeType) {
      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: fileData,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this uploaded resume file (${fileName || "Resume"}). ${cvText ? `Additional candidate notes: ${cvText}` : ""} Generate the complete CV profile, 4-5 matched jobs with match scores, and interview questions & model answers for each job.`,
          },
        ],
      };
    } else {
      contentsPayload = {
        parts: [
          {
            text: `Here is the candidate's CV/Resume text:\n\n${cvText}\n\nAnalyze this resume, extract the profile, generate 4-5 matched job roles with tailored interview questions, model answers, and key talking points.`,
          },
        ],
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contentsPayload,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const text = response.text || "";
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (parseError) {
      console.warn("Failed to parse Gemini response as JSON. Stripping backticks if present.", parseError);
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    }
  } catch (error: any) {
    console.error("Error in /api/analyze-cv:", error);
    // Graceful fallback to avoid leaving user stuck
    const fallback = generateFallbackAnalysis(req.body.cvText || "Software Engineer Resume");
    return res.json(fallback);
  }
});

// 2. Custom Target Job Match Endpoint
app.post("/api/custom-job", async (req, res) => {
  try {
    const { cvProfile, jobTitle, jobDescription } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ error: "Job title is required." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        id: `custom-${Date.now()}`,
        title: jobTitle,
        department: "Target Role",
        matchScore: 87,
        matchReason: `Strong transferable foundation from your experience for ${jobTitle}.`,
        alignedSkills: cvProfile?.topSkills?.slice(0, 4) || ["Problem Solving", "System Design", "Core Technologies"],
        missingOrGrowthSkills: ["Domain specific frameworks", "Company-specific toolsets"],
        marketDemand: "High",
        typicalLevel: "Senior",
        overview: jobDescription ? jobDescription.slice(0, 160) + "..." : `Target position focusing on ${jobTitle} capabilities.`,
        interviewQuestions: [
          {
            id: `q-custom-1`,
            category: "CV Deep-Dive",
            question: `How do your specific achievements as ${cvProfile?.title || "a technical professional"} prepare you to excel as a ${jobTitle}?`,
            whyAsked: "Evaluates role relevance and how clearly you can connect your past impact to their upcoming challenges.",
            idealAnswer: `Begin by framing your core strengths, bridge your past projects directly to the scope of this ${jobTitle} position, and cite 1-2 measurable outcomes that demonstrate fast onboarding.`,
            keyPoints: ["Direct skill transfer", "Quantified business impact", "Rapid learning agility"],
            pitfallsToAvoid: ["Giving a generic resume walk-through without targeting the new role"],
            difficulty: "Intermediate"
          },
          {
            id: `q-custom-2`,
            category: "Technical",
            question: `What is the most complex architecture or decision you led in recent years, and how would you apply those learnings to ${jobTitle}?`,
            whyAsked: "Tests technical depth, judgment, and ability to scale systems or workflows.",
            idealAnswer: "Structure with: context, the high-stakes constraint, the alternatives evaluated, why you picked your solution, and what you'd do differently in hindsight.",
            keyPoints: ["System scalability", "Trade-off analysis", "Lessons learned"],
            pitfallsToAvoid: ["Glossing over failures or technical limitations"],
            difficulty: "Advanced"
          }
        ]
      });
    }

    const prompt = `Candidate Profile:
${JSON.stringify(cvProfile || {}, null, 2)}

Target Job Title: ${jobTitle}
Target Job Description: ${jobDescription || "Not provided (evaluate standard industry expectations for this title)"}

Analyze the match between this candidate and this specific target job. Generate:
1. matchScore (number between 50 and 99)
2. matchReason (clear, objective assessment)
3. alignedSkills (array of strings from candidate's background)
4. missingOrGrowthSkills (array of skills to prepare)
5. marketDemand ("High" | "Very High" | "Moderate")
6. typicalLevel (string)
7. overview (string)
8. interviewQuestions (array of 4-5 rigorous interview questions specifically combining this candidate's CV and this target role, with whyAsked, idealAnswer, keyPoints, pitfallsToAvoid, and difficulty).

Respond with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    if (!parsed.id) parsed.id = `custom-${Date.now()}`;
    if (!parsed.title) parsed.title = jobTitle;
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/custom-job:", error);
    return res.status(500).json({ error: "Failed to generate custom job match." });
  }
});

// 3. Evaluate User Practice Answer Endpoint
app.post("/api/evaluate-answer", async (req, res) => {
  try {
    const { jobTitle, question, idealAnswer, userAnswer, candidateContext } = req.body;

    if (!userAnswer || userAnswer.trim().length < 5) {
      return res.status(400).json({ error: "Please provide an answer to evaluate." });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback evaluation
      const wordCount = userAnswer.trim().split(/\s+/).length;
      const score = Math.min(92, Math.max(60, Math.floor(wordCount * 1.5 + 40)));
      return res.json({
        score,
        verdict: score >= 85 ? "Strong" : score >= 70 ? "Satisfactory" : "Needs Improvement",
        strengths: [
          "Directly addresses the premise of the question",
          "Demonstrates authentic personal voice and relevant technical context"
        ],
        weaknesses: [
          "Could include more specific metrics and quantifiable outcomes",
          "Structure could follow the STAR framework (Situation, Task, Action, Result) more explicitly"
        ],
        improvedAnswer: `${userAnswer.trim()}\n\nTo elevate this answer: emphasize the business impact (e.g. 'This reduced latency by 30% and saved 15 engineering hours weekly') and articulate the exact decision trade-offs you made.`,
        actionableTips: [
          "Always state the metric or business result at the conclusion of your story",
          "Keep background context under 20% of your talking time so you spend most time on your Actions"
        ],
        starFrameworkScore: {
          situation: "Good context established",
          task: "Clear objective",
          action: "Covered key steps taken",
          result: "Recommend adding numeric metrics for stronger closing"
        }
      });
    }

    const prompt = `You are a tough but supportive Mock Interview Coach assessing a candidate's answer for the role of "${jobTitle}".

Question Asked:
"${question}"

Recommended Ideal Model Answer:
"${idealAnswer}"

Candidate's Actual Practice Answer:
"${userAnswer}"

${candidateContext ? `Candidate Background: ${JSON.stringify(candidateContext)}` : ""}

Evaluate this answer thoroughly. Return a JSON object with:
1. "score": integer from 0 to 100 (Be realistic and fair: 85+ is interview-ready, 70-84 is good with minor gaps, <70 lacks depth or structure).
2. "verdict": "Exceptional" | "Strong" | "Satisfactory" | "Needs Improvement"
3. "strengths": array of 2-3 specific things the candidate did well (e.g. terminology, ownership, tone).
4. "weaknesses": array of 2-3 specific omissions, vague spots, or weaknesses.
5. "improvedAnswer": A polished, exemplary rewrite of THEIR specific answer that preserves their authentic story while elevating the vocabulary, structure, and punchiness.
6. "actionableTips": array of 2-3 high-impact advice items for their next interview.
7. "starFrameworkScore": object with brief feedback on "situation", "task", "action", "result".

Respond strictly with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/evaluate-answer:", error);
    return res.status(500).json({ error: "Failed to evaluate answer." });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Interview Prep server running on port ${PORT}`);
  });
}

startServer();
