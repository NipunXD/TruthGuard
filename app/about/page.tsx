import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">About TruthGuard</h1>
        <p className="text-muted-foreground">
          Learn more about our mission to combat misinformation and fake news.
        </p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              TruthGuard was created as a college project with a serious purpose: to help combat the spread of misinformation in our digital world. 
              In an era where false information can spread rapidly through social media and news outlets, we believe that providing tools to verify 
              content is essential for maintaining an informed society.
            </p>
            <p className="text-muted-foreground mt-4">
              Our platform uses advanced AI technology to analyze news articles and content, providing users with truthfulness ratings and 
              explanations. By making this technology accessible, we hope to empower individuals to make more informed decisions about the 
              information they consume and share.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                TruthGuard uses a custom-trained machine learning model to analyze news content. The model examines various factors including 
                linguistic patterns, source credibility, factual consistency, and comparison with verified information to determine the likelihood 
                that content is truthful.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Truth Scoring System</h3>
              <p className="text-muted-foreground">
                Our system provides a truth score from 0-100%, categorized as follows:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li><span className="font-medium text-green-600 dark:text-green-400">True (75-100%)</span>: Content that appears to be factual and from reliable sources</li>
                <li><span className="font-medium text-yellow-600 dark:text-yellow-400">Maybe True (50-75%)</span>: Content that contains mostly factual information but may have some unverified claims</li>
                <li><span className="font-medium text-orange-600 dark:text-orange-400">Maybe False (35-50%)</span>: Content that contains questionable claims and may be misleading</li>
                <li><span className="font-medium text-red-600 dark:text-red-400">False (0-35%)</span>: Content that contains numerous false claims or significant misinformation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">News API Integration</h3>
              <p className="text-muted-foreground">
                We use the NewsAPI to fetch current news articles from various sources, which are then analyzed by our model to provide users with 
                an overview of truthfulness in current news.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">User Content Verification</h3>
              <p className="text-muted-foreground">
                Users can submit headlines and article content directly through our platform to receive an analysis of its truthfulness, helping 
                them verify information before sharing or acting on it.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              TruthGuard was developed as a college project focused on applying artificial intelligence to address real-world problems. The project 
              combines web development, API integration, and machine learning to create a practical tool for information verification.
            </p>
            <p className="text-muted-foreground mt-4">
              <span className="font-medium">Technologies used:</span> Next.js, React, TypeScript, TailwindCSS, NewsAPI, and a custom-trained machine learning model.
            </p>
            <p className="text-muted-foreground mt-4">
              <span className="font-medium">Note:</span> This is an educational project and while we strive for accuracy, the analysis provided should be used as one of many tools 
              to verify information, not as the sole determinant of truth.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}