import * as ort from 'onnxruntime-web';
import axios from 'axios';
import { NewsArticle, AnalyzedArticle } from './types';

// 🟢 Constants
const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const MODEL_DIR = `${baseURL}/fine-tuned-bert`;
const MAX_SEQ_LENGTH = 128;
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

// 🟢 BERT Tokenizer Class for Browser
class BertTokenizer {
  private vocab: Record<string, number> = {};
  private invVocab: Record<number, string> = {};
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    console.log('Loading vocab.txt...');
    try {
      const response = await fetch(`${MODEL_DIR}/vocab.txt`);
      if (!response.ok) throw new Error(`Failed to load vocab.txt: ${response.statusText}`);

      const vocabData = await response.text();
      vocabData.split('\n').forEach((token, index) => {
        const cleanToken = token.trim();
        if (cleanToken) {
          this.vocab[cleanToken] = index;
          this.invVocab[index] = cleanToken;
        }
      });
      this.isInitialized = true;
      console.log('Vocab loaded successfully!');
    } catch (error) {
      console.error('Error loading vocab:', error);
      throw error;
    }
  }

  encode(text: string) {
    const tokens = text.split(/\s+/).map((word) => this.vocab[word] ?? this.vocab['[UNK]']);
    const inputIds = [this.vocab['[CLS]'], ...tokens.slice(0, MAX_SEQ_LENGTH - 2), this.vocab['[SEP]']];
    const attentionMask = new Array(inputIds.length).fill(1);

    while (inputIds.length < MAX_SEQ_LENGTH) {
      inputIds.push(0);
      attentionMask.push(0);
    }

    return { inputIds, attentionMask };
  }
}

// 🟢 NewsValidator Class for Browser (ONNX Model)
class NewsValidator {
  private model: ort.InferenceSession | null = null;
  private tokenizer = new BertTokenizer();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    console.log('Initializing tokenizer...');
    await this.tokenizer.initialize();

    console.log('Loading model from:', `${MODEL_DIR}/model.onnx`);
    try {
      this.model = await ort.InferenceSession.create(`${MODEL_DIR}/model.onnx`, {
        executionProviders: ['wasm'], // 🟢 Use WebAssembly for better performance if available
      });
      console.log('Model loaded successfully!');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to load ONNX model:', error);
      throw new Error('Model initialization failed');
    }
  }

  async predict(text: string): Promise<number> {
    if (!this.isInitialized) throw new Error('Model or tokenizer not initialized');
  
    console.log('Tokenizing input for prediction...');
    const { inputIds } = this.tokenizer.encode(text);
  
    console.log('Creating input tensors...');
    const inputTensor = new ort.Tensor('int64', BigInt64Array.from(inputIds.map(BigInt)), [1, MAX_SEQ_LENGTH]);
  
    try {
      console.log("Model input names:", this.model!.inputNames);
  
      console.log('Running inference...');
      const feeds = { input_ids: inputTensor };
      const results = await this.model!.run(feeds);
  
      console.log('Inference completed!');
      const output = results[Object.keys(results)[0]];
      const scores = Array.from(output.data as Float32Array);
      const confidence = Math.exp(scores[1]) / (Math.exp(scores[0]) + Math.exp(scores[1]));
  
      return Math.round(confidence * 100);
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Prediction failed');
    }
  }
}

// 🟢 NewsAnalyzer Class
class NewsAnalyzer {
  private validator = new NewsValidator();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    console.log('Initializing NewsAnalyzer...');
    await this.validator.initialize();
    this.isInitialized = true;
  }

  async fetchHeadlines(limit = 10): Promise<NewsArticle[]> {
    try {
      console.log('Fetching news headlines...');
      const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&pageSize=${limit}&apiKey=${NEWS_API_KEY}`);
      console.log('News headlines fetched successfully!');
      return response.data.articles.map((a: any) => ({
        title: a.title,
        content: a.content || '',
        urlToImage: a.urlToImage,
        publishedAt: a.publishedAt,
        url: a.url,
        source: a.source.name,
      }));
    } catch (error) {
      console.error('News API error:', error);
      return [];
    }
  }

  async analyze(articles: NewsArticle[]): Promise<AnalyzedArticle[]> {
    console.log('Analyzing articles sequentially...');
    const analyzedArticles: AnalyzedArticle[] = [];

    for (const article of articles) {
        const text = [article.title, article.content].join(' ').trim();
        const score = await this.validator.predict(text);
        const analyzedArticle = {
            ...article,
            truthScore: score * 2,
            confidence: Math.abs(score - 50) * 2,
            truthCategory: this.getCategory(score * 2),
        };
        analyzedArticles.push(analyzedArticle);
    }

    return analyzedArticles;
  }

  private getCategory(score: number): 'True' | 'Maybe True' | 'Maybe False' | 'False' {
    if (score >= 85) return 'True';
    if (score > 50) return 'Maybe True';
    if (score <= 50) return 'Maybe False';
    return 'False';
  }
}

// 🟢 Create an instance of NewsAnalyzer and export the functions
const newsAnalyzer = new NewsAnalyzer();

export const fetchTopHeadlines = async (limit = 10) => {
  if (!newsAnalyzer['isInitialized']) {
    await newsAnalyzer.initialize();
  }
  return newsAnalyzer.fetchHeadlines(limit);
};

export const analyzeArticles = async (articles: NewsArticle[]) => {
  if (!newsAnalyzer['isInitialized']) {
    await newsAnalyzer.initialize();
  }
  return newsAnalyzer.analyze(articles);
};

// 🟢 Verify a Single News Article
export const verifyContent = async (headline: string, content: string) => {
  if (!newsAnalyzer['isInitialized']) {
    await newsAnalyzer.initialize();
  }

  const text = `${headline} ${content}`.trim();
  const score = await newsAnalyzer['validator'].predict(text);

  const verificationResult = {
    truthScore: score * 2,
    confidence: Math.abs(score - 50) * 2,
    truthCategory: score * 2 >= 75 ? 'True' : score * 2 > 50 ? 'Maybe True' : score * 2 <= 50 ? 'Maybe False' : 'False',
  };

  console.log('Verification Result:', verificationResult);
  return verificationResult;
};