import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
});

export async function POST(req: Request) {
  if (!process.env.AZURE_OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Azure OpenAI API key not configured. Please set the AZURE_OPENAI_API_KEY environment variable." },
      { status: 500 }
    );
  }

  try {
    const { business, country, industry, challenges, vision } = await req.json();

    const prompt = `
Analyze the business context below and provide a SWOT analysis:

Business Name: ${business}
Country: ${country}
Industry: ${industry}
Current Challenges: ${challenges}
Goals and Vision: ${vision}

Provide the response in the following format:
Strengths:
---
Weaknesses:
---
Opportunities:
---
Threats:
---
Action Plan:
---
`;

    const completion = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
      messages: [
        {
          role: "system",
          content: "You are a business analyst expert. Provide a concise SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis based on the given information. Use '---' to separate each section without including headers or additional text. Don't use Headers like 'Strengths', 'Weaknesses', 'Opportunities', 'Threats', etc. After the SWOT analysis, provide an action plan based on the analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
    });

    const analysis = completion.choices[0].message.content;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    return NextResponse.json(
      { error: "An error occurred during the SWOT analysis. Please check your Azure OpenAI API key and try again." },
      { status: 500 }
    );
  }
}
