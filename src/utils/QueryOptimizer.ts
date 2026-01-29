/**
 * 数据库查询优化器
 * 提供查询分析、索引建议和性能优化等功能
 */

export interface QueryPlan {
  query: string;
  executionTime: number;
  rowsExamined: number;
  rowsReturned: number;
  indexesUsed: string[];
  suggestions: string[];
}

export interface QueryAnalysis {
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedExecutionTime: number;
  suggestedOptimizations: string[];
  potentialIssues: string[];
}

class QueryOptimizer {
  private queryHistory: Map<string, QueryPlan[]>;
  private indexSuggestions: Map<string, string[]>;
  private slowQueryThreshold: number; // milliseconds

  constructor(slowQueryThreshold: number = 100) {
    this.queryHistory = new Map();
    this.indexSuggestions = new Map();
    this.slowQueryThreshold = slowQueryThreshold;
  }

  /**
   * 分析SQL查询
   */
  analyzeQuery(sql: string): QueryAnalysis {
    const analysis: QueryAnalysis = {
      complexity: 'simple',
      estimatedExecutionTime: 0,
      suggestedOptimizations: [],
      potentialIssues: []
    };

    // 分析查询复杂度
    analysis.complexity = this.estimateComplexity(sql);

    // 识别潜在问题
    analysis.potentialIssues = this.identifyPotentialIssues(sql);

    // 生成优化建议
    analysis.suggestedOptimizations = this.generateOptimizations(sql);

    // 估算执行时间
    analysis.estimatedExecutionTime = this.estimateExecutionTime(sql, analysis.complexity);

    return analysis;
  }

  /**
   * 估算查询复杂度
   */
  private estimateComplexity(sql: string): 'simple' | 'moderate' | 'complex' {
    const upperSql = sql.toUpperCase();
    let complexityScore = 0;

    // 检查JOIN数量
    const joinMatches = upperSql.match(/\bJOIN\b/g);
    complexityScore += (joinMatches ? joinMatches.length : 0) * 2;

    // 检查子查询
    const subqueryMatches = upperSql.match(/\bSELECT\b[^(]*\([^)]*\)\)/g);
    complexityScore += (subqueryMatches ? subqueryMatches.length : 0) * 3;

    // 检查聚合函数
    const aggregateMatches = upperSql.match(/\b(GROUP BY|HAVING|COUNT|SUM|AVG|MAX|MIN)\b/g);
    complexityScore += (aggregateMatches ? aggregateMatches.length : 0);

    // 检查DISTINCT
    if (upperSql.includes('DISTINCT')) complexityScore += 1;

    // 检查ORDER BY
    if (upperSql.includes('ORDER BY')) complexityScore += 1;

    // 检查LIMIT/OFFSET
    if (upperSql.includes('LIMIT') || upperSql.includes('OFFSET')) complexityScore += 1;

    if (complexityScore <= 2) return 'simple';
    if (complexityScore <= 5) return 'moderate';
    return 'complex';
  }

  /**
   * 识别潜在问题
   */
  private identifyPotentialIssues(sql: string): string[] {
    const issues: string[] = [];
    const upperSql = sql.toUpperCase();

    // 检查缺少WHERE条件的查询
    if (upperSql.includes('SELECT') && !upperSql.includes('WHERE') && !upperSql.includes('LIMIT')) {
      issues.push('缺少WHERE条件可能导致全表扫描');
    }

    // 检查LIKE查询
    if (upperSql.includes('LIKE \'%')) {
      issues.push('LIKE查询以%开头可能导致索引失效');
    }

    // 检查OR条件
    if (upperSql.includes(' OR ')) {
      issues.push('OR条件可能导致索引失效，考虑使用UNION');
    }

    // 检查函数在WHERE子句中使用
    const functionPatterns = ['YEAR(', 'MONTH(', 'DAY(', 'UPPER(', 'LOWER('];
    for (const pattern of functionPatterns) {
      if (upperSql.includes(pattern) && upperSql.includes('WHERE')) {
        issues.push(`在WHERE子句中使用函数可能导致索引失效: ${pattern}`);
      }
    }

    // 检查N+1查询问题（通过检查是否有重复模式）
    if (this.detectPossibleNPlusOne(sql)) {
      issues.push('可能存在N+1查询问题');
    }

    return issues;
  }

  /**
   * 检测可能的N+1查询问题
   */
  private detectPossibleNPlusOne(sql: string): boolean {
    // 简单检测：检查是否在同一作用域中有类似的查询模式
    // 实际实现会更复杂，需要分析整个应用的查询模式
    return sql.toLowerCase().includes('select') && sql.toLowerCase().includes('where id =');
  }

  /**
   * 生成优化建议
   */
  private generateOptimizations(sql: string): string[] {
    const optimizations: string[] = [];
    const upperSql = sql.toUpperCase();

    // 建议添加索引
    if (upperSql.includes('WHERE')) {
      const whereClause = this.extractWhereClause(upperSql);
      if (whereClause) {
        const columns = this.extractColumnsFromClause(whereClause);
        if (columns.length > 0) {
          optimizations.push(`考虑为列 [${columns.join(', ')}] 添加索引`);
        }
      }
    }

    // 建议使用LIMIT
    if (upperSql.includes('SELECT') && !upperSql.includes('LIMIT') && upperSql.includes('WHERE')) {
      optimizations.push('考虑添加LIMIT子句以提高性能');
    }

    // 建议优化JOIN
    if (upperSql.includes('JOIN')) {
      optimizations.push('确保JOIN条件上有适当的索引');
      optimizations.push('考虑使用EXISTS替代IN子查询');
    }

    // 建议优化聚合查询
    if (upperSql.includes('GROUP BY') || upperSql.includes('COUNT(')) {
      optimizations.push('确保GROUP BY列上有适当的索引');
    }

    return optimizations;
  }

  /**
   * 提取WHERE子句
   */
  private extractWhereClause(sql: string): string | undefined {
    const match = sql.match(/WHERE\s+(.*?)(?:\s+GROUP BY|\s+ORDER BY|\s+LIMIT|$)/i);
    return match ? match[1] : undefined;
  }

  /**
   * 从子句中提取列名
   */
  private extractColumnsFromClause(clause: string | undefined): string[] {
    if (!clause) return [];
    
    // 简单提取列名（实际实现会更复杂）
    const columnPattern = /\b(\w+)\s*[=<>!]/g;
    const columns: string[] = [];
    let match;

    while ((match = columnPattern.exec(clause)) !== null) {
      if (!columns.includes(match[1])) {
        columns.push(match[1]);
      }
    }

    return columns;
  }

  /**
   * 估算执行时间
   */
  private estimateExecutionTime(sql: string, complexity: 'simple' | 'moderate' | 'complex'): number {
    const baseTime = 1; // ms
    let multiplier = 1;

    switch (complexity) {
      case 'simple': multiplier = 1; break;
      case 'moderate': multiplier = 5; break;
      case 'complex': multiplier = 20; break;
    }

    // 根据JOIN数量调整
    const joinCount = (sql.toUpperCase().match(/\bJOIN\b/g) || []).length;
    multiplier *= (1 + joinCount * 0.5);

    return baseTime * multiplier;
  }

  /**
   * 记录查询执行计划
   */
  recordQueryPlan(plan: QueryPlan): void {
    const queryKey = this.normalizeQuery(plan.query);
    if (!this.queryHistory.has(queryKey)) {
      this.queryHistory.set(queryKey, []);
    }

    const plans = this.queryHistory.get(queryKey)!;
    plans.push(plan);

    // 只保留最近100个执行计划
    if (plans.length > 100) {
      plans.shift();
    }

    // 检查是否需要索引优化
    this.analyzeIndexNeeds(plan);
  }

  /**
   * 标准化查询语句（移除值，保留结构）
   */
  private normalizeQuery(query: string): string {
    return query
      .replace(/\b\d+\b/g, '?') // 数字替换为?
      .replace(/'[^']*'/g, "'?'") // 字符串替换为'?' 
      .replace(/"[^"]*"/g, '"?"') // 双引号字符串替换为"?"
      .toLowerCase()
      .trim();
  }

  /**
   * 分析索引需求
   */
  private analyzeIndexNeeds(plan: QueryPlan): void {
    if (plan.executionTime > this.slowQueryThreshold) {
      const normalizedQuery = this.normalizeQuery(plan.query);
      const whereMatch = plan.query.toUpperCase().match(/WHERE\s+(.*?)(?:\s+GROUP BY|\s+ORDER BY|\s+LIMIT|$)/i);
      
      if (whereMatch) {
        const whereClause = whereMatch[1];
        const columns = this.extractColumnsFromClause(whereClause);
        
        if (columns.length > 0) {
          const tableMatch = plan.query.toUpperCase().match(/FROM\s+(\w+)/i);
          if (tableMatch && tableMatch[1]) {
            const tableName = tableMatch[1];
            if (!this.indexSuggestions.has(tableName)) {
              this.indexSuggestions.set(tableName, []);
            }
            
            const suggestions = this.indexSuggestions.get(tableName)!;
            const indexDef = `CREATE INDEX idx_${tableName}_${columns.join('_')} ON ${tableName} (${columns.join(', ')});`;
            
            if (!suggestions.includes(indexDef)) {
              suggestions.push(indexDef);
            }
          }
        }
      }
    }
  }

  /**
   * 获取慢查询
   */
  getSlowQueries(threshold?: number): QueryPlan[] {
    const timeThreshold = threshold || this.slowQueryThreshold;
    const slowQueries: QueryPlan[] = [];

    for (const plans of this.queryHistory.values()) {
      for (const plan of plans) {
        if (plan.executionTime > timeThreshold) {
          slowQueries.push(plan);
        }
      }
    }

    return slowQueries.sort((a, b) => b.executionTime - a.executionTime);
  }

  /**
   * 获取索引建议
   */
  getIndexSuggestions(): Map<string, string[]> {
    return new Map(this.indexSuggestions);
  }

  /**
   * 获取查询统计
   */
  getQueryStats(): {
    totalQueries: number;
    slowQueries: number;
    averageExecutionTime: number;
    tables: string[];
  } {
    let totalQueries = 0;
    let totalExecutionTime = 0;
    const tables = new Set<string>();

    for (const plans of this.queryHistory.values()) {
      for (const plan of plans) {
        totalQueries++;
        totalExecutionTime += plan.executionTime;

        // 提取表名
        const tableMatch = plan.query.toUpperCase().match(/FROM\s+(\w+)/i);
        if (tableMatch && tableMatch[1]) {
          tables.add(tableMatch[1]);
        }
      }
    }

    return {
      totalQueries,
      slowQueries: this.getSlowQueries().length,
      averageExecutionTime: totalQueries > 0 ? totalExecutionTime / totalQueries : 0,
      tables: Array.from(tables)
    };
  }

  /**
   * 清理查询历史
   */
  clearHistory(): void {
    this.queryHistory.clear();
    this.indexSuggestions.clear();
  }
}

// 专门用于导航应用的查询优化器
class NavigationQueryOptimizer extends QueryOptimizer {
  /**
   * 优化获取分组和站点的查询
   */
  optimizeGroupsWithSitesQuery(): string {
    return `
      SELECT 
        g.id, g.name, g.order_num, g.is_public, g.created_at, g.updated_at,
        s.id as site_id, s.name as site_name, s.url, s.icon, s.description, s.notes,
        s.order_num as site_order_num, s.is_public as site_is_public, 
        s.created_at as site_created_at, s.updated_at as site_updated_at
      FROM groups g
      LEFT JOIN sites s ON g.id = s.group_id
      WHERE g.is_public = ? AND (s.is_public = ? OR s.is_public IS NULL)
      ORDER BY g.order_num, s.order_num
    `;
  }

  /**
   * 优化站点搜索查询
   */
  optimizeSiteSearchQuery(searchTerm: string): string {
    const escapedTerm = `%${searchTerm}%`;
    return `
      SELECT s.*, g.name as group_name
      FROM sites s
      JOIN groups g ON s.group_id = g.id
      WHERE (s.name LIKE ? OR s.description LIKE ? OR s.url LIKE ?)
      AND g.is_public = 1 AND s.is_public = 1
      ORDER BY CASE 
        WHEN s.name LIKE '${escapedTerm}' THEN 1
        WHEN s.description LIKE '${escapedTerm}' THEN 2
        ELSE 3
      END, s.name
      LIMIT 50
    `;
  }

  /**
   * 优化获取公开内容的查询
   */
  optimizePublicContentQuery(): string {
    return `
      SELECT 
        g.id, g.name, g.order_num, g.created_at, g.updated_at,
        s.id as site_id, s.name as site_name, s.url, s.icon, s.description, s.notes,
        s.order_num as site_order_num, s.created_at as site_created_at, s.updated_at as site_updated_at
      FROM groups g
      LEFT JOIN sites s ON g.id = s.group_id
      WHERE g.is_public = 1 AND (s.is_public = 1 OR s.is_public IS NULL)
      ORDER BY g.order_num ASC, s.order_num ASC
    `;
  }

  /**
   * 优化统计查询
   */
  optimizeStatsQuery(): string {
    return `
      SELECT 
        (SELECT COUNT(*) FROM groups WHERE is_public = 1) as public_groups_count,
        (SELECT COUNT(*) FROM groups WHERE is_public = 0) as private_groups_count,
        (SELECT COUNT(*) FROM sites WHERE is_public = 1) as public_sites_count,
        (SELECT COUNT(*) FROM sites WHERE is_public = 0) as private_sites_count,
        (SELECT COUNT(*) FROM sites) as total_sites_count,
        (SELECT COUNT(*) FROM groups) as total_groups_count
    `;
  }
}

// 创建全局实例
const navigationQueryOptimizer = new NavigationQueryOptimizer();

export { 
  QueryOptimizer, 
  NavigationQueryOptimizer, 
  navigationQueryOptimizer 
};

export default navigationQueryOptimizer;