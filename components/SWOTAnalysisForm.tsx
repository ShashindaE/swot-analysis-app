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
  brandName: z.string().min(1, "Brand name is required"),
  brandLaunchStatus: z.string().min(1, "Brand launch status is required"),
  industry: z.string().min(1, "Industry is required"),
  industryOther: z.string().optional(),
  companySize: z.string().min(1, "Company size is required"),
  businessModel: z.string().min(1, "Business model is required"),
  businessModelOther: z.string().optional(),
  mainGoal: z.string().min(1, "Main goal is required"),
  mainGoalOther: z.string().optional(),
  productsServicesOverview: z.string().min(1, "Products/Services Overview is required"),
  targetCustomers: z.string().min(1, "Target Customers is required"),
  launchChallenges: z.array(z.string()).min(1, "At least one Launch Challenge is required"),
  launchChallengesOther: z.string().optional(),
  goToMarketStrategy: z.string().min(1, "Go-to-Market Strategy is required"),
  goToMarketStrategyOther: z.string().optional(),
  marketPosition: z.string().min(1, "Market Position is required"),
  competitors: z.string().min(1, "Competitors are required"),
  competitiveAdvantage: z.string().min(1, "Competitive Advantage is required"),
  currentChallenges: z.array(z.string()).min(1, "At least one Current Challenge is required"),
  currentChallengesOther: z.string().optional(),
  regulatoryEnvironment: z.string().min(1, "Regulatory Environment is required"),
  regulatoryDetails: z.string().optional(),
  technologicalInnovation: z.string().min(1, "Technological Innovation is required"),
  customerExperience: z.string().min(1, "Customer Experience is required"),
  resourceNeeds: z.array(z.string()).min(1, "At least one Resource Need is required"),
  resourceNeedsOther: z.string().optional(),
  organizationalChallenges: z.array(z.string()).min(1, "At least one Organizational Challenge is required"),
  organizationalChallengesOther: z.string().optional(),
  salesCycle: z.string().optional(),
  clientAcquisition: z.string().optional(),
  marketingChannels: z.array(z.string()).min(1, "At least one Marketing Channel is required"),
  marketingChannelsOther: z.string().optional(),
  customerRetention: z.string().optional(),
  marketResearch: z.string().min(1, "Market Research is required"),
  entryStrategy: z.string().optional(),
  innovationProcess: z.string().optional(),
  customerFeedback: z.string().min(1, "Customer Feedback is required"),
  marketTrends: z.string().min(1, "Market Trends is required"),
  externalFactors: z.string().min(1, "External Factors is required"),
  finalThoughts: z.string().optional(),
  personalizedQuestion: z.string().min(1, "Please answer this question to help us generate a comprehensive SWOT analysis."),
});

type FormData = z.infer<typeof formSchema>;

export default function SWOTAnalysisForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: "",
      brandLaunchStatus: "",
      industry: "",
      industryOther: "",
      companySize: "",
      businessModel: "",
      businessModelOther: "",
      mainGoal: "",
      mainGoalOther: "",
      productsServicesOverview: "",
      targetCustomers: "",
      launchChallenges: [],
      launchChallengesOther: "",
      goToMarketStrategy: "",
      goToMarketStrategyOther: "",
      marketPosition: "",
      competitors: "",
      competitiveAdvantage: "",
      currentChallenges: [],
      currentChallengesOther: "",
      regulatoryEnvironment: "",
      regulatoryDetails: "",
      technologicalInnovation: "",
      customerExperience: "",
      resourceNeeds: [],
      resourceNeedsOther: "",
      organizationalChallenges: [],
      organizationalChallengesOther: "",
      salesCycle: "",
      clientAcquisition: "",
      marketingChannels: [],
      marketingChannelsOther: "",
      customerRetention: "",
      marketResearch: "",
      entryStrategy: "",
      innovationProcess: "",
      customerFeedback: "",
      marketTrends: "",
      externalFactors: "",
      finalThoughts: "",
      personalizedQuestion: "",
    },
  });

  const { handleSubmit, watch, reset, getValues, setValue, formState: { errors } } = methods;

  // Watch necessary fields for conditional logic
  const industry = watch('industry');
  const businessModel = watch('businessModel');
  const mainGoal = watch('mainGoal');
  const launchChallenges = watch('launchChallenges');
  const goToMarketStrategy = watch('goToMarketStrategy');
  const currentChallenges = watch('currentChallenges');
  const resourceNeeds = watch('resourceNeeds');
  const organizationalChallenges = watch('organizationalChallenges');
  const marketingChannels = watch('marketingChannels');

  const onSubmit = async (values: FormData) => {
    console.log("Submitting SWOT Analysis with values:", values);
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

      console.log("API Response Status:", response.status);

      const data = await response.json();
      console.log("SWOT Analysis Data Received:", data);

      if (!response.ok) {
        console.error("API Error:", data.error);
        throw new Error(data.error || 'Failed to fetch SWOT analysis');
      }

      setAnalysis(data.analysis);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error during SWOT Analysis submission:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 4) {
      // Before moving to step 5, generate the personalized question
      setQuestionLoading(true);
      setQuestionError(null);
      try {
        const response = await fetch('/api/generateQuestion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(getValues()),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate personalized question');
        }

        setValue('personalizedQuestion', data.personalizedQuestion);
      } catch (error) {
        console.error('Error generating personalized question:', error);
        setQuestionError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setQuestionLoading(false);
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

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
        return <Review questionLoading={questionLoading} questionError={questionError} />;
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
                  <Button type="button" onClick={nextStep} disabled={questionLoading}>
                    {currentStep === 4 && questionLoading ? <Loader2 className="animate-spin" /> : 'Next'}
                  </Button>
                )}
                {currentStep === 5 && (
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'Generate SWOT Analysis'}
                  </Button>
                )}
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {questionError && <p className="text-red-500 mt-2">{questionError}</p>}
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

// Step 1 Component
const Step1 = () => {
  const { register, formState: { errors } } = useFormContext<FormData>();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Brand Name</label>
        <Input {...register('brandName')} placeholder="Enter your brand name" />
        {errors.brandName && <p className="text-red-500 text-sm">{errors.brandName.message}</p>}
      </div>
      {/* Add other fields for Step 1 as needed */}
    </div>
  );
};

// Step 2 Component
const Step2 = () => {
  const { register, watch, formState: { errors } } = useFormContext<FormData>();
  const industry = watch('industry');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Industry</label>
        <Input {...register('industry')} placeholder="Enter your industry" />
        {errors.industry && <p className="text-red-500 text-sm">{errors.industry.message}</p>}
      </div>
      {industry === "Others" && (
        <div>
          <label className="block text-sm font-medium">Please specify</label>
          <Input {...register('industryOther')} placeholder="Specify other industry" />
          {errors.industryOther && <p className="text-red-500 text-sm">{errors.industryOther.message}</p>}
        </div>
      )}
      {/* Add other fields for Step 2 as needed */}
    </div>
  );
};

// Step 3 Component
const Step3 = () => {
  const { register, watch, formState: { errors } } = useFormContext<FormData>();
  const businessModel = watch('businessModel');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Business Model</label>
        <Input {...register('businessModel')} placeholder="Enter your business model" />
        {errors.businessModel && <p className="text-red-500 text-sm">{errors.businessModel.message}</p>}
      </div>
      {businessModel === "Other" && (
        <div>
          <label className="block text-sm font-medium">Please specify</label>
          <Input {...register('businessModelOther')} placeholder="Specify other business model" />
          {errors.businessModelOther && <p className="text-red-500 text-sm">{errors.businessModelOther.message}</p>}
        </div>
      )}
      {/* Add other fields for Step 3 as needed */}
    </div>
  );
};

// Step 4 Component
const Step4 = () => {
  // Implement Step 4 fields here
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Main Goal/Objectives</label>
        <Input {...useFormContext<FormData>().register('mainGoal')} placeholder="Enter your main goal" />
        {/* Display errors if any */}
      </div>
      {/* Add other fields for Step 4 as needed */}
    </div>
  );
};

// Review Step Component
const Review = ({ questionLoading, questionError }: { questionLoading: boolean; questionError: string | null }) => {
  const { getValues, register, formState: { errors } } = useFormContext<FormData>();
  const values = getValues();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Review Your Information</h2>
      
      <div>
        <h3 className="font-medium">Brand Name:</h3>
        <p>{values.brandName}</p>
      </div>
      <div>
        <h3 className="font-medium">Industry:</h3>
        <p>{values.industry === "Others" ? values.industryOther : values.industry}</p>
      </div>
      <div>
        <h3 className="font-medium">Business Model:</h3>
        <p>{values.businessModel === "Other" ? values.businessModelOther : values.businessModel}</p>
      </div>
      {/* Add other summary fields as needed */}

      {/* Personalized Question */}
      {questionLoading && (
        <div className="flex items-center">
          <Loader2 className="animate-spin mr-2" />
          <span>Generating personalized question...</span>
        </div>
      )}
      
      {questionError && (
        <p className="text-red-500">{questionError}</p>
      )}

      {!questionLoading && !questionError && values.personalizedQuestion && (
        <>
          <div>
            <label className="block text-sm font-medium">{values.personalizedQuestion}</label>
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

// Utility function to format the analysis
function formatAnalysis(analysis: string, personalizedQuestion: string) {
  return (
    <div>
      <p>{analysis}</p>
      <div className="mt-4">
        <h4 className="font-medium">Personalized Question Response:</h4>
        <p>{personalizedQuestion}</p>
      </div>
    </div>
  );
}
