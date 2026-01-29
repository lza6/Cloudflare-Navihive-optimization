/**
 * 智能搜索和推荐工具
 */

import type { Group, Site } from '../API/http';
import { SearchResultItem } from './search';

/**
 * 搜索历史记录
 */
export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultsCount: number;
  selectedId?: number; // 如果用户选择了某个结果
}

/**
 * 智能推荐类型
 */
export interface SmartRecommendation {
  id: number;
  type: 'site' | 'group';
  name: string;
  url?: string;
  description?: string;
  relevanceScore: number; // 相关性评分，越高越相关
  reason: string; // 推荐原因
}

/**
 * 搜索建议类型
 */
export interface SearchSuggestion {
  text: string;
  type: 'popular' | 'recent' | 'related';
  count?: number; // 用于流行度建议
}

/**
 * 智能搜索工具类
 */
export class SmartSearchEngine {
  private searchHistory: SearchHistoryItem[] = [];
  private maxHistoryItems = 100; // 最大历史记录数
  
  constructor() {
    this.loadSearchHistory();
  }

  /**
   * 执行智能搜索
   */
  search(query: string, groups: Group[], sites: Site[]): SearchResultItem[] {
    if (!query || !query.trim()) {
      // 如果没有查询词，返回热门推荐
      return this.getPopularRecommendations(groups, sites);
    }

    const trimmedQuery = query.trim().toLowerCase();
    
    // 执行基础搜索
    const basicResults = this.performBasicSearch(trimmedQuery, groups, sites);
    
    // 执行智能匹配
    const smartResults = this.performSmartSearch(trimmedQuery, groups, sites);
    
    // 执行语义搜索
    const semanticResults = this.performSemanticSearch(trimmedQuery, groups, sites);
    
    // 合并并去重结果
    const allResults = this.mergeAndDeduplicate(basicResults, smartResults, semanticResults);
    
    // 记录搜索历史
    this.recordSearch(query, allResults.length);
    
    // 按相关性排序
    return this.sortByRelevance(allResults, trimmedQuery);
  }

  /**
   * 获取搜索建议
   */
  getSuggestions(query: string, groups: Group[], sites: Site[]): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    
    // 从历史记录中获取热门搜索
    const popularQueries = this.getPopularQueries();
    for (const [text, count] of popularQueries) {
      if (text.toLowerCase().includes(query.toLowerCase()) && text !== query) {
        suggestions.push({
          text,
          type: 'popular',
          count
        });
      }
    }
    
    // 基于当前输入的自动补全
    const autocompleteSuggestions = this.getAutocompleteSuggestions(query, groups, sites);
    for (const suggestion of autocompleteSuggestions) {
      if (!suggestions.some(s => s.text === suggestion.text)) {
        suggestions.push(suggestion);
      }
    }
    
    return suggestions.slice(0, 5); // 限制返回数量
  }

  /**
   * 获取智能推荐
   */
  getRecommendations(count: number = 5): SmartRecommendation[] {
    // 这里可以根据搜索历史和用户行为生成个性化推荐
    // 简化实现：返回最近被搜索的项目
    const recentSearches = this.searchHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    
    const recommendations: SmartRecommendation[] = [];
    
    // 基于搜索历史的推荐（这是一个简化的实现）
    for (const item of recentSearches) {
      // 这里可以基于实际数据和算法生成更智能的推荐
      // 暂时返回固定的推荐
      recommendations.push({
        id: Date.now(),
        type: 'site',
        name: `推荐项目: ${item.query}`,
        relevanceScore: Math.random() * 100,
        reason: '基于您的搜索历史推荐'
      });
    }
    
    return recommendations.slice(0, count);
  }

  /**
   * 记录搜索结果的选择
   */
  recordSelection(query: string, selectedId: number) {
    const historyItem = this.searchHistory.find(item => 
      item.query === query && item.timestamp > Date.now() - 300000 // 5分钟内
    );
    
    if (historyItem) {
      historyItem.selectedId = selectedId;
      this.saveSearchHistory();
    }
  }

  /**
   * 执行基础搜索
   */
  private performBasicSearch(query: string, groups: Group[], sites: Site[]): SearchResultItem[] {
    const results: SearchResultItem[] = [];
    
    // 搜索站点
    for (const site of sites) {
      if (this.matchesQuery(site, query)) {
        results.push({
          type: 'site',
          id: site.id!,
          groupId: site.group_id,
          name: site.name,
          url: site.url,
          description: site.description,
          notes: site.notes,
          matchedFields: this.getMatchingFields(site, query)
        });
      }
    }
    
    // 搜索分组
    for (const group of groups) {
      if (this.matchesQuery(group, query)) {
        results.push({
          type: 'group',
          id: group.id!,
          name: group.name,
          matchedFields: this.getMatchingFields(group, query)
        });
      }
    }
    
    return results;
  }

  /**
   * 执行智能搜索（更复杂的匹配逻辑）
   */
  private performSmartSearch(query: string, groups: Group[], sites: Site[]): SearchResultItem[] {
    const results: SearchResultItem[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    // 计算每个项目的相关性得分
    const scoredResults = [...sites.map(site => ({
      item: site,
      type: 'site' as const,
      score: this.calculateRelevanceScore(site, queryTerms)
    })), ...groups.map(group => ({
      item: group,
      type: 'group' as const,
      score: this.calculateRelevanceScore(group, queryTerms)
    }))];
    
    // 只返回得分较高的结果
    const highScoreResults = scoredResults
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // 限制智能搜索结果数量
    
    for (const result of highScoreResults) {
      if (result.type === 'site') {
        results.push({
          type: 'site',
          id: result.item.id!,
          groupId: (result.item as Site).group_id,
          name: result.item.name,
          url: (result.item as Site).url,
          description: (result.item as Site).description,
          notes: (result.item as Site).notes,
          matchedFields: this.getMatchingFields(result.item, query)
        });
      } else {
        results.push({
          type: 'group',
          id: result.item.id!,
          name: result.item.name,
          matchedFields: this.getMatchingFields(result.item, query)
        });
      }
    }
    
    return results;
  }

  /**
   * 计算相关性得分
   */
  private calculateRelevanceScore(item: Site | Group, queryTerms: string[]): number {
    let score = 0;
    
    // 检查每个查询词的相关性
    for (const term of queryTerms) {
      const itemText = this.getItemTextForScoring(item);
      const lowerText = itemText.toLowerCase();
      
      // 精确匹配权重更高
      if (lowerText === term) {
        score += 100;
      }
      // 作为单词开头匹配
      else if (lowerText.startsWith(term)) {
        score += 50;
      }
      // 包含匹配
      else if (lowerText.includes(term)) {
        score += 20;
      }
      // 模糊匹配（字符级别）
      else if (this.fuzzyMatch(lowerText, term)) {
        score += 5;
      }
    }
    
    // 根据匹配的查询词数量给予奖励
    const matchedTerms = queryTerms.filter(term => 
      this.getItemTextForScoring(item).toLowerCase().includes(term)
    ).length;
    
    if (matchedTerms === queryTerms.length) {
      score *= 1.5; // 所有词都匹配给予奖励
    }
    
    return score;
  }

  /**
   * 获取用于评分的项目文本
   */
  private getItemTextForScoring(item: Site | Group): string {
    if ('group_id' in item) { // 这是一个站点
      return `${item.name} ${item.url || ''} ${item.description || ''} ${item.notes || ''}`.toLowerCase();
    } else { // 这是一个分组
      return `${item.name}`.toLowerCase();
    }
  }

  /**
   * 模糊匹配（简单的字符级别匹配）
   */
  private fuzzyMatch(text: string, pattern: string): boolean {
    if (pattern.length === 0) return true;
    if (text.length < pattern.length) return false;
    
    let textIndex = 0;
    let patternIndex = 0;
    
    while (textIndex < text.length && patternIndex < pattern.length) {
      if (text[textIndex] === pattern[patternIndex]) {
        patternIndex++;
      }
      textIndex++;
    }
    
    return patternIndex === pattern.length;
  }

  /**
   * 检查项目是否匹配查询
   */
  private matchesQuery(item: Site | Group, query: string): boolean {
    const itemText = this.getItemTextForScoring(item);
    return itemText.includes(query);
  }

  /**
   * 获取匹配的字段
   */
  private getMatchingFields(item: Site | Group, query: string): string[] {
    const fields: string[] = [];
    
    if ('group_id' in item) { // 站点
      if (item.name.toLowerCase().includes(query)) fields.push('name');
      if (item.url && item.url.toLowerCase().includes(query)) fields.push('url');
      if (item.description && item.description.toLowerCase().includes(query)) fields.push('description');
      if (item.notes && item.notes.toLowerCase().includes(query)) fields.push('notes');
    } else { // 分组
      if (item.name.toLowerCase().includes(query)) fields.push('name');
    }
    
    return fields;
  }

  /**
   * 合并并去重结果
   */
  private mergeAndDeduplicate(basic: SearchResultItem[], smart: SearchResultItem[], semantic?: SearchResultItem[]): SearchResultItem[] {
    const seenIds = new Set<number>();
    const results: SearchResultItem[] = [];
    
    // 首先添加基础搜索结果
    for (const item of basic) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        results.push(item);
      }
    }
    
    // 然后添加智能搜索结果
    for (const item of smart) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        results.push(item);
      }
    }
    
    // 最后添加语义搜索结果
    if (semantic) {
      for (const item of semantic) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          results.push(item);
        }
      }
    }
    
    // 按相关性排序
    return results.sort((a, b) => {
      // 站点优先于分组
      if (a.type !== b.type) {
        return a.type === 'site' ? -1 : 1;
      }
      // 更具体的匹配优先
      return b.matchedFields.length - a.matchedFields.length;
    });
  }
  
  /**
   * 执行语义搜索
   */
  private performSemanticSearch(query: string, groups: Group[], sites: Site[]): SearchResultItem[] {
    const results: SearchResultItem[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    // 对站点执行语义搜索
    for (const site of sites) {
      const siteText = `${site.name} ${site.description} ${site.notes} ${site.url}`.toLowerCase();
      
      // 检查语义匹配
      let semanticScore = 0;
      
      // 计算查询词在站点文本中的匹配度
      for (const term of queryTerms) {
        if (siteText.includes(term)) {
          semanticScore += 10; // 基础匹配分
        }
        
        // 检查模糊匹配
        for (const word of siteText.split(/\s+/)) {
          if (this.calculateSimilarity(term, word) > 0.7) {
            semanticScore += 5; // 模糊匹配分
          }
        }
      }
      
      // 如果语义分数足够高，添加到结果中
      if (semanticScore > 0) {
        results.push({
          type: 'site',
          id: site.id!,
          groupId: site.group_id,
          name: site.name,
          url: site.url,
          description: site.description,
          notes: site.notes,
          matchedFields: ['semantic'],
          semanticScore
        });
      }
    }
    
    // 对分组执行语义搜索
    for (const group of groups) {
      const groupText = `${group.name}`.toLowerCase();
      
      // 检查语义匹配
      let semanticScore = 0;
      
      for (const term of queryTerms) {
        if (groupText.includes(term)) {
          semanticScore += 10;
        }
        
        // 检查模糊匹配
        for (const word of groupText.split(/\s+/)) {
          if (this.calculateSimilarity(term, word) > 0.7) {
            semanticScore += 5;
          }
        }
      }
      
      if (semanticScore > 0) {
        results.push({
          type: 'group',
          id: group.id!,
          name: group.name,
          matchedFields: ['semantic'],
          semanticScore
        });
      }
    }
    
    return results;
  }
  
  /**
   * 计算两个字符串的相似度（简化版本）
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // 如果完全匹配，返回1
    if (s1 === s2) return 1;
    
    // 如果其中一个包含另一个，返回0.8
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // 检查公共子序列长度（简化版本）
    let commonChars = 0;
    const minLength = Math.min(s1.length, s2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (s1[i] === s2[i]) {
        commonChars++;
      }
    }
    
    return commonChars / Math.max(s1.length, s2.length);
  }
  
  /**
   * 按相关性排序
   */
  private sortByRelevance(results: SearchResultItem[], query: string): SearchResultItem[] {
    return results.sort((a, b) => {
      // 检查是否包含语义分数
      const aScore = (a as any).semanticScore || 0;
      const bScore = (b as any).semanticScore || 0;
      
      // 如果有语义分数，优先考虑语义匹配
      if (aScore !== bScore) {
        return bScore - aScore;
      }
      
      // 站点优先于分组
      if (a.type !== b.type) {
        return a.type === 'site' ? -1 : 1;
      }
      
      // 更具体的匹配优先
      return b.matchedFields.length - a.matchedFields.length;
    });
  }

  /**
   * 获取热门推荐
   */
  private getPopularRecommendations(groups: Group[], sites: Site[]): SearchResultItem[] {
    // 简化实现：返回最近添加的站点
    const recentSites = [...sites]
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 10);
    
    return recentSites.map(site => ({
      type: 'site',
      id: site.id!,
      groupId: site.group_id,
      name: site.name,
      url: site.url,
      description: site.description,
      notes: site.notes,
      matchedFields: ['name']
    }));
  }

  /**
   * 获取热门查询
   */
  private getPopularQueries(): [string, number][] {
    const queryCounts = new Map<string, number>();
    
    for (const item of this.searchHistory) {
      const count = queryCounts.get(item.query) || 0;
      queryCounts.set(item.query, count + 1);
    }
    
    return Array.from(queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }

  /**
   * 获取自动补全建议
   */
  private getAutocompleteSuggestions(query: string, groups: Group[], sites: Site[]): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();
    
    // 从站点名称获取建议
    for (const site of sites) {
      if (site.name.toLowerCase().startsWith(lowerQuery) && site.name !== query) {
        suggestions.push({
          text: site.name,
          type: 'related'
        });
      }
    }
    
    // 从分组名称获取建议
    for (const group of groups) {
      if (group.name.toLowerCase().startsWith(lowerQuery) && group.name !== query) {
        suggestions.push({
          text: group.name,
          type: 'related'
        });
      }
    }
    
    // 去重
    return suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(t => t.text === suggestion.text)
    );
  }

  /**
   * 记录搜索历史
   */
  private recordSearch(query: string, resultsCount: number) {
    this.searchHistory.unshift({
      query,
      timestamp: Date.now(),
      resultsCount
    });
    
    // 限制历史记录数量
    if (this.searchHistory.length > this.maxHistoryItems) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
    }
    
    this.saveSearchHistory();
  }

  /**
   * 加载搜索历史
   */
  private loadSearchHistory() {
    try {
      const historyStr = localStorage.getItem('smart-search-history');
      if (historyStr) {
        this.searchHistory = JSON.parse(historyStr);
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
      this.searchHistory = [];
    }
  }

  /**
   * 保存搜索历史
   */
  private saveSearchHistory() {
    try {
      localStorage.setItem('smart-search-history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }
}