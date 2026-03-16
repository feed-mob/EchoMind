// 团队情绪统计接口
export interface TeamMoodStats {
  averageMood: number;
  participationRate: number;
  topEmotion: string | null;
  totalEntries: number;
  activeMembers: number;
}

// 团队情绪分布接口
export interface TeamMoodDistribution {
  emotion: string;
  count: number;
  percentage: number;
}

// 团队情绪趋势接口
export interface TeamMoodTrend {
  date: string;
  averageMood: number;
  entries: number;
}

// 团队洞察接口
export interface TeamInsights {
  positiveTrends: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

// 团队情绪分析请求参数
export interface TeamMoodAnalysisParams {
  groupId: string;
  timeRange: '7' | '30' | '90';
}