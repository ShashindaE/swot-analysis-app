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
    const data = await req.json();

    // Destructure all necessary fields from the form data
    const {
      brandName,
      brandLaunchStatus,
      industry,
      industryOther,
      companySize,
      marketScope,
      internationalRegions,
      businessModel,
      businessModelOther,
      mainGoal,
      mainGoalOther,
      productsServicesOverview,
      targetCustomers,
      launchChallenges,
      launchChallengesOther,
      goToMarketStrategy,
      goToMarketStrategyOther,
      marketPosition,
      competitors,
      competitiveAdvantage,
      currentChallenges,
      currentChallengesOther,
      regulatoryEnvironment,
      regulatoryDetails,
      technologicalInnovation,
      customerExperience,
      resourceNeeds,
      resourceNeedsOther,
      organizationalChallenges,
      organizationalChallengesOther,
      salesCycle,
      clientAcquisition,
      marketingChannels,
      marketingChannelsOther,
      customerRetention,
      marketResearch,
      entryStrategy,
      innovationProcess,
      customerFeedback,
      marketTrends,
      externalFactors,
      finalThoughts,
    } = data;

    // Construct the prompt based on the form data
    let prompt = `Analyze the following business context and provide a SWOT analysis:\n\nBrand Name: ${brandName}\nBrand Launch Status: ${brandLaunchStatus}\n`;

    // Add industry details
    prompt += `Industry/Sector: ${industry}${industry === "Others" ? ` - ${industryOther}` : ''}\n`;
    prompt += `Company Size: ${companySize}\n`;
    prompt += `Market Scope: ${marketScope}${marketScope === "International" ? ` - ${internationalRegions}` : ''}\n`;
    prompt += `Business Model: ${businessModel}${businessModel === "Other" ? ` - ${businessModelOther}` : ''}\n`;
    prompt += `Main Goal/Objectives: ${mainGoal}${mainGoal === "Other" ? ` - ${mainGoalOther}` : ''}\n\n`;
    prompt += `Products/Services Overview: ${productsServicesOverview}\n`;
    prompt += `Target Customers: ${targetCustomers}\n`;

    if (brandLaunchStatus === "No") {
      prompt += `Launch Challenges: ${launchChallenges.join(', ')}${launchChallenges.includes("Other") ? ` - ${launchChallengesOther}` : ''}\n`;
      prompt += `Go-to-Market Strategy: ${goToMarketStrategy}${goToMarketStrategy === "Other" ? ` - ${goToMarketStrategyOther}` : ''}\n`;
    } else {
      prompt += `Market Position: ${marketPosition}\n`;
      prompt += `Competitors: ${competitors}\n`;
      prompt += `Competitive Advantage: ${competitiveAdvantage}\n`;
      prompt += `Current Challenges: ${currentChallenges.join(', ')}${currentChallenges.includes("Other") ? ` - ${currentChallengesOther}` : ''}\n`;
    }

    // Industry-specific questions
    if (["Healthcare", "Finance"].includes(industry)) {
      prompt += `Regulatory Environment: ${regulatoryEnvironment}\n`;
      if (regulatoryEnvironment === "Yes") {
        prompt += `Regulatory Details: ${regulatoryDetails}\n`;
      }
    }

    if (industry === "Technology") {
      prompt += `Technological Innovation: ${technologicalInnovation}\n`;
    }

    if (["Retail", "Food & Beverage"].includes(industry)) {
      prompt += `Customer Experience: ${customerExperience}\n`;
    }

    // Company size specific
    if (companySize === "1-10") {
      prompt += `Resource Needs: ${resourceNeeds.join(', ')}${resourceNeeds.includes("Other") ? ` - ${resourceNeedsOther}` : ''}\n`;
    }

    if (companySize === "501+") {
      prompt += `Organizational Challenges: ${organizationalChallenges.join(', ')}${organizationalChallenges.includes("Other") ? ` - ${organizationalChallengesOther}` : ''}\n`;
    }

    // Business model specific
    if (businessModel === "B2B") {
      prompt += `Sales Cycle: ${salesCycle}\n`;
      prompt += `Client Acquisition: ${clientAcquisition}\n`;
    }

    if (["B2C", "D2C"].includes(businessModel)) {
      prompt += `Marketing Channels: ${marketingChannels.join(', ')}${marketingChannels.includes("Other") ? ` - ${marketingChannelsOther}` : ''}\n`;
      prompt += `Customer Retention: ${customerRetention}\n`;
    }

    // Main goal/objective specific
    if (mainGoal === "Expanding into new markets") {
      prompt += `Market Research: ${marketResearch}\n`;
      prompt += `Entry Strategy: ${entryStrategy}\n`;
    }

    if (mainGoal === "Developing new products/services") {
      prompt += `Innovation Process: ${innovationProcess}\n`;
      prompt += `Customer Feedback: ${customerFeedback}\n`;
    }

    // Step 3: Opportunities and Threats
    prompt += `\nMarket Trends: ${marketTrends}\n`;
    prompt += `External Factors: ${externalFactors}\n\n`;

    prompt += `
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
The following rule is important and must be strictly followed: Do not add Strengths:, Weaknesses:, Opportunities:, Threats:, or Action Plan: headers at the beginning of each section. Add '/' after each line. Number each line.
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

    const analysis = completion.choices[0].message?.content;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    return NextResponse.json(
      { error: "An error occurred during the SWOT analysis. Please check your Azure OpenAI API key and try again." },
      { status: 500 }
    );
  }
}
