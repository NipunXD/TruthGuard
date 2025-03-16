"use client";

import { useState } from 'react';
import { verifyContent } from '@/lib/api';
import { VerificationResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, HelpCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyPage() {
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!headline.trim()) {
      toast({
        title: "Headline required",
        description: "Please enter a headline to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const verificationResult: VerificationResult = await verifyContent(headline, content) as VerificationResult;
      setResult(verificationResult);
    } catch (error) {
      console.error('Error verifying content:', error);
      toast({
        title: "Verification failed",
        description: "There was an error analyzing your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function getTruthIcon(category: string) {
    switch (category) {
      case 'True':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Maybe True':
        return <HelpCircle className="h-5 w-5 text-yellow-500" />;
      case 'Maybe False':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'False':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  }

  function getTruthColor(category: string) {
    switch (category) {
      case 'True':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'Maybe True':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'Maybe False':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'False':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return '';
    }
  }

  return (
    <div className="container py-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Verify Content</h1>
        <p className="text-muted-foreground">
          Enter a news headline and content to analyze its truthfulness.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit Content for Analysis</CardTitle>
            <CardDescription>
              Enter a headline and optionally the full article text to analyze.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline (Required)</Label>
                <Input
                  id="headline"
                  placeholder="Enter the news headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Article Content (Optional)</Label>
                <Textarea
                  id="content"
                  placeholder="Enter the full article content for more accurate analysis"
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading || !headline.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Content'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Our AI model has analyzed your content and provided the following assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Truth Score</h3>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{result.truthScore}%</span>
                  <div className="flex items-center gap-1">
                    {getTruthIcon(result.truthCategory)}
                    <span className="text-sm font-medium">{result.truthCategory}</span>
                  </div>
                </div>
                <Progress value={result.truthScore} className="h-2" />
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Assessment</h3>
                <Badge className={`${getTruthColor(result.truthCategory)}`}>
                  {result.truthCategory}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {result.explanation}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Confidence</h3>
                <p className="text-sm text-muted-foreground">
                  Our model is {result.confidence}% confident in this assessment.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}