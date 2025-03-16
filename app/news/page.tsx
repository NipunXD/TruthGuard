"use client";

import { useState, useEffect } from "react";
import { fetchTopHeadlines, analyzeArticles } from "@/lib/api";
import { AnalyzedArticle } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, HelpCircle, XCircle } from "lucide-react";
import Image from "next/image";

export default function NewsPage() {
  const [articles, setArticles] = useState<AnalyzedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      try {
        const headlines = await fetchTopHeadlines();
        const analyzed = await analyzeArticles(headlines);
        setArticles(analyzed);
      } catch (error) {
        console.error("Error loading news:", error);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  const filteredArticles = activeCategory === "all"
    ? articles
    : articles.filter(article => {
        if (activeCategory === "true" && article.truthScore >= 75) return true;
        if (activeCategory === "maybe-true" && article.truthScore >= 50 && article.truthScore < 75) return true;
        if (activeCategory === "maybe-false" && article.truthScore >= 35 && article.truthScore < 50) return true;
        if (activeCategory === "false" && article.truthScore < 35) return true;
        return false;
      });

  function getTruthIcon(category: string) {
    switch (category) {
      case "True":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Maybe True":
        return <HelpCircle className="h-5 w-5 text-yellow-500" />;
      case "Maybe False":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "False":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  }

  function getTruthColor(category: string) {
    switch (category) {
      case "True":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "Maybe True":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "Maybe False":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      case "False":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "";
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "Unknown Date" 
      : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  return (
    <div className="container py-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">News Analysis</h1>
        <p className="text-muted-foreground">
          Browse recent news articles analyzed by our AI model for truthfulness.
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="true">True</TabsTrigger>
          <TabsTrigger value="maybe-true">Maybe True</TabsTrigger>
          <TabsTrigger value="maybe-false">Maybe False</TabsTrigger>
          <TabsTrigger value="false">False</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video w-full bg-muted">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <Card key={index} className="overflow-hidden flex flex-col">
              <div className="aspect-video relative">
                <Image
                  src={article.urlToImage || " "}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{article.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <span>{article.source.name}</span>
                  <span>•</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.description || article.content?.split("[+")[0] || "No description available."}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-3">
                <div className="w-full">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Truth Score: {article.truthScore}%</span>
                    <div className="flex items-center gap-1">
                      {getTruthIcon(article.truthCategory)}
                      <span className="text-sm font-medium">{article.truthCategory}</span>
                    </div>
                  </div>
                  <Progress value={article.truthScore} className="h-2" />
                </div>
                <Badge variant="outline" className={`${getTruthColor(article.truthCategory)}`}>
                  {article.truthCategory}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
