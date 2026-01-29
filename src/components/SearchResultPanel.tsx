/**
 * 搜索结果面板组件
 * 显示站内搜索结果的下拉面板
 */

import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  Box,
  Divider,
} from '@mui/material';
import { Language as LanguageIcon, Folder as FolderIcon } from '@mui/icons-material';
import type { SearchResultItem } from '../utils/search';

interface SearchResultPanelProps {
  results: SearchResultItem[];
  query: string;
  onResultClick: (result: SearchResultItem) => void;
  open: boolean;
}

const SearchResultPanel: React.FC<SearchResultPanelProps> = ({
  results,
  query,
  onResultClick,
  open,
}) => {
  if (!open || !query || results.length === 0) {
    return null;
  }

  // 高亮匹配文本
  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <Box
          component='span'
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            padding: '0 2px',
            borderRadius: '2px',
          }}
        >
          {match}
        </Box>
        {after}
      </>
    );
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        mt: 1,
        maxHeight: '400px',
        overflowY: 'auto',
        zIndex: 1300,
        borderRadius: 2,
      }}
    >
      <List sx={{ py: 0 }}>
        {results.map((result, index) => (
          <React.Fragment key={`${result.type}-${result.id}`}>
            {index > 0 && <Divider />}
            <ListItem disablePadding>
              <ListItemButton onClick={() => onResultClick(result)}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    width: '100%',
                    py: 0.5,
                  }}
                >
                  {/* 图标 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: result.type === 'site' ? 'primary.light' : 'secondary.light',
                      color: result.type === 'site' ? 'primary.main' : 'secondary.main',
                    }}
                  >
                    {result.type === 'site' ? <LanguageIcon /> : <FolderIcon />}
                  </Box>

                  {/* 内容 */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant='body1'
                            sx={{
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {highlightText(result.name, query)}
                          </Typography>
                          <Chip
                            label={result.type === 'site' ? '站点' : '分组'}
                            size='small'
                            color={result.type === 'site' ? 'primary' : 'secondary'}
                            sx={{ height: 20 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          {result.type === 'site' && result.groupName && (
                            <Typography
                              variant='caption'
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              分组: {result.groupName}
                            </Typography>
                          )}
                          {result.url && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {highlightText(result.url, query)}
                            </Typography>
                          )}
                          {result.description && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {highlightText(result.description, query)}
                            </Typography>
                          )}
                          {result.notes && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              备注: {highlightText(result.notes, query)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </Box>
                </Box>
              </ListItemButton>
            </ListItem>
          </React.Fragment>
        ))}
      </List>

      {/* 结果统计 */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'action.hover',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant='caption' color='text.secondary'>
          找到 {results.length} 个结果
        </Typography>
      </Box>
    </Paper>
  );
};

export default SearchResultPanel;
