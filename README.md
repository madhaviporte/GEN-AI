# InterviewSage

InterviewSage is a web application that I built to make interview preparation a little easier for job seekers.

The idea behind this project is simple. Instead of spending hours figuring out what to study for a particular role, users can paste a job description and upload their resume (or simply write a short self-description). Based on that information, the application generates a personalized interview preparation plan using AI.

It highlights missing skills, creates technical and behavioral interview questions, and even generates an ATS-friendly resume that matches the target job.

---

## Features

- User Signup & Login
- Secure JWT Authentication
- Resume Upload (PDF)
- Option to use Self Description instead of a Resume
- Job Description Analysis
- AI-generated Interview Questions
- Skill Gap Analysis
- Personalized Preparation Plan
- ATS-friendly Resume Generation
- Download Resume as PDF
- View Previously Generated Reports

---

## Built With

**Frontend**
- React.js
- SCSS
- React Router
- Axios

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB

**Authentication**
- JWT
- Token Blacklisting

**AI**
- Google Gemini API

**Other Libraries**
- Multer
- PDF Parser
- Puppeteer

---

## How to Run

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

Run the backend

```bash
npm run dev
```

Run the frontend

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the Backend folder.

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## Why I Built This

I wanted to build something that combines Full Stack Development with Generative AI in a practical way. Instead of creating a basic CRUD project, I wanted to solve a real problem that many students and job seekers face while preparing for interviews.

Working on this project helped me understand authentication, file uploads, AI integration, prompt engineering, PDF generation, and how to structure a full-stack application.

---

## Future Improvements

- AI Mock Interviews
- Voice-based Interview Practice
- Interview Performance Tracking
- Company-specific Interview Preparation
- Better Resume Templates

---

## Author

**Madhavi Porte**

Thanks for checking out the project. If you found it useful, feel free to give it a ⭐.
