# Interview Synthesizer

A B2B user research tool that transforms raw interview notes into structured themes, verbatim quotes, and "How might we" prompts — with cross-interview synthesis across multiple sessions.

## Deploy in 10 minutes

### 1. Push to GitHub
Create a new GitHub repo and push this folder to it.

### 2. Deploy on Vercel (free)
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project" → import your repo
3. Framework preset: **Vite**
4. Add environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: your Anthropic API key (from [aistudio.google.com/apikey](https://aistudio.google.com/apikey))
5. Click Deploy

That's it. Vercel gives you a public URL like `your-project.vercel.app`.

### Local development
```bash
npm install
# Create .env.local with: GEMINI_API_KEY=your_key_here
npm run dev
```

For local dev, the Vercel serverless function won't run with `vite dev`. 
Install Vercel CLI for full local testing:
```bash
npm i -g vercel
vercel dev
```

## What it does

- **Single interview synthesis**: Paste raw notes → get themes, quotes, HMW prompts
- **Cross-interview synthesis**: Add 2+ sessions → themes consolidate across all interviews, frequency surfaces, contradictions flagged
- **Context tagging**: Role, company size, use case per interview
- **Notion export**: One-click copy as formatted markdown

## Portfolio notes

Built with React + Vite + Vercel serverless functions. API key secured server-side — never exposed to the browser.

The core PM insight: most synthesis tools summarize. This one structures. The output maps directly to the artifacts a B2B SaaS PM needs: themes for roadmap prioritization, quotes for stakeholder buy-in, HMW for design sprints.
