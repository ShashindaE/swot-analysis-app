"use client"

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Modal from '@/components/Modal'; // Import the Modal component
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  business: z.string().min(1, "Business name is required"),
  country: z.string().min(1, "Country is required"),
  industry: z.string().min(1, "Industry is required"),
});

export default function SWOTAnalysisForm() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business: "",
      country: "",
      industry: "",
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
      setIsModalOpen(true); // Open modal on successful analysis
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  function formatAnalysis(text: string) {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2">
        {line.split('**').map((part, i) => (
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        ))}
      </p>
    ));
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate SWOT Analysis'}
            </Button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-lg font-semibold mb-4">Analysis Result:</h3>
        {analysis && formatAnalysis(analysis)}
      </Modal>
    </div>
  );
}