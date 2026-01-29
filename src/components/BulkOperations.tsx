/**
 * 批量操作工具组件
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

interface BulkOperationItem {
  id: number;
  name: string;
  type: 'site' | 'group';
  isPublic: boolean;
}

interface BulkOperationsProps {
  open: boolean;
  items: BulkOperationItem[];
  onClose: () => void;
  onConfirm: (operation: string, selectedIds: number[], options?: any) => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  open,
  items,
  onClose,
  onConfirm,
}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [operation, setOperation] = useState<'delete' | 'setVisibility' | null>(null);
  const [visibilityOption, setVisibilityOption] = useState<'public' | 'private' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleItemToggle = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const handleOperationSelect = (op: 'delete' | 'setVisibility') => {
    setOperation(op);
    if (op !== 'delete') {
      setConfirmDelete(false);
    }
  };

  const handleConfirm = () => {
    if (operation && selectedItems.length > 0) {
      if (operation === 'delete') {
        if (confirmDelete) {
          onConfirm(operation, selectedItems);
          handleClose();
        } else {
          setConfirmDelete(true);
        }
      } else if (operation === 'setVisibility' && visibilityOption) {
        onConfirm(operation, selectedItems, { visibility: visibilityOption });
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setSelectedItems([]);
    setOperation(null);
    setVisibilityOption(null);
    setConfirmDelete(false);
    onClose();
  };

  const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
  const selectedSites = selectedItemsData.filter(item => item.type === 'site');
  const selectedGroups = selectedItemsData.filter(item => item.type === 'group');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>批量操作</DialogTitle>
      <DialogContent dividers>
        {operation === null ? (
          <>
            <Typography variant="h6" gutterBottom>
              选择操作类型
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleOperationSelect('delete')}
                fullWidth
              >
                删除选中项
              </Button>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => handleOperationSelect('setVisibility')}
                fullWidth
              >
                修改可见性
              </Button>
            </Box>
          </>
        ) : confirmDelete ? (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              确定要删除 {selectedItems.length} 个项目吗？此操作不可逆！
            </Alert>
            <Typography variant="body1">
              选中项目:
            </Typography>
            <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
              {selectedItemsData.map(item => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                  <Chip 
                    label={item.type === 'site' ? '网站' : '分组'} 
                    size="small" 
                    color={item.type === 'site' ? 'primary' : 'secondary'} 
                    sx={{ mr: 1 }} 
                  />
                  <Typography noWrap sx={{ flex: 1 }}>{item.name}</Typography>
                </Box>
              ))}
            </Box>
          </>
        ) : operation === 'setVisibility' ? (
          <>
            <Typography variant="h6" gutterBottom>
              选择可见性
            </Typography>
            <FormGroup sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibilityOption === 'public'}
                    onChange={() => setVisibilityOption(visibilityOption === 'public' ? null : 'public')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VisibilityIcon color="primary" sx={{ mr: 1 }} />
                    <span>设为公开</span>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibilityOption === 'private'}
                    onChange={() => setVisibilityOption(visibilityOption === 'private' ? null : 'private')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VisibilityOffIcon color="disabled" sx={{ mr: 1 }} />
                    <span>设为私密</span>
                  </Box>
                }
              />
            </FormGroup>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">选择项目</Typography>
              <Button size="small" onClick={handleSelectAll}>
                {selectedItems.length === items.length ? '取消全选' : '全选'}
              </Button>
            </Box>
            
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {items.map(item => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleItemToggle(item.id)}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={item.type === 'site' ? '网站' : '分组'} 
                        size="small" 
                        color={item.type === 'site' ? 'primary' : 'secondary'} 
                      />
                      <Typography noWrap sx={{ flex: 1 }}>{item.name}</Typography>
                      <Chip 
                        label={item.isPublic ? '公开' : '私密'} 
                        size="small" 
                        color={item.isPublic ? 'success' : 'default'} 
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle2">
                已选择: {selectedItems.length} 项
              </Typography>
              {selectedSites.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  网站: {selectedSites.length} 个
                </Typography>
              )}
              {selectedGroups.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  分组: {selectedGroups.length} 个
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        {(operation !== null && !confirmDelete) || confirmDelete ? (
          <Button 
            onClick={handleConfirm} 
            color={confirmDelete ? "error" : "primary"}
            disabled={
              (operation === 'setVisibility' && !visibilityOption) || 
              (operation === 'delete' && !confirmDelete && selectedItems.length === 0)
            }
          >
            {confirmDelete ? '确认删除' : '确认'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default BulkOperations;