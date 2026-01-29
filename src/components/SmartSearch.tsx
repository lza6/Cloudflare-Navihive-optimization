import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  TextField, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemButton, 
  IconButton, 
  Popper, 
  ClickAwayListener, 
  Box,
  Typography,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Close as CloseIcon, 
  History as HistoryIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { Group, Site } from '../API/http';
import { SearchResultItem } from '../utils/search';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartSearchProps {
  groups: Group[];
  sites: Site[];
  onInternalResultClick?: (result: SearchResultItem) => void;
  onExternalSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  recentSearches?: string[];
  trendingSearches?: string[];
  favoriteSites?: Site[];
  onAddFavorite?: (site: Site) => void;
  onRemoveFavorite?: (siteId: number) => void;
  onAddRecentSearch?: (query: string) => void;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  groups,
  sites,
  onInternalResultClick,
  onExternalSearch,
  placeholder = '搜索网站、分组...',
  autoFocus = false,
  recentSearches = [],
  trendingSearches = [],
  favoriteSites = [],
  onAddFavorite,
  onRemoveFavorite,
  onAddRecentSearch
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const theme = useTheme();

  // 智能搜索算法
  const performSearch = (searchQuery: string): SearchResultItem[] => {
    if (!searchQuery.trim()) {
      return [];
    }

    const queryLower = searchQuery.toLowerCase();
    const results: SearchResultItem[] = [];

    // 搜索分组
    groups.forEach(group => {
      if (group.name.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'group',
          id: group.id!,
          name: group.name,
          description: '分组',
          matchedFields: ['name'],
          relevance: calculateRelevance(group.name, queryLower)
        });
      }
    });

    // 搜索网站
    sites.forEach(site => {
      let relevance = 0;
      
      // 检查名称
      if (site.name.toLowerCase().includes(queryLower)) {
        relevance += 100;
      }
      
      // 检查URL
      if (site.url.toLowerCase().includes(queryLower)) {
        relevance += 80;
      }
      
      // 检查描述
      if (site.description && site.description.toLowerCase().includes(queryLower)) {
        relevance += 60;
      }
      
      // 检查笔记
      if (site.notes && site.notes.toLowerCase().includes(queryLower)) {
        relevance += 40;
      }

      if (relevance > 0) {
        results.push({
          type: 'site',
          id: site.id!,
          name: site.name,
          description: site.description || site.url,
          matchedFields: ['name'], // 可以根据实际情况填充
          relevance,
          groupId: site.group_id,
          groupName: groups.find(g => g.id === site.group_id)?.name,
          icon: site.icon || 'link'
        });
      }
    });

    // 按相关性排序
    return results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0)).slice(0, 10);
  };

  // 计算相关性得分
  const calculateRelevance = (text: string, query: string): number => {
    const textLower = text.toLowerCase();
    let score = 0;

    // 精确匹配
    if (textLower === query) {
      score += 100;
    }
    
    // 开头匹配
    if (textLower.startsWith(query)) {
      score += 50;
    }
    
    // 包含匹配
    if (textLower.includes(query)) {
      score += 20;
    }
    
    // 词匹配（按单词分割）
    const words = query.split(/\s+/);
    words.forEach(word => {
      if (textLower.includes(word)) {
        score += 10;
      }
    });

    return score;
  };

  // 处理搜索输入
  useEffect(() => {
    if (query.trim()) {
      const searchResults = performSearch(query);
      setResults(searchResults);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, groups, sites]);

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else if (results.length > 0 && results[0]) {
          handleResultClick(results[0]);
        } else if (query.trim()) {
          handleExternalSearch(query.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // 处理结果点击
  const handleResultClick = (result: SearchResultItem) => {
    if (onInternalResultClick) {
      onInternalResultClick(result);
    }
    setQuery('');
    setIsOpen(false);
    if (onAddRecentSearch) {
      onAddRecentSearch(result.name);
    }
  };

  // 处理外部搜索
  const handleExternalSearch = (searchQuery: string) => {
    if (onExternalSearch) {
      onExternalSearch(searchQuery);
    }
    if (onAddRecentSearch) {
      onAddRecentSearch(searchQuery);
    }
    setQuery('');
    setIsOpen(false);
  };

  // 获取搜索建议
  const suggestions = useMemo(() => {
    const allSuggestions: { type: string; text: string; icon: React.ReactNode; result?: SearchResultItem }[] = [];

    if (!query.trim()) {
      // 显示最近搜索和热门搜索
      if (recentSearches.length > 0) {
        allSuggestions.push({ type: 'header', text: '最近搜索', icon: <HistoryIcon /> });
        recentSearches.slice(0, 3).forEach(search => {
          allSuggestions.push({ type: 'recent', text: search, icon: <HistoryIcon /> });
        });
      }

      if (trendingSearches.length > 0) {
        allSuggestions.push({ type: 'header', text: '热门搜索', icon: <TrendingIcon /> });
        trendingSearches.slice(0, 3).forEach(search => {
          allSuggestions.push({ type: 'trending', text: search, icon: <TrendingIcon /> });
        });
      }

      if (favoriteSites.length > 0) {
        allSuggestions.push({ type: 'header', text: '收藏网站', icon: <StarIcon /> });
        favoriteSites.slice(0, 3).forEach(site => {
          allSuggestions.push({ type: 'favorite', text: site.name, icon: <StarIcon /> });
        });
      }
    } else {
      // 显示搜索结果
      results.forEach((result, index) => {
        allSuggestions.push({
          type: 'result',
          text: result.name,
          icon: result.type === 'group' ? 
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 24, height: 24, fontSize: 12 }}>G</Avatar> : 
            <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 24, height: 24, fontSize: 12 }}>S</Avatar>,
          result
        });
      });
    }

    return allSuggestions;
  }, [query, results, recentSearches, trendingSearches, favoriteSites, theme.palette]);

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setQuery('');
                    setIsOpen(false);
                  }}
                  edge="end"
                >
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 50,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
              },
              '&.Mui-focused': {
                backgroundColor: theme.palette.background.paper,
              }
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              py: 1,
              px: 2,
            }
          }}
        />

        <AnimatePresence>
          {isOpen && (
            <Popper
              open={isOpen}
              anchorEl={inputRef.current}
              placement="bottom-start"
              sx={{ 
                zIndex: theme.zIndex.modal,
                width: '100%',
                marginTop: 1
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    maxHeight: 400,
                    overflowY: 'auto',
                    background: theme.palette.mode === 'dark' 
                      ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.grey[800], 0.95)})`
                      : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.grey[50], 0.95)})`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  }}
                >
                  <List ref={listRef} sx={{ py: 0 }}>
                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <ListItem
                          key={`${suggestion.type}-${index}`}
                          disablePadding
                          component={motion.div}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.1 }}
                        >
                          {suggestion.type === 'header' ? (
                            <Box
                              sx={{
                                width: '100%',
                                px: 2,
                                py: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                              }}
                            >
                              {suggestion.text}
                            </Box>
                          ) : (
                            <ListItemButton
                              onClick={() => {
                                if (suggestion.type === 'result' && suggestion.result) {
                                  handleResultClick(suggestion.result);
                                } else if (suggestion.type === 'recent' || suggestion.type === 'trending') {
                                  handleExternalSearch(suggestion.text);
                                } else if (suggestion.type === 'favorite') {
                                  const favoriteSite = favoriteSites.find(f => f.name === suggestion.text);
                                  if (favoriteSite && onInternalResultClick) {
                                    onInternalResultClick({
                                      type: 'site',
                                      id: favoriteSite.id!,
                                      name: favoriteSite.name,
                                      description: favoriteSite.description || favoriteSite.url,
                                      matchedFields: ['name'],
                                      relevance: 100,
                                      groupId: favoriteSite.group_id,
                                      groupName: groups.find(g => g.id === favoriteSite.group_id)?.name,
                                      icon: favoriteSite.icon || 'link'
                                    });
                                  }
                                }
                              }}
                              sx={{
                                py: 1.5,
                                px: 2,
                                ...(selectedIndex === index && {
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                }),
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                                {suggestion.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={suggestion.text}
                                primaryTypographyProps={{
                                  noWrap: true,
                                  sx: { fontSize: '0.9rem' }
                                }}
                              />
                            </ListItemButton>
                          )}
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText
                          primary="没有找到结果"
                          secondary={query ? `尝试搜索 "${query}"` : "输入关键词开始搜索"}
                          sx={{ textAlign: 'center', py: 4 }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </motion.div>
            </Popper>
          )}
        </AnimatePresence>
      </Box>
    </ClickAwayListener>
  );
};

export default SmartSearch;