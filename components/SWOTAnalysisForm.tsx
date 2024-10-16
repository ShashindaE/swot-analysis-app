"use client"

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Modal from '@/components/Modal';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  business: z.string().min(1, "Business name is required"),
  country: z.string().min(1, "Country is required"),
  industry: z.string().min(1, "Industry is required"),
  challenges: z.string().min(1, "Current challenges are required"),
  vision: z.string().min(1, "Goals and vision are required"),
});

export default function SWOTAnalysisForm() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business: "",
      country: "",
      industry: "",
      challenges: "",
      vision: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
  }

  function formatAnalysis(text: string) {
    const sections = text.split('---').map(section => section.trim());
    const [strengths, weaknesses, opportunities, threats, actionPlan] = sections;

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Strengths', content: strengths },
            { title: 'Weaknesses', content: weaknesses },
            { title: 'Opportunities', content: opportunities },
            { title: 'Threats', content: threats },
            { title: 'Action Plan', content: actionPlan },
          ].map((section, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{section.title}</h4>
              <Textarea 
                value={section.content} 
                onChange={(e) => {
                  const updatedAnalysis = [...sections];
                  updatedAnalysis[index] = e.target.value;
                  setAnalysis(updatedAnalysis.join('---'));
                }}
                className="w-full"
              />
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={() => setIsModalOpen(false)}>
          Save Changes
        </Button>
        <Button className="mt-4 ml-2" onClick={handleRegenerate}>
          Regenerate Analysis
        </Button>
      </div>
    );
  }

  async function handleRegenerate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/swot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form.getValues()),
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
  }

  return (
    <div className="flex flex-col items-center w-full h-full min-h-screen p-2">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>SWOT Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Business Name</label>
              <Input {...form.register('business')} placeholder="Enter business name" />
            </div>
            <div>
              <label className="block text-sm font-medium">Country</label>
              <Input {...form.register('country')} placeholder="Enter country" />
            </div>
            <div>
              <label className="block text-sm font-medium">Industry</label>
              <Input {...form.register('industry')} placeholder="Enter industry" />
            </div>
            <div>
              <label className="block text-sm font-medium">Current Challenges</label>
              <Textarea {...form.register('challenges')} placeholder="Describe your current challenges" />
            </div>
            <div>
              <label className="block text-sm font-medium">Goals and Vision</label>
              <Textarea {...form.register('vision')} placeholder="Describe your short-term and long-term vision" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate SWOT Analysis'}
            </Button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-lg font-semibold mb-4">SWOT Analysis Result:</h3>
        {analysis && formatAnalysis(analysis)}
      </Modal>
    </div>
  );
}
