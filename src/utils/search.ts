/**
 * 站内搜索工具函数
 */

import type { Group, Site } from '../API/http';

/**
 * 搜索结果项
 */
export interface SearchResultItem {
  type: 'site' | 'group';
  id: number;
  groupId?: number; // site 才有
  groupName?: string; // site 才有
  name: string;
  url?: string; // site 才有
  description?: string;
  notes?: string; // site 才有
  matchedFields: string[]; // 匹配到的字段名称，用于高亮显示
  relevance?: number; // 相关性评分
  icon?: string; // 图标
  semanticScore?: number; // 语义匹配分数
}

/**
 * 模糊匹配函数
 */
function fuzzyMatch(text: string, query: string): boolean {
  if (!text || !query) return false;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  return lowerText.includes(lowerQuery);
}

/**
 * 搜索站点
 */
function searchSites(
  sites: Site[],
  query: string,
  groupsMap: Map<number, Group>
): SearchResultItem[] {
  const results: SearchResultItem[] = [];
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return results;

  for (const site of sites) {
    const matchedFields: string[] = [];

    // 匹配网站名称
    if (fuzzyMatch(site.name, lowerQuery)) {
      matchedFields.push('name');
    }

    // 匹配 URL
    if (site.url && fuzzyMatch(site.url, lowerQuery)) {
      matchedFields.push('url');
    }

    // 匹配描述
    if (site.description && fuzzyMatch(site.description, lowerQuery)) {
      matchedFields.push('description');
    }

    // 匹配备注
    if (site.notes && fuzzyMatch(site.notes, lowerQuery)) {
      matchedFields.push('notes');
    }

    // 如果有任何字段匹配，添加到结果
    if (matchedFields.length > 0 && site.id !== undefined) {
      const group = groupsMap.get(site.group_id);
      results.push({
        type: 'site',
        id: site.id,
        groupId: site.group_id,
        groupName: group?.name || '未知分组',
        name: site.name,
        url: site.url,
        description: site.description,
        notes: site.notes,
        matchedFields,
      });
    }
  }

  return results;
}

/**
 * 搜索分组
 */
function searchGroups(groups: Group[], query: string): SearchResultItem[] {
  const results: SearchResultItem[] = [];
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return results;

  for (const group of groups) {
    const matchedFields: string[] = [];

    // 匹配分组名称
    if (fuzzyMatch(group.name, lowerQuery)) {
      matchedFields.push('name');
    }

    // 如果有任何字段匹配，添加到结果
    if (matchedFields.length > 0 && group.id !== undefined) {
      results.push({
        type: 'group',
        id: group.id,
        name: group.name,
        matchedFields,
      });
    }
  }

  return results;
}

/**
 * 站内搜索主函数
 */
export function searchInternal(query: string, groups: Group[], sites: Site[]): SearchResultItem[] {
  if (!query || !query.trim()) {
    return [];
  }

  // 创建分组 ID 到分组的映射
  const groupsMap = new Map<number, Group>();
  for (const group of groups) {
    if (group.id !== undefined) {
      groupsMap.set(group.id, group);
    }
  }

  // 搜索站点和分组
  const siteResults = searchSites(sites, query, groupsMap);
  const groupResults = searchGroups(groups, query);

  // 合并结果，站点优先
  return [...siteResults, ...groupResults];
}

/**
 * 高亮匹配文本
 */
export function highlightMatch(text: string, query: string): string {
  if (!text || !query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return `${before}<mark>${match}</mark>${after}`;
}