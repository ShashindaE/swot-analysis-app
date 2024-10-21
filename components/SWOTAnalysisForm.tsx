"use client"

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Modal from '@/components/Modal';
import { Loader2 } from 'lucide-react';
import OpenAI from 'openai';

// Define the overall form schema using Zod
const formSchema = z.object({
  // Step 1: Essential Profiling
  brandName: z.string().min(1, "Brand name is required"),
  brandLaunchStatus: z.enum(["Yes", "No"]),
  industry: z.enum(["Technology", "Retail", "Healthcare", "Food & Beverage", "Others"]).default("Technology"),
  industryOther: z.string().optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "501+"]),
  marketScope: z.enum(["Local", "Regional", "National", "International"]).default("Local"),
  internationalRegions: z.string().optional(),
  businessModel: z.enum(["B2B", "B2C", "D2C", "Other"]).default("B2B"),
  businessModelOther: z.string().optional(),
  mainGoal: z.enum([
    "Launching the brand",
    "Increasing sales",
    "Expanding into new markets",
    "Enhancing brand awareness",
    "Developing new products/services",
    "Other",
  ]).default("Launching the brand"),
  mainGoalOther: z.string().optional(),

  // Step 2: Dynamic Questions Based on Profiling
  productsServicesOverview: z.string(),
  targetCustomers: z.string(),
  
  // Conditional: If Brand is Not Launched
  launchChallenges: z.array(z.string()).default([]),
  launchChallengesOther: z.string().optional(),
  goToMarketStrategy: z.enum([
    "Social media campaigns",
    "Influencer partnerships",
    "Traditional advertising",
    "Pre-launch events",
    "Other",
  ]).default("Social media campaigns"),
  goToMarketStrategyOther: z.string().optional(),

  // Conditional: If Brand is Already Launched
  marketPosition: z.enum([
    "Market leader",
    "Major competitor",
    "Niche player",
    "Emerging brand",
  ]).default("Market leader"),
  competitors: z.string().optional(),
  competitiveAdvantage: z.string().optional(),
  currentChallenges: z.array(z.string()).default([]),
  currentChallengesOther: z.string().optional(),

  // Conditional: Based on Industry
  regulatoryEnvironment: z.enum(["Yes", "No"]).default("No"),
  regulatoryDetails: z.string().optional(),
  technologicalInnovation: z.string().optional(),
  customerExperience: z.string().optional(),

  // Conditional: Based on Company Size
  resourceNeeds: z.array(z.string()).default([]),
  resourceNeedsOther: z.string().optional(),
  organizationalChallenges: z.array(z.string()).default([]),
  organizationalChallengesOther: z.string().optional(),

  // Conditional: Based on Business Model
  salesCycle: z.enum([
    "Less than 1 month",
    "1-3 months",
    "4-6 months",
    "More than 6 months",
  ]).optional(),
  clientAcquisition: z.string().optional(),
  marketingChannels: z.array(z.string()).default([]),
  marketingChannelsOther: z.string().optional(),
  customerRetention: z.string().optional(),

  // Conditional: Based on Main Goal
  marketResearch: z.enum(["Yes", "No"]).default("No"),
  entryStrategy: z.string().optional(),
  innovationProcess: z.string().optional(),
  customerFeedback: z.enum(["Yes", "No"]).default("No"),

  // Step 3: Identifying Opportunities and Threats
  marketTrends: z.string(),
  externalFactors: z.string(),

  // Step 4: Summary and Additional Comments
  finalThoughts: z.string().optional(),

  // Step 5: Personalized Question
  personalizedQuestion: z.string().min(1, "Please answer this question to help us generate a comprehensive SWOT analysis."),
});

type FormData = z.infer<typeof formSchema>;

export default function SWOTAnalysisForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: "",
      brandLaunchStatus: "Yes",
      industry: "Technology",
      industryOther: "",
      companySize: "1-10",
      marketScope: "Local",
      internationalRegions: "",
      businessModel: "B2B",
      businessModelOther: "",
      mainGoal: "Launching the brand",
      mainGoalOther: "",
      productsServicesOverview: "",
      targetCustomers: "",
      launchChallenges: [],
      launchChallengesOther: "",
      goToMarketStrategy: "Social media campaigns",
      goToMarketStrategyOther: "",
      marketPosition: "Market leader",
      competitors: "",
      competitiveAdvantage: "",
      currentChallenges: [],
      currentChallengesOther: "",
      regulatoryEnvironment: "No",
      regulatoryDetails: "",
      technologicalInnovation: "",
      customerExperience: "",
      resourceNeeds: [],
      resourceNeedsOther: "",
      organizationalChallenges: [],
      organizationalChallengesOther: "",
      salesCycle: undefined,
      clientAcquisition: "",
      marketingChannels: [],
      marketingChannelsOther: "",
      customerRetention: "",
      marketResearch: "No",
      entryStrategy: "",
      innovationProcess: "",
      customerFeedback: "No",
      marketTrends: "",
      externalFactors: "",
      finalThoughts: "",
      personalizedQuestion: "",
    },
  });

  const { handleSubmit, watch, reset } = methods;

  // Watch necessary fields for conditional logic
  const brandLaunchStatus = watch('brandLaunchStatus');
  const industry = watch('industry');
  const companySize = watch('companySize');
  const businessModel = watch('businessModel');
  const mainGoal = watch('mainGoal');

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/swot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch SWOT analysis');
      }

      setAnalysis(data.analysis);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Review />;
      default:
        return <Step1 />;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col items-center w-full p-2">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>SWOT Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressIndicator currentStep={currentStep} />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {renderStep()}
              <div className="flex justify-between">
                {currentStep > 1 && (
                  <Button type="button" onClick={prevStep}>
                    Back
                  </Button>
                )}
                {currentStep < 5 && (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                )}
                {currentStep === 5 && (
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'Generate SWOT Analysis'}
                  </Button>
                )}
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
          </CardContent>
        </Card>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h3 className="text-lg font-semibold mb-4">SWOT Analysis Result:</h3>
          {analysis && formatAnalysis(analysis, methods.getValues().personalizedQuestion)}
          <div className="flex justify-between mt-2 py-5 items-center">
            <Button onClick={() => onSubmit(methods.getValues())}>
              Regenerate Analysis
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      </div>
    </FormProvider>
  );
}

// Step 1: Essential Profiling
const Step1 = () => {
  const { register, watch, formState: { errors } } = useFormContext<FormData>();
  const industry = watch('industry');
  const businessModel = watch('businessModel');
  const mainGoal = watch('mainGoal');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Brand Name</label>
        <Input {...register('brandName')} placeholder="Enter brand or company name" />
        {errors.brandName && <p className="text-red-500 text-sm">{errors.brandName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Brand Launch Status</label>
        <div className="flex items-center space-x-4 mt-1">
          <label className="flex items-center">
            <input type="radio" value="Yes" {...register('brandLaunchStatus')} className="mr-2" />
            Yes
          </label>
          <label className="flex items-center">
            <input type="radio" value="No" {...register('brandLaunchStatus')} className="mr-2" />
            No
          </label>
        </div>
        {errors.brandLaunchStatus && <p className="text-red-500 text-sm">{errors.brandLaunchStatus.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Industry/Sector</label>
        <select {...register('industry')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          <option value="Technology">Technology</option>
          <option value="Retail">Retail</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Food & Beverage">Food & Beverage</option>
          <option value="Others">Others</option>
        </select>
        {errors.industry && <p className="text-red-500 text-sm">{errors.industry.message}</p>}
      </div>

      {industry === "Others" && (
        <div>
          <label className="block text-sm font-medium">Please specify your industry</label>
          <Input {...register('industryOther')} placeholder="Specify industry" />
          {errors.industryOther && <p className="text-red-500 text-sm">{errors.industryOther.message}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Company Size</label>
        <select {...register('companySize')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          <option value="1-10">1-10</option>
          <option value="11-50">11-50</option>
          <option value="51-200">51-200</option>
          <option value="201-500">201-500</option>
          <option value="501+">501+</option>
        </select>
        {errors.companySize && <p className="text-red-500 text-sm">{errors.companySize.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Market Scope</label>
        <select {...register('marketScope')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          <option value="Local">Local</option>
          <option value="Regional">Regional</option>
          <option value="National">National</option>
          <option value="International">International</option>
        </select>
        {errors.marketScope && <p className="text-red-500 text-sm">{errors.marketScope.message}</p>}
      </div>

      {watch('marketScope') === "International" && (
        <div>
          <label className="block text-sm font-medium">Please specify regions</label>
          <Input {...register('internationalRegions')} placeholder="e.g., Europe, Asia" />
          {errors.internationalRegions && <p className="text-red-500 text-sm">{errors.internationalRegions.message}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Business Model</label>
        <select {...register('businessModel')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          <option value="B2B">B2B (Business to Business)</option>
          <option value="B2C">B2C (Business to Consumer)</option>
          <option value="D2C">D2C (Direct to Consumer)</option>
          <option value="Other">Other</option>
        </select>
        {errors.businessModel && <p className="text-red-500 text-sm">{errors.businessModel.message}</p>}
      </div>

      {businessModel === "Other" && (
        <div>
          <label className="block text-sm font-medium">Please specify your business model</label>
          <Input {...register('businessModelOther')} placeholder="Specify business model" />
          {errors.businessModelOther && <p className="text-red-500 text-sm">{errors.businessModelOther.message}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Main Goal/Objectives</label>
        <select {...register('mainGoal')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          <option value="Launching the brand">Launching the brand</option>
          <option value="Increasing sales">Increasing sales</option>
          <option value="Expanding into new markets">Expanding into new markets</option>
          <option value="Enhancing brand awareness">Enhancing brand awareness</option>
          <option value="Developing new products/services">Developing new products/services</option>
          <option value="Other">Other</option>
        </select>
        {errors.mainGoal && <p className="text-red-500 text-sm">{errors.mainGoal.message}</p>}
      </div>

      {mainGoal === "Other" && (
        <div>
          <label className="block text-sm font-medium">Please specify your main goal</label>
          <Input {...register('mainGoalOther')} placeholder="Specify main goal" />
          {errors.mainGoalOther && <p className="text-red-500 text-sm">{errors.mainGoalOther.message}</p>}
        </div>
      )}
    </div>
  );
};

// Step 2: Dynamic Questions Based on Profiling
const Step2 = () => {
  const { register, watch, formState: { errors } } = useFormContext<FormData>();

  const brandLaunchStatus = watch('brandLaunchStatus');
  const industry = watch('industry');
  const companySize = watch('companySize');
  const businessModel = watch('businessModel');
  const mainGoal = watch('mainGoal');

  // Determine which conditional questions to show
  const showLaunchQuestions = brandLaunchStatus === "No";
  const showMarketPosition = brandLaunchStatus === "Yes";
  const isRegulatedIndustry = ["Healthcare", "Finance"].includes(industry);
  const isTechnology = industry === "Technology";
  const isRetailOrFood = ["Retail", "Food & Beverage"].includes(industry);
  const isSmallCompany = companySize === "1-10";
  const isLargeCompany = companySize === "501+";
  const isB2B = businessModel === "B2B";
  const isB2CorD2C = ["B2C", "D2C"].includes(businessModel);
  const isExpanding = mainGoal === "Expanding into new markets";
  const isDeveloping = mainGoal === "Developing new products/services";

  return (
    <div className="space-y-4">
      {/* Common Questions for All Brands */}
      <div>
        <label className="block text-sm font-medium">Products/Services Overview</label>
        <textarea {...register('productsServicesOverview')} placeholder="Provide a brief description of your products or services and what makes them unique." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={4}></textarea>
        {errors.productsServicesOverview && <p className="text-red-500 text-sm">{errors.productsServicesOverview.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Target Customers</label>
        <textarea {...register('targetCustomers')} placeholder="Who are your primary (or intended) customers? (Demographics, interests, needs)" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={4}></textarea>
        {errors.targetCustomers && <p className="text-red-500 text-sm">{errors.targetCustomers.message}</p>}
      </div>

      {/* Conditional Questions Based on Brand Launch Status */}
      {showLaunchQuestions && (
        <>
          <div>
            <label className="block text-sm font-medium">Launch Challenges</label>
            <div className="mt-1">
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Market research" {...register('launchChallenges')} className="form-checkbox" />
                <span className="ml-2">Market research</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Funding" {...register('launchChallenges')} className="form-checkbox" />
                <span className="ml-2">Funding</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Product development" {...register('launchChallenges')} className="form-checkbox" />
                <span className="ml-2">Product development</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Regulatory compliance" {...register('launchChallenges')} className="form-checkbox" />
                <span className="ml-2">Regulatory compliance</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Building a customer base" {...register('launchChallenges')} className="form-checkbox" />
                <span className="ml-2">Building a customer base</span>
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" value="Other" {...register('launchChallenges')} className="form-checkbox" />
                <span className="ml-2">Other</span>
              </label>
            </div>
            {errors.launchChallenges && <p className="text-red-500 text-sm">{errors.launchChallenges.message}</p>}
          </div>

          {/* If 'Other' is checked in Launch Challenges */}
          {watch('launchChallenges')?.includes("Other") && (
            <div>
              <label className="block text-sm font-medium">Please specify other challenges</label>
              <Input {...register('launchChallengesOther')} placeholder="Specify other challenges" />
              {errors.launchChallengesOther && <p className="text-red-500 text-sm">{errors.launchChallengesOther.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Go-to-Market Strategy</label>
            <select {...register('goToMarketStrategy')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="Social media campaigns">Social media campaigns</option>
              <option value="Influencer partnerships">Influencer partnerships</option>
              <option value="Traditional advertising">Traditional advertising</option>
              <option value="Pre-launch events">Pre-launch events</option>
              <option value="Other">Other</option>
            </select>
            {errors.goToMarketStrategy && <p className="text-red-500 text-sm">{errors.goToMarketStrategy.message}</p>}
          </div>

          {watch('goToMarketStrategy') === "Other" && (
            <div>
              <label className="block text-sm font-medium">Please specify your go-to-market strategy</label>
              <Input {...register('goToMarketStrategyOther')} placeholder="Specify strategy" />
              {errors.goToMarketStrategyOther && <p className="text-red-500 text-sm">{errors.goToMarketStrategyOther.message}</p>}
            </div>
          )}
        </>
      )}

      {showMarketPosition && (
        <>
          <div>
            <label className="block text-sm font-medium">Market Position</label>
            <select {...register('marketPosition')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="Market leader">Market leader</option>
              <option value="Major competitor">Major competitor</option>
              <option value="Niche player">Niche player</option>
              <option value="Emerging brand">Emerging brand</option>
            </select>
            {errors.marketPosition && <p className="text-red-500 text-sm">{errors.marketPosition.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Competition</label>
            <textarea {...register('competitors')} placeholder="Who are your main competitors?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
            {errors.competitors && <p className="text-red-500 text-sm">{errors.competitors.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Competitive Advantage</label>
            <textarea {...register('competitiveAdvantage')} placeholder="What sets your brand apart from competitors?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
            {errors.competitiveAdvantage && <p className="text-red-500 text-sm">{errors.competitiveAdvantage.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Current Challenges</label>
            <div className="mt-1">
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Market saturation" {...register('currentChallenges')} className="form-checkbox" />
                <span className="ml-2">Market saturation</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Changing consumer preferences" {...register('currentChallenges')} className="form-checkbox" />
                <span className="ml-2">Changing consumer preferences</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Supply chain issues" {...register('currentChallenges')} className="form-checkbox" />
                <span className="ml-2">Supply chain issues</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Technological advancements" {...register('currentChallenges')} className="form-checkbox" />
                <span className="ml-2">Technological advancements</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Increased competition" {...register('currentChallenges')} className="form-checkbox" />
                <span className="ml-2">Increased competition</span>
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" value="Other" {...register('currentChallenges')} className="form-checkbox" />
                <span className="ml-2">Other</span>
              </label>
            </div>
            {errors.currentChallenges && <p className="text-red-500 text-sm">{errors.currentChallenges.message}</p>}
          </div>

          {/* If 'Other' is checked in Current Challenges */}
          {watch('currentChallenges')?.includes("Other") && (
            <div>
              <label className="block text-sm font-medium">Please specify other challenges</label>
              <Input {...register('currentChallengesOther')} placeholder="Specify other challenges" />
              {errors.currentChallengesOther && <p className="text-red-500 text-sm">{errors.currentChallengesOther.message}</p>}
            </div>
          )}
        </>
      )}

      {/* Conditional Questions Based on Industry */}
      {isRegulatedIndustry && (
        <>
          <div>
            <label className="block text-sm font-medium">Regulatory Environment</label>
            <div className="flex items-center space-x-4 mt-1">
              <label className="flex items-center">
                <input type="radio" value="Yes" {...register('regulatoryEnvironment')} className="mr-2" />
                Yes
              </label>
              <label className="flex items-center">
                <input type="radio" value="No" {...register('regulatoryEnvironment')} className="mr-2" />
                No
              </label>
            </div>
            {errors.regulatoryEnvironment && <p className="text-red-500 text-sm">{errors.regulatoryEnvironment.message}</p>}
          </div>

          {watch('regulatoryEnvironment') === "Yes" && (
            <div>
              <label className="block text-sm font-medium">Please describe the specific regulations or compliance issues</label>
              <textarea {...register('regulatoryDetails')} placeholder="Describe regulations or compliance issues" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
              {errors.regulatoryDetails && <p className="text-red-500 text-sm">{errors.regulatoryDetails.message}</p>}
            </div>
          )}
        </>
      )}

      {isTechnology && (
        <div>
          <label className="block text-sm font-medium">Technological Innovation</label>
          <textarea {...register('technologicalInnovation')} placeholder="How do emerging technologies affect your brand?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
          {errors.technologicalInnovation && <p className="text-red-500 text-sm">{errors.technologicalInnovation.message}</p>}
        </div>
      )}

      {isRetailOrFood && (
        <div>
          <label className="block text-sm font-medium">Customer Experience</label>
          <textarea {...register('customerExperience')} placeholder="How do you engage with customers to enhance their experience?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
          {errors.customerExperience && <p className="text-red-500 text-sm">{errors.customerExperience.message}</p>}
        </div>
      )}

      {/* Conditional Questions Based on Company Size */}
      {isSmallCompany && (
        <div>
          <label className="block text-sm font-medium">Resource Needs</label>
          <div className="mt-1">
            <label className="inline-flex items-center mr-4">
              <input type="checkbox" value="Funding" {...register('resourceNeeds')} className="form-checkbox" />
              <span className="ml-2">Funding</span>
            </label>
            <label className="inline-flex items-center mr-4">
              <input type="checkbox" value="Skilled personnel" {...register('resourceNeeds')} className="form-checkbox" />
              <span className="ml-2">Skilled personnel</span>
            </label>
            <label className="inline-flex items-center mr-4">
              <input type="checkbox" value="Technology" {...register('resourceNeeds')} className="form-checkbox" />
              <span className="ml-2">Technology</span>
            </label>
            <label className="inline-flex items-center mr-4">
              <input type="checkbox" value="Partnerships" {...register('resourceNeeds')} className="form-checkbox" />
              <span className="ml-2">Partnerships</span>
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" value="Other" {...register('resourceNeeds')} className="form-checkbox" />
              <span className="ml-2">Other</span>
            </label>
          </div>
          {errors.resourceNeeds && <p className="text-red-500 text-sm">{errors.resourceNeeds.message}</p>}
        </div>
      )}

      {isSmallCompany && watch('resourceNeeds')?.includes("Other") && (
        <div>
          <label className="block text-sm font-medium">Please specify other resource needs</label>
          <Input {...register('resourceNeedsOther')} placeholder="Specify other resources" />
          {errors.resourceNeedsOther && <p className="text-red-500 text-sm">{errors.resourceNeedsOther.message}</p>}
        </div>
      )}

      {isLargeCompany && (
        <div>
          <label className="block text-sm font-medium">Organizational Challenges</label>
          <div className="mt-1">
            <label className="inline-flex items-center mr-4">
              <input type="checkbox" value="Communication across departments" {...register('organizationalChallenges')} className="form-checkbox" />
              <span className="ml-2">Communication across departments</span>
            </label>
            <label className="inline-flex items-center mr-4">
              <input type="checkbox" value="Change management" {...register('organizationalChallenges')} className="form-checkbox" />
              <span className="ml-2">Change management</span>
            </label>
            <label className="inline-flex items-center mr-4">
              <input type="checkbox" value="Innovation adoption" {...register('organizationalChallenges')} className="form-checkbox" />
              <span className="ml-2">Innovation adoption</span>
            </label>
            <label className="inline-flex items-center mr-4">
              <input type="checkbox" value="Employee engagement" {...register('organizationalChallenges')} className="form-checkbox" />
              <span className="ml-2">Employee engagement</span>
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" value="Other" {...register('organizationalChallenges')} className="form-checkbox" />
              <span className="ml-2">Other</span>
            </label>
          </div>
          {errors.organizationalChallenges && <p className="text-red-500 text-sm">{errors.organizationalChallenges.message}</p>}
        </div>
      )}

      {isLargeCompany && watch('organizationalChallenges')?.includes("Other") && (
        <div>
          <label className="block text-sm font-medium">Please specify other organizational challenges</label>
          <Input {...register('organizationalChallengesOther')} placeholder="Specify other challenges" />
          {errors.organizationalChallengesOther && <p className="text-red-500 text-sm">{errors.organizationalChallengesOther.message}</p>}
        </div>
      )}

      {/* Conditional Questions Based on Business Model */}
      {isB2B && (
        <>
          <div>
            <label className="block text-sm font-medium">Sales Cycle</label>
            <select {...register('salesCycle')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="Less than 1 month">Less than 1 month</option>
              <option value="1-3 months">1-3 months</option>
              <option value="4-6 months">4-6 months</option>
              <option value="More than 6 months">More than 6 months</option>
            </select>
            {errors.salesCycle && <p className="text-red-500 text-sm">{errors.salesCycle.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Client Acquisition</label>
            <textarea {...register('clientAcquisition')} placeholder="What strategies do you use to acquire new clients?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
            {errors.clientAcquisition && <p className="text-red-500 text-sm">{errors.clientAcquisition.message}</p>}
          </div>
        </>
      )}

      {isB2CorD2C && (
        <>
          <div>
            <label className="block text-sm font-medium">Marketing Channels</label>
            <div className="mt-1">
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Social media advertising" {...register('marketingChannels')} className="form-checkbox" />
                <span className="ml-2">Social media advertising</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Email marketing" {...register('marketingChannels')} className="form-checkbox" />
                <span className="ml-2">Email marketing</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Content marketing" {...register('marketingChannels')} className="form-checkbox" />
                <span className="ml-2">Content marketing</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Influencer partnerships" {...register('marketingChannels')} className="form-checkbox" />
                <span className="ml-2">Influencer partnerships</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input type="checkbox" value="Traditional media" {...register('marketingChannels')} className="form-checkbox" />
                <span className="ml-2">Traditional media</span>
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" value="Other" {...register('marketingChannels')} className="form-checkbox" />
                <span className="ml-2">Other</span>
              </label>
            </div>
            {errors.marketingChannels && <p className="text-red-500 text-sm">{errors.marketingChannels.message}</p>}
          </div>

          {watch('marketingChannels')?.includes("Other") && (
            <div>
              <label className="block text-sm font-medium">Please specify other marketing channels</label>
              <Input {...register('marketingChannelsOther')} placeholder="Specify other channels" />
              {errors.marketingChannelsOther && <p className="text-red-500 text-sm">{errors.marketingChannelsOther.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Customer Retention</label>
            <textarea {...register('customerRetention')} placeholder="How do you encourage repeat business from your customers?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
            {errors.customerRetention && <p className="text-red-500 text-sm">{errors.customerRetention.message}</p>}
          </div>
        </>
      )}

      {/* Conditional Questions Based on Main Goal/Objectives */}
      {isExpanding && (
        <>
          <div>
            <label className="block text-sm font-medium">Market Research</label>
            <div className="flex items-center space-x-4 mt-1">
              <label className="flex items-center">
                <input type="radio" value="Yes" {...register('marketResearch')} className="mr-2" />
                Yes
              </label>
              <label className="flex items-center">
                <input type="radio" value="No" {...register('marketResearch')} className="mr-2" />
                No
              </label>
            </div>
            {errors.marketResearch && <p className="text-red-500 text-sm">{errors.marketResearch.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Entry Strategy</label>
            <textarea {...register('entryStrategy')} placeholder="What is your strategy for entering these markets?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
            {errors.entryStrategy && <p className="text-red-500 text-sm">{errors.entryStrategy.message}</p>}
          </div>
        </>
      )}

      {isDeveloping && (
        <>
          <div>
            <label className="block text-sm font-medium">Innovation Process</label>
            <textarea {...register('innovationProcess')} placeholder="How do you approach product/service development?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
            {errors.innovationProcess && <p className="text-red-500 text-sm">{errors.innovationProcess.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Customer Feedback</label>
            <div className="flex items-center space-x-4 mt-1">
              <label className="flex items-center">
                <input type="radio" value="Yes" {...register('customerFeedback')} className="mr-2" />
                Yes
              </label>
              <label className="flex items-center">
                <input type="radio" value="No" {...register('customerFeedback')} className="mr-2" />
                No
              </label>
            </div>
            {errors.customerFeedback && <p className="text-red-500 text-sm">{errors.customerFeedback.message}</p>}
          </div>
        </>
      )}
    </div>
  );
};

// Step 3: Identifying Opportunities and Threats
const Step3 = () => {
  const { register, formState: { errors } } = useFormContext<FormData>();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Market Trends</label>
        <textarea {...register('marketTrends')} placeholder="What current trends in your industry could impact your brand positively or negatively?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={4}></textarea>
        {errors.marketTrends && <p className="text-red-500 text-sm">{errors.marketTrends.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">External Factors</label>
        <textarea {...register('externalFactors')} placeholder="Are there any external factors (economic, social, technological, environmental, legal) that could significantly affect your brand?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={4}></textarea>
        {errors.externalFactors && <p className="text-red-500 text-sm">{errors.externalFactors.message}</p>}
      </div>
    </div>
  );
};

// Step 4: Summary and Additional Comments
const Step4 = () => {
  const { register, formState: { errors } } = useFormContext<FormData>();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Final Thoughts</label>
        <textarea {...register('finalThoughts')} placeholder="Is there anything else you'd like us to know about your brand or its challenges and opportunities?" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={4}></textarea>
        {errors.finalThoughts && <p className="text-red-500 text-sm">{errors.finalThoughts.message}</p>}
      </div>
    </div>
  );
};

// Review Step
const Review = () => {
  const { getValues, register, formState: { errors } } = useFormContext<FormData>();
  const values = getValues();
  const [personalizedQuestionText, setPersonalizedQuestionText] = useState('');

  const handleGenerateQuestion = async () => {
    try {
      const response = await fetch('/api/generateQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (response.ok) {
        setPersonalizedQuestionText(data.personalizedQuestion);
      } else {
        setPersonalizedQuestionText('Failed to generate a question.');
      }
    } catch (error) {
      console.error('Error:', error);
      setPersonalizedQuestionText('An error occurred while generating the question.');
    }
  };

  // Call handleGenerateQuestion when the component mounts or when values change as needed
  // For example, you might call it on a button click

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Review Your Information</h2>
      
      <div>
        <strong>Brand Name:</strong> {values.brandName}
      </div>
      
      <div>
        <strong>Brand Launch Status:</strong> {values.brandLaunchStatus}
      </div>
      
      {values.brandLaunchStatus === "Yes" ? (
        <>
          <div>
            <strong>Products/Services Overview:</strong> {values.productsServicesOverview}
          </div>
          <div>
            <strong>Target Customers:</strong> {values.targetCustomers}
          </div>
          <div>
            <strong>Market Position:</strong> {values.marketPosition}
          </div>
          <div>
            <strong>Competitors:</strong> {values.competitors}
          </div>
          <div>
            <strong>Competitive Advantage:</strong> {values.competitiveAdvantage}
          </div>
          <div>
            <strong>Current Challenges:</strong> {values.currentChallenges.join(', ')}
            {values.currentChallenges.includes("Other") && `, ${values.currentChallengesOther}`}
          </div>
        </>
      ) : (
        <>
          <div>
            <strong>Products/Services Overview:</strong> {values.productsServicesOverview}
          </div>
          <div>
            <strong>Target Customers:</strong> {values.targetCustomers}
          </div>
          <div>
            <strong>Launch Challenges:</strong> {values.launchChallenges.join(', ')}
            {values.launchChallenges.includes("Other") && `, ${values.launchChallengesOther}`}
          </div>
          <div>
            <strong>Go-to-Market Strategy:</strong> {values.goToMarketStrategy}
            {values.goToMarketStrategy === "Other" && `, ${values.goToMarketStrategyOther}`}
          </div>
        </>
      )}

      {/* Conditional Review Based on Industry */}
      {["Healthcare", "Finance"].includes(values.industry) && (
        <>
          <div>
            <strong>Regulatory Environment:</strong> {values.regulatoryEnvironment}
          </div>
          {values.regulatoryEnvironment === "Yes" && (
            <div>
              <strong>Regulatory Details:</strong> {values.regulatoryDetails}
            </div>
          )}
        </>
      )}

      {values.industry === "Technology" && (
        <div>
          <strong>Technological Innovation:</strong> {values.technologicalInnovation}
        </div>
      )}

      {["Retail", "Food & Beverage"].includes(values.industry) && (
        <div>
          <strong>Customer Experience:</strong> {values.customerExperience}
        </div>
      )}

      {/* Conditional Review Based on Company Size */}
      {values.companySize === "1-10" && (
        <div>
          <strong>Resource Needs:</strong> {values.resourceNeeds.join(', ')}
          {values.resourceNeeds.includes("Other") && `, ${values.resourceNeedsOther}`}
        </div>
      )}

      {values.companySize === "501+" && (
        <div>
          <strong>Organizational Challenges:</strong> {values.organizationalChallenges.join(', ')}
          {values.organizationalChallenges.includes("Other") && `, ${values.organizationalChallengesOther}`}
        </div>
      )}

      {/* Conditional Review Based on Business Model */}
      {values.businessModel === "B2B" && (
        <>
          <div>
            <strong>Sales Cycle:</strong> {values.salesCycle || "N/A"}
          </div>
          <div>
            <strong>Client Acquisition:</strong> {values.clientAcquisition || "N/A"}
          </div>
        </>
      )}

      {["B2C", "D2C"].includes(values.businessModel) && (
        <>
          <div>
            <strong>Marketing Channels:</strong> {values.marketingChannels.join(', ')}
            {values.marketingChannels.includes("Other") && `, ${values.marketingChannelsOther}`}
          </div>
          <div>
            <strong>Customer Retention:</strong> {values.customerRetention || "N/A"}
          </div>
        </>
      )}

      {/* Conditional Review Based on Main Goal/Objectives */}
      {values.mainGoal === "Expanding into new markets" && (
        <>
          <div>
            <strong>Market Research:</strong> {values.marketResearch}
          </div>
          <div>
            <strong>Entry Strategy:</strong> {values.entryStrategy || "N/A"}
          </div>
        </>
      )}

      {values.mainGoal === "Developing new products/services" && (
        <>
          <div>
            <strong>Innovation Process:</strong> {values.innovationProcess || "N/A"}
          </div>
          <div>
            <strong>Customer Feedback:</strong> {values.customerFeedback}
          </div>
        </>
      )}

      <div>
        <strong>Market Trends:</strong> {values.marketTrends}
      </div>
      <div>
        <strong>External Factors:</strong> {values.externalFactors}
      </div>

      <div>
        <strong>Final Thoughts:</strong> {values.finalThoughts || "N/A"}
      </div>

      {/* Personalized Question */}
      <div>
        <button onClick={handleGenerateQuestion} className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Generate Personalized Question
        </button>
      </div>
      
      {personalizedQuestionText && (
        <>
          <div>
            <label className="block text-sm font-medium">{personalizedQuestionText}</label>
            <textarea
              {...register('personalizedQuestion', { required: true })}
              placeholder="Your response"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows={4}
            ></textarea>
            {errors.personalizedQuestion && <p className="text-red-500 text-sm">{errors.personalizedQuestion.message}</p>}
          </div>
        </>
      )}
    </div>
  );
};

// Utility function to format SWOT analysis
function formatAnalysis(text: string, personalizedResponse: string) {
  if (!text) {
    return <p className="text-red-500">No analysis available.</p>;
  }

  const sections = text.split('---').map(section => section.trim());

  const [
    strengths = "Not provided.",
    weaknesses = "Not provided.",
    opportunities = "Not provided.",
    threats = "Not provided.",
    actionPlan = "Not provided."
  ] = sections;

  const formatSection = (content: string) => {
    return content.split('/').map((item, index) => (
      <React.Fragment key={index}>
        {item.trim()}
        {index < content.split('/').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const sectionClass = "p-4 border rounded-lg transition-all duration-300 hover:shadow-lg hover:border-blue-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={sectionClass}>
        <h4 className="font-semibold mb-2">Strengths</h4>
        <p>{formatSection(strengths)}</p>
      </div>
      <div className={sectionClass}>
        <h4 className="font-semibold mb-2">Weaknesses</h4>
        <p>{formatSection(weaknesses)}</p>
      </div>
      <div className={sectionClass}>
        <h4 className="font-semibold mb-2">Opportunities</h4>
        <p>{formatSection(opportunities)}</p>
      </div>
      <div className={sectionClass}>
        <h4 className="font-semibold mb-2">Threats</h4>
        <p>{formatSection(threats)}</p>
      </div>
      <div className={`${sectionClass} col-span-full`}>
        <h4 className="font-semibold mb-2">Action Plan</h4>
        <p>{formatSection(actionPlan)}</p>
      </div>
      {personalizedResponse && (
        <div className={`${sectionClass} col-span-full`}>
          <h4 className="font-semibold mb-2">Additional Insights:</h4>
          <p>{personalizedResponse}</p>
        </div>
      )}
    </div>
  );
}

// Progress Indicator Component
const ProgressIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ["Essential Profiling", "Dynamic Questions", "Opportunities & Threats", "Summary", "Review"];

  return (
    <div className="flex justify-between mb-6">
      {steps.map((step, index) => (
        <div key={index} className="flex-1 flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep > index + 1 ? 'bg-green-500 text-white' :
              currentStep === index + 1 ? 'bg-blue-500 text-white' :
              'bg-gray-300 text-gray-700'
            }`}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && <div className={`flex-1 h-1 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>}
        </div>
      ))}
    </div>
  );
};
