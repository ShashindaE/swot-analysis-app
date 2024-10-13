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
    return NextResponse.json({ error: "Azure OpenAI API key not configured. Please set the AZURE_OPENAI_API_KEY environment variable." }, { status: 500 });
  }

  try {
    const { business, country, industry } = await req.json();

    const completion = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
      messages: [
        {
          role: "system",
          content: "You are a business analyst expert. Provide a concise SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis based on the given information."
        },
        {
          role: "user",
          content: `Perform a SWOT analysis for a ${industry} business named "${business}" operating in ${country}. Then provide a concise summary of the analysis and the key takeaways with an action plan.`
        }
      ],
      max_tokens: 1500,
    });

    const analysis = completion.choices[0].message.content;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    return NextResponse.json({ error: "An error occurred during the SWOT analysis. Please check your Azure OpenAI API key and try again." }, { status: 500 });
  }
}
