const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})
// console.log("KEY:", process.env.GOOGLE_GENAI_API_KEY.substring(0, 15));

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


const interviewReportSchema = z.object({
    title: z.string().describe("The professional job title inferred from the job description (e.g., 'Senior Software Engineer')"),
    matchScore: z.number().min(0).max(100).describe("A score between 0 and 100 indicating how well the candidate's profile matches the job"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question that can be asked in the interview"),
        intention: z.string().describe("Why the interviewer is asking this question"),
        answer: z.string().describe("A suggested high-quality answer covering key technical aspects")
    })).describe("List of at least 8 relevant technical questions"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question (e.g., STAR method)"),
        intention: z.string().describe("The competency being tested (e.g., leadership, teamwork)"),
        answer: z.string().describe("Guidelines for a strong behavioral response")
    })).describe("List of at least 5 relevant behavioral questions"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The specific skill or technology the candidate lacks"),
        severity: z.enum(["low", "medium", "high"]).describe("How critical this gap is for the role")
    })).describe("Identified at least 3 gaps between candidate profile and job requirements"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("Day number in the study plan (1 to 7)"),
        focus: z.string().describe("Primary topic for this day"),
        tasks: z.array(z.string()).describe("Specific actionable tasks for preparation (at least 2 tasks per day)")
    })).describe("A structured preparation roadmap for exactly 7 days"),
})

/**
 * Sanitizes and validates the AI response against the required schema.
 * Ensures that all required fields are present, types are correct, and counts are met.
 */
function sanitizeInterviewReport(data, jobDescription = "") {
    const sanitized = {};

    // 1. Title Sanitization
    sanitized.title = (typeof data.title === 'string' && data.title.trim().length > 0)
        ? data.title.trim()
        : (jobDescription.split('\n')[0] || "Interview Preparation Report").substring(0, 100);

    // 2. MatchScore Normalization
    sanitized.matchScore = (typeof data.matchScore === 'number' && !isNaN(data.matchScore))
        ? Math.min(100, Math.max(0, Math.round(data.matchScore)))
        : 75; // Default sensible score

    // 3. Technical Questions (At least 8)
    sanitized.technicalQuestions = (Array.isArray(data.technicalQuestions) ? data.technicalQuestions : [])
        .filter(q => q && typeof q === 'object')
        .map(q => ({
            question: String(q.question || "Technical Concept Question"),
            intention: String(q.intention || "Assess fundamental understanding"),
            answer: String(q.answer || "Answer depends on specific context; refer to official documentation.")
        }));
    
    // Pad if fewer than 8
    while (sanitized.technicalQuestions.length < 8) {
        sanitized.technicalQuestions.push({
            question: "Additional Technical Topic",
            intention: "Assess breadth of knowledge",
            answer: "Review core principles related to the job role."
        });
    }

    // 4. Behavioral Questions (At least 5)
    sanitized.behavioralQuestions = (Array.isArray(data.behavioralQuestions) ? data.behavioralQuestions : [])
        .filter(q => q && typeof q === 'object')
        .map(q => ({
            question: String(q.question || "Behavioral Scenario"),
            intention: String(q.intention || "Assess soft skills and cultural fit"),
            answer: String(q.answer || "Use the STAR (Situation, Task, Action, Result) method to answer.")
        }));

    // Pad if fewer than 5
    while (sanitized.behavioralQuestions.length < 5) {
        sanitized.behavioralQuestions.push({
            question: "General Workplace Scenario",
            intention: "Assess adaptability and teamwork",
            answer: "Reflect on a past situation where you demonstrated core professional competencies."
        });
    }

    // 5. Skill Gaps (At least 3)
    const validSeverities = ["low", "medium", "high"];
    sanitized.skillGaps = (Array.isArray(data.skillGaps) ? data.skillGaps : [])
        .filter(s => s && typeof s === 'object')
        .map(s => ({
            skill: String(s.skill || "Specific Industry Tool/Skill"),
            severity: validSeverities.includes(s.severity) ? s.severity : "medium"
        }));

    // Pad if fewer than 3
    while (sanitized.skillGaps.length < 3) {
        sanitized.skillGaps.push({
            skill: "Advanced Industry Knowledge",
            severity: "low"
        });
    }

    // 6. Preparation Plan (Exactly 7 days)
    const rawPlan = (Array.isArray(data.preparationPlan) ? data.preparationPlan : [])
        .filter(p => p && typeof p === 'object');
    
    sanitized.preparationPlan = [];
    for (let i = 1; i <= 7; i++) {
        const existingDay = rawPlan.find(p => p.day === i);
        sanitized.preparationPlan.push({
            day: i,
            focus: existingDay ? String(existingDay.focus || `Preparation Focus Day ${i}`) : `Topic Review Day ${i}`,
            tasks: (existingDay && Array.isArray(existingDay.tasks) && existingDay.tasks.length > 0)
                ? existingDay.tasks.map(String)
                : ["Review relevant documentation", "Practice coding/behavioral questions"]
        });
    }

    return sanitized;
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    console.log(`[AI SERVICE] Starting interview report generation for job description (length: ${jobDescription?.length || 0})`);
    
    const prompt = `
        As a world-class Technical Recruiter and Career Coach, generate a comprehensive, high-fidelity Interview Preparation Report.
        
        ### CONTEXT:
        - RESUME: ${resume}
        - SELF-DESCRIPTION: ${selfDescription}
        - JOB DESCRIPTION: ${jobDescription}

        ### MANDATORY QUANTITATIVE REQUIREMENTS:
        1. **technicalQuestions**: EXACTLY 8 or more highly relevant technical questions based on the job requirements and candidate gaps.
        2. **behavioralQuestions**: EXACTLY 5 or more behavioral questions using the STAR method format.
        3. **skillGaps**: EXACTLY 3 or more specific areas where the candidate needs improvement.
        4. **preparationPlan**: EXACTLY 7 entries representing a day-by-day roadmap (Day 1 to 7).

        ### DATA QUALITY RULES:
        - **title**: Extract the most accurate job title from the job description.
        - **matchScore**: An integer (0-100) reflecting how well the resume aligns with the job description.
        - **technicalQuestions**: Each must have a 'question', 'intention' (why it's asked), and a detailed 'answer'.
        - **behavioralQuestions**: Each must have a 'question', 'intention' (competency being measured), and a detailed 'answer' guideline.
        - **skillGaps**: Each must identify a specific 'skill' and a 'severity' (low, medium, high).
        - **preparationPlan**: Each entry must have 'day' (number), 'focus' (topic), and a 'tasks' (array of at least 2 strings).

        ### OUTPUT FORMAT:
        - You MUST return a valid JSON object.
        - Do NOT include any markdown formatting like \`\`\`json.
        - Do NOT include any introductory or concluding text.
        - Ensure field names match EXACTLY: title, matchScore, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan.
    `;

    let retries = 2; // Reduced from 3 to minimize amplification
    let delay = 3000; // Increased base delay

    while (retries >= 0) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash", 
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: zodToJsonSchema(interviewReportSchema),
                }
            });

            const rawText = response.text;
            if (!rawText) {
                throw new Error("AI returned an empty response");
            }

            let data;
            try {
                const jsonText = rawText.replace(/```json|```/g, "").trim();
                data = JSON.parse(jsonText);
            } catch (parseError) {
                console.error("[AI SERVICE] JSON Parse Error:", parseError.message);
                throw new Error("Failed to parse AI response as valid JSON");
            }

            const validatedData = sanitizeInterviewReport(data, jobDescription);

            console.log(`[AI SERVICE] Successfully generated and validated report: "${validatedData.title}"`);
            return validatedData;

        } catch (err) {
            const statusCode = err.status || (err.message && err.message.includes("429") ? 429 : (err.message && err.message.includes("503") ? 503 : 500));
            const isRetryable = statusCode === 429 || statusCode === 503;
            
            if (isRetryable && retries > 0) {
                console.warn(`[AI SERVICE] Retryable error (Status: ${statusCode}). Retrying in ${delay}ms... (${retries} left)`);
                await sleep(delay);
                retries--;
                delay *= 2;
                continue;
            }


            console.error(`[AI SERVICE] Terminal Error (Status: ${statusCode}):`, err.message || err);
            
            // Attach status to error object for the global error handler
            err.status = statusCode;
            throw err;
        }
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })

    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }