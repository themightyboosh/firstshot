import { db } from "../../lib/firebase";
import { logger } from "../../lib/logger";

export const logUsage = async (type: 'image' | 'text', costEstimate: number = 0, details: any = {}, userId: string = 'anonymous') => {
  try {
    await db.collection('usage_logs').add({
      type,
      userId,
      timestamp: new Date().toISOString(),
      costEstimate,
      details
    });
  } catch (error) {
    logger.error('Failed to log usage:', error);
  }
};

export interface UserUsageStats {
  totalRequests: number;
  totalCost: number;
  lastActive: string | null;
  breakdown: {
    image: number;
    text: number;
  };
}

export const getUserUsageStats = async (userId: string): Promise<UserUsageStats> => {
  const snapshot = await db.collection('usage_logs')
    .where('userId', '==', userId)
    .get();
    
  // Sort in memory to find latest (avoiding composite index requirement)
  const docs = snapshot.docs.map(doc => doc.data()).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
    
  const stats: UserUsageStats = {
    totalRequests: 0,
    totalCost: 0,
    lastActive: docs.length > 0 ? docs[0].timestamp : null,
    breakdown: { image: 0, text: 0 }
  };
  
  docs.forEach(data => {
    stats.totalRequests++;
    stats.totalCost += (data.costEstimate || 0);
    if (data.type === 'image') stats.breakdown.image++;
    if (data.type === 'text') stats.breakdown.text++;
  });
  
  return stats;
};

export interface UsageStats {
  today: { count: number; cost: number };
  week: { count: number; cost: number };
  month: { count: number; cost: number };
}

export const getUsageStats = async (): Promise<UsageStats> => {
  // Get all logs (warning: scalability issue in production, good for MVP)
  // Optimization: In prod, use distributed counters or BigQuery
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const snapshot = await db.collection('usage_logs')
    .where('timestamp', '>=', startOfMonth)
    .get();
    
  const stats = {
    today: { count: 0, cost: 0 },
    week: { count: 0, cost: 0 },
    month: { count: 0, cost: 0 }
  };
  
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const time = new Date(data.timestamp).getTime();
    const age = now.getTime() - time;
    const cost = data.costEstimate || 0;
    
    // Month (already filtered by query)
    stats.month.count++;
    stats.month.cost += cost;
    
    // Week
    if (age < oneWeek) {
      stats.week.count++;
      stats.week.cost += cost;
    }
    
    // Today
    if (age < oneDay) {
      stats.today.count++;
      stats.today.cost += cost;
    }
  });
  
  return stats;
};
