import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Paper, 
  Card, 
  CardContent, 
  CardActionArea, 
  Avatar, 
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Site } from '../API/http';
import { motion } from 'framer-motion';

interface RecommendationSystemProps {
  sites: Site[];
  favorites: Site[];
  recentVisited: Site[];
  onSiteClick?: (site: Site) => void;
  onToggleFavorite?: (site: Site) => void;
  userId?: string;
  maxRecommendations?: number;
}

const RecommendationSystem: React.FC<RecommendationSystemProps> = ({
  sites,
  favorites = [],
  recentVisited = [],
  onSiteClick,
  onToggleFavorite,
  userId,
  maxRecommendations = 6
}) => {
  const theme = useTheme();
  const [recommendations, setRecommendations] = useState<Site[]>([]);
  const [recommendedByCategory, setRecommendedByCategory] = useState<{[key: string]: Site[]}>({});

  // 计算推荐算法
  useEffect(() => {
    const computeRecommendations = () => {
      // 1. 基于收藏的推荐 - 推荐与收藏相似的网站
      const favoriteBasedRecs = getRecommendationsBasedOnFavorites(sites, favorites);
      
      // 2. 基于最近访问的推荐 - 推荐与最近访问相似的网站
      const recentBasedRecs = getRecommendationsBasedOnRecent(sites, recentVisited);
      
      // 3. 基于流行度的推荐 - 推荐最受欢迎的网站
      const popularityBasedRecs = getPopularRecommendations(sites, [...favorites, ...recentVisited]);
      
      // 4. 基于类别的推荐 - 推荐用户可能喜欢的新类别
      const categoryBasedRecs = getCategoryRecommendations(sites, favorites, recentVisited);
      
      // 合并推荐并去重
      const allRecommendations = [
        ...favoriteBasedRecs,
        ...recentBasedRecs,
        ...popularityBasedRecs,
        ...categoryBasedRecs
      ].filter((site, index, self) => 
        index === self.findIndex(s => s.id === site.id)
      ).slice(0, maxRecommendations);

      setRecommendations(allRecommendations);
      
      // 按类别分组
      const grouped = allRecommendations.reduce((acc: {[key: string]: Site[]}, site) => {
        const category = site.notes || '其他';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(site);
        return acc;
      }, {});
      
      setRecommendedByCategory(grouped);
    };

    computeRecommendations();
  }, [sites, favorites, recentVisited, maxRecommendations]);

  // 基于收藏的推荐算法
  const getRecommendationsBasedOnFavorites = (allSites: Site[], userFavorites: Site[]): Site[] => {
    if (userFavorites.length === 0) return [];

    // 计算与收藏网站相似的网站
    const favoriteUrls = userFavorites.map(fav => fav.url);
    const favoriteDomains = favoriteUrls.map(url => extractDomain(url));

    return allSites
      .filter(site => !userFavorites.some(fav => fav.id === site.id))
      .map(site => {
        const siteDomain = extractDomain(site.url);
        const similarityScore = favoriteDomains.filter(domain => 
          siteDomain.includes(domain) || domain.includes(siteDomain)
        ).length;
        
        return { ...site, _similarityScore: similarityScore };
      })
      .filter(site => (site as any)._similarityScore > 0)
      .sort((a, b) => (b as any)._similarityScore - (a as any)._similarityScore)
      .slice(0, maxRecommendations / 2);
  };

  // 基于最近访问的推荐算法
  const getRecommendationsBasedOnRecent = (allSites: Site[], recentSites: Site[]): Site[] => {
    if (recentSites.length === 0) return [];

    // 计算与最近访问网站相似的网站
    const recentUrls = recentSites.map(recent => recent.url);
    const recentDomains = recentUrls.map(url => extractDomain(url));

    return allSites
      .filter(site => !recentSites.some(rec => rec.id === site.id))
      .map(site => {
        const siteDomain = extractDomain(site.url);
        const similarityScore = recentDomains.filter(domain => 
          siteDomain.includes(domain) || domain.includes(siteDomain)
        ).length;
        
        return { ...site, _similarityScore: similarityScore };
      })
      .filter(site => (site as any)._similarityScore > 0)
      .sort((a, b) => (b as any)._similarityScore - (a as any)._similarityScore)
      .slice(0, maxRecommendations / 3);
  };

  // 基于流行度的推荐算法
  const getPopularRecommendations = (allSites: Site[], excludeSites: Site[]): Site[] => {
    // 这里模拟流行度，实际上可以基于点击次数、访问频率等
    const excludedIds = new Set(excludeSites.map(site => site.id));
    
    return allSites
      .filter(site => !excludedIds.has(site.id))
      .sort((a, b) => {
        // 模拟流行度评分（可以基于实际数据）
        const aPopularity = calculatePopularityScore(a);
        const bPopularity = calculatePopularityScore(b);
        return bPopularity - aPopularity;
      })
      .slice(0, maxRecommendations / 4);
  };

  // 基于类别的推荐算法
  const getCategoryRecommendations = (allSites: Site[], favorites: Site[], recent: Site[]): Site[] => {
    // 找出用户尚未探索的类别
    const visitedCategories = new Set([
      ...favorites.map(fav => fav.notes || '其他'),
      ...recent.map(rec => rec.notes || '其他')
    ]);
    
    const unvisitedSites = allSites.filter(site => 
      !visitedCategories.has(site.notes || '其他') &&
      ![...favorites, ...recent].some(s => s.id === site.id)
    );
    
    return unvisitedSites
      .sort((a, b) => calculatePopularityScore(b) - calculatePopularityScore(a))
      .slice(0, maxRecommendations / 4);
  };

  // 提取域名
  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url.split('/')[0] || 'unknown'; // fallback with default value
    }
  };

  // 计算流行度评分（模拟）
  const calculatePopularityScore = (site: Site): number => {
    // 这里可以基于实际数据计算，如点击次数、分享次数等
    // 模拟评分：基于描述长度和名称长度
    const descriptionScore = site.description ? site.description.length / 10 : 0;
    const nameScore = site.name.length / 5;
    const hasIcon = site.icon ? 5 : 0;
    
    return descriptionScore + nameScore + hasIcon;
  };

  // 检查是否为收藏
  const isFavorite = (siteId: number) => {
    return favorites.some(fav => fav.id === siteId);
  };

  // 推荐卡片组件
  const RecommendationCard = ({ site }: { site: Site }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.grey[800], 0.8)})`
            : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.grey[100], 0.9)})`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[8],
          }
        }}
      >
        <CardActionArea
          onClick={() => onSiteClick && onSiteClick(site)}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            p: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={site.icon}
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                bgcolor: theme.palette.primary.main,
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            >
              {site.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium" noWrap>
                {site.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {extractDomain(site.url)}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite && onToggleFavorite(site);
              }}
              color={isFavorite(site.id!) ? 'error' : 'default'}
            >
              {isFavorite(site.id!) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {site.description || '暂无描述'}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={site.notes || '其他'}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            <Tooltip title="在新标签页中打开">
              <IconButton size="small">
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActionArea>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        为您推荐
      </Typography>
      
      {recommendations.length > 0 ? (
        <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ justifyContent: 'flex-start' }}>
          {recommendations.slice(0, maxRecommendations).map((site) => (
            <Box key={site.id ?? `rec-${Math.random()}`} sx={{ flex: '1 1 calc(33.333% - 20px)', minWidth: 280, mb: 3 }}>
              <RecommendationCard site={site} />
            </Box>
          ))}
        </Stack>
      ) : (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
            borderRadius: 3,
            background: 'transparent'
          }}
        >
          <Typography variant="h6" color="text.secondary">
            暂无推荐内容
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            访问更多网站以获得个性化推荐
          </Typography>
        </Paper>
      )}
      
      {/* 推荐理由展示 */}
      {recommendations.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            推荐依据
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {favorites.length > 0 && (
              <Chip 
                label={`基于您的 ${favorites.length} 个收藏`} 
                variant="outlined" 
                color="primary" 
                size="small" 
              />
            )}
            {recentVisited.length > 0 && (
              <Chip 
                label={`基于您最近访问的 ${recentVisited.length} 个网站`} 
                variant="outlined" 
                color="secondary" 
                size="small" 
              />
            )}
            <Chip 
              label="基于受欢迎程度" 
              variant="outlined" 
              color="default" 
              size="small" 
            />
            <Chip 
              label="探索新类别" 
              variant="outlined" 
              color="info" 
              size="small" 
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RecommendationSystem;