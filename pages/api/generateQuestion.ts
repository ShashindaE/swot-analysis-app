import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  if (!process.env.AZURE_OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Azure OpenAI API key not configured. Please set the AZURE_OPENAI_API_KEY environment variable."
    });
  }

  try {
    const userInputs = req.body;
    const prompt = generatePrompt(userInputs);

    const response = await openai.chat.completions.create({
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
      temperature: 0.7,
    });

    const personalizedQuestion = response.choices[0].message?.content?.trim();

    res.status(200).json({ personalizedQuestion });
  } catch (error: any) {
    console.error('Error generating personalized question:', error);
    res.status(500).json({ error: 'Failed to generate personalized question.' });
  }
}

function generatePrompt(inputs: any): string {
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
  } = inputs;

  return `Based on the following information, generate a personalized question for the user:

Brand Name: ${brandName}
Brand Launch Status: ${brandLaunchStatus}
Industry: ${industry}${industry === "Others" ? ` - ${industryOther}` : ''}
Company Size: ${companySize}
Market Scope: ${marketScope}${marketScope === "International" ? ` - ${internationalRegions}` : ''}
Business Model: ${businessModel}${businessModel === "Other" ? ` - ${businessModelOther}` : ''}
Main Goal/Objectives: ${mainGoal}${mainGoal === "Other" ? ` - ${mainGoalOther}` : ''}
Products/Services Overview: ${productsServicesOverview}
Target Customers: ${targetCustomers}
Launch Challenges: ${launchChallenges.join(', ')}${launchChallenges.includes("Other") ? ` - ${launchChallengesOther}` : ''}
Go-to-Market Strategy: ${goToMarketStrategy}${goToMarketStrategy === "Other" ? ` - ${goToMarketStrategyOther}` : ''}
Market Position: ${marketPosition}
Competitors: ${competitors}
Competitive Advantage: ${competitiveAdvantage}
Current Challenges: ${currentChallenges.join(', ')}${currentChallenges.includes("Other") ? ` - ${currentChallengesOther}` : ''}
Regulatory Environment: ${regulatoryEnvironment}
Regulatory Details: ${regulatoryDetails}
Technological Innovation: ${technologicalInnovation}
Customer Experience: ${customerExperience}
Resource Needs: ${resourceNeeds.join(', ')}${resourceNeeds.includes("Other") ? ` - ${resourceNeedsOther}` : ''}
Organizational Challenges: ${organizationalChallenges.join(', ')}${organizationalChallenges.includes("Other") ? ` - ${organizationalChallengesOther}` : ''}
Sales Cycle: ${salesCycle}
Client Acquisition: ${clientAcquisition}
Marketing Channels: ${marketingChannels.join(', ')}${marketingChannels.includes("Other") ? ` - ${marketingChannelsOther}` : ''}
Customer Retention: ${customerRetention}
Market Research: ${marketResearch}
Entry Strategy: ${entryStrategy}
Innovation Process: ${innovationProcess}
Customer Feedback: ${customerFeedback}
Market Trends: ${marketTrends}
External Factors: ${externalFactors}
Final Thoughts: ${finalThoughts}

Question:`;
}
