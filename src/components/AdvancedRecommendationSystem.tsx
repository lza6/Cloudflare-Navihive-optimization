import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  History as HistoryIcon,
  Favorite as FavoriteIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { Site, Group } from '../API/http';
import { SearchResultItem } from '../utils/search';
import { SmartRecommendation } from '../utils/smart-search';

interface RecommendationSystemProps {
  sites: Site[];
  groups: Group[];
  onSiteClick: (site: Site) => void;
  currentUserQuery?: string;
}

interface RecommendationCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: SmartRecommendation[];
}

const AdvancedRecommendationSystem: React.FC<RecommendationSystemProps> = ({
  sites,
  groups,
  onSiteClick,
  currentUserQuery = '',
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  
  // 模拟智能推荐算法
  const generateRecommendations = (): SmartRecommendation[] => {
    // 基于用户行为、流行度、最近添加等因素生成推荐
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    // 计算推荐分数
    const scoredSites = sites.map(site => {
      let score = 0;
      
      // 基础分数：基于创建时间（较新的站点获得更高分数）
      const ageFactor = Math.max(0, 1 - (now - new Date(site.created_at || '').getTime()) / (30 * 24 * 60 * 60 * 1000));
      score += (1 - ageFactor) * 10;
      
      // 描述长度分数：有详细描述的站点获得更高分数
      if (site.description && site.description.length > 20) {
        score += 5;
      }
      
      // 名称相关性分数（如果用户有搜索查询）
      if (currentUserQuery) {
        if (site.name.toLowerCase().includes(currentUserQuery.toLowerCase())) {
          score += 15;
        }
        if (site.description && site.description.toLowerCase().includes(currentUserQuery.toLowerCase())) {
          score += 10;
        }
      }
      
      // 组织在受欢迎的分组中获得加分
      const group = groups.find(g => g.id === site.group_id);
      if (group) {
        // 假设分组中的站点数量反映了分组的受欢迎程度
        const groupSitesCount = sites.filter(s => s.group_id === group.id).length;
        score += Math.min(groupSitesCount, 10); // 最多加10分
      }
      
      // 根据访问历史调整分数（模拟）
      const visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '{}');
      const siteId = site.id;
      const siteVisits = siteId !== undefined ? (visitHistory[siteId]?.count || 0) : 0;
      score += Math.min(siteVisits * 2, 20); // 最多加20分
      
      return {
        id: site.id!,
        type: 'site' as const,
        name: site.name,
        url: site.url,
        description: site.description,
        relevanceScore: score,
        reason: getRecommendationReason(site, currentUserQuery, group?.name),
      };
    });
    
    // 按分数排序并返回前10个
    return scoredSites
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  };
  
  const getRecommendationReason = (site: Site, query: string, groupName?: string): string => {
    const reasons: string[] = [];
    
    if (query && site.name.toLowerCase().includes(query.toLowerCase())) {
      reasons.push('名称匹配');
    }
    
    if (groupName) {
      reasons.push(`属于 "${groupName}" 分组`);
    }
    
    if (site.description && site.description.length > 20) {
      reasons.push('有详细描述');
    }
    
    const visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '{}');
    const siteId = site.id;
    const siteVisits = siteId !== undefined ? (visitHistory[siteId]?.count || 0) : 0;
    if (siteVisits > 0) {
      reasons.push(`已访问 ${siteVisits} 次`);
    }
    
    if (reasons.length === 0) {
      reasons.push('智能推荐');
    }
    
    return reasons.join(', ');
  };
  
  // 生成不同类别的推荐
  const recommendationCategories: RecommendationCategory[] = useMemo(() => {
    const allRecs = generateRecommendations();
    
    return [
      {
        id: 'trending',
        name: '热门推荐',
        icon: <TrendingUpIcon color="primary" />,
        items: allRecs
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, 5),
      },
      {
        id: 'recent',
        name: '最近添加',
        icon: <TimeIcon color="secondary" />,
        items: [...sites]
          .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
          .slice(0, 5)
          .map(site => ({
            id: site.id!,
            type: 'site' as const,
            name: site.name,
            url: site.url,
            description: site.description,
            relevanceScore: 0, // Placeholder
            reason: `新增于 ${new Date(site.created_at || '').toLocaleDateString('zh-CN')}`,
          })),
      },
      {
        id: 'visited',
        name: '访问历史',
        icon: <HistoryIcon color="success" />,
        items: getVisitedSites().slice(0, 5),
      },
      {
        id: 'favorites',
        name: '我的收藏',
        icon: <FavoriteIcon color="error" />,
        items: getFavoriteSites().slice(0, 5),
      },
    ];
  }, [sites, groups, currentUserQuery]);
  
  const getVisitedSites = (): SmartRecommendation[] => {
    const visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '{}');
    const visitedIds = Object.keys(visitHistory)
      .map(Number)
      .filter(id => !isNaN(id));
    
    return sites
      .filter(site => site.id !== undefined && visitedIds.includes(site.id))
      .sort((a, b) => {
        const aId = a.id;
        const bId = b.id;
        const aTimestamp = aId !== undefined ? (visitHistory[aId]?.timestamp || 0) : 0;
        const bTimestamp = bId !== undefined ? (visitHistory[bId]?.timestamp || 0) : 0;
        return bTimestamp - aTimestamp;
      })
      .slice(0, 5)
      .map(site => {
        const siteId = site.id;
        return {
          id: site.id!,
          type: 'site' as const,
          name: site.name,
          url: site.url,
          description: site.description,
          relevanceScore: siteId !== undefined ? (visitHistory[siteId]?.count || 0) : 0,
          reason: `访问 ${siteId !== undefined ? (visitHistory[siteId]?.count || 0) : 0} 次`,
        };
      });
  };
  
  const getFavoriteSites = (): SmartRecommendation[] => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return sites
      .filter(site => favorites.some((fav: Site) => fav.id === site.id))
      .map(site => ({
        id: site.id!,
        type: 'site' as const,
        name: site.name,
        url: site.url,
        description: site.description,
        relevanceScore: 100, // High score for favorites
        reason: '已收藏',
      }));
  };
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };
  
  const handleSiteClick = (siteId: number) => {
    const site = sites.find(s => s.id === siteId);
    if (site && site.id !== undefined) {
      // 更新访问历史
      const visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '{}');
      const currentCount = visitHistory[siteId]?.count || 0;
      const currentTimestamp = Date.now();
      
      visitHistory[siteId] = {
        count: currentCount + 1,
        timestamp: currentTimestamp,
      };
      
      localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
      
      onSiteClick(site);
    }
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mb: 3, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
        borderRadius: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <StarIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
          智能推荐
        </Typography>
        <Chip
          label={`${recommendations.length} 个推荐`}
          size="small"
          color="primary"
          sx={{ ml: 1 }}
        />
      </Box>
      
      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {recommendationCategories.map((category, index) => (
          <Tab 
            key={category.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {category.icon}
                <span style={{ marginLeft: 6 }}>{category.name}</span>
              </Box>
            }
            id={`tab-${index}`}
            aria-controls={`tabpanel-${index}`}
          />
        ))}
      </Tabs>
      
      {recommendationCategories.map((category, index) => (
        <div
          key={category.id}
          role="tabpanel"
          hidden={activeTab !== index}
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
        >
          {activeTab === index && (
            <Box sx={{ p: 2 }}>
              {category.items.length > 0 ? (
                <Grid container spacing={2}>
                  {category.items.map((rec, idx) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`${category.id}-${idx}`}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          },
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
                              {rec.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {rec.name}
                            </Typography>
                          </Box>
                          
                          {rec.description && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 1, 
                                display: '-webkit-box', 
                                WebkitLineClamp: 2, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden' 
                              }}
                            >
                              {rec.description}
                            </Typography>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip 
                              size="small" 
                              label={rec.reason} 
                              variant="outlined" 
                              sx={{ fontSize: '0.7rem' }} 
                            />
                            <Chip 
                              size="small" 
                              icon={<StarIcon />} 
                              label={`相关性 ${Math.round(rec.relevanceScore)}`} 
                              color="primary" 
                              variant="outlined" 
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                          <Button 
                            size="small" 
                            onClick={() => handleSiteClick(rec.id)}
                          >
                            访问
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SearchIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    暂无推荐内容
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.name}暂无相关内容
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </div>
      ))}
      
      {/* 推荐分析卡片 */}
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            flex: 1, 
            minWidth: 200,
            background: 'radial-gradient(circle, #ffffff 0%, #f0f7ff 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CategoryIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              推荐分析
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            基于您的浏览历史、搜索习惯和内容偏好，
            我们为您精心挑选了以下内容。
          </Typography>
        </Paper>
        
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            flex: 1, 
            minWidth: 200,
            background: 'radial-gradient(circle, #ffffff 0%, #fff5f5 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon color="secondary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              热门趋势
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            发现大家都在关注的内容，
            保持与潮流同步。
          </Typography>
        </Paper>
      </Box>
    </Paper>
  );
};

export default AdvancedRecommendationSystem;