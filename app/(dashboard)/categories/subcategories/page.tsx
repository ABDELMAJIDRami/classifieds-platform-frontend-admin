'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem, SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import axios from '@/src/core/network/axios';
import { Subcategory } from '@/src/core/interfaces/Subcategory';
import {Category} from "@/src/core/interfaces/Category";
import {useNotifications} from "@toolpad/core";


export default function SubcategoriesPage() {
  const notifications = useNotifications();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [newSubcategory, setNewSubcategory] = useState({ 
    id: 0,
    name: '', 
    description: '',
    categoryId: 0
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch all subcategories and categories in parallel
      const [subcategoriesResponse, categoriesResponse] = await Promise.all([
        axios.get(`/categories/subcategories/all`),
        axios.get(`/categories`)
      ]);

      setSubcategories(subcategoriesResponse.data);
      setCategories(categoriesResponse.data);
    } catch (e) {
      // @ts-ignore
      notifications.show(`Error fetching subcategories. ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData().then();
  }, []);

  const handleOpenDialog = (mode: 'create' | 'edit' = 'create', subcategory?: Subcategory) => {
    setDialogMode(mode);
    
    if (mode === 'edit' && subcategory) {
      setNewSubcategory({
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description || '',
        categoryId: subcategory.category.id
      });
    } else {
      setNewSubcategory({
        id: 0,
        name: '', 
        description: '',
        categoryId: categories.length > 0 ? categories[0].id : 0
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number>) => {
    const {name, value} = e.target;

    setNewSubcategory({
      ...newSubcategory,
      [name]: name === 'categoryId' ? Number(value) : value
    });
  };


  const handleSaveSubcategory = async () => {
    setSaving(true);
  
    try {
      if (dialogMode === 'create') {
        const response = await axios.post('/categories/subcategories', {
          name: newSubcategory.name,
          description: newSubcategory.description,
          categoryId: newSubcategory.categoryId
        });
  
        setSubcategories([...subcategories, response.data]);
      } else {
        console.log(newSubcategory)
        const response = await axios.patch(`/categories/subcategories/${newSubcategory.id}`, {
          name: newSubcategory.name,
          description: newSubcategory.description,
          categoryId: newSubcategory.categoryId
        });
  
        setSubcategories(subcategories.map(item =>
          item.id === newSubcategory.id ? response.data : item
        ));
      }
  
      handleCloseDialog();
    } catch (e) {
      // @ts-ignore
      notifications.show(`Error ${dialogMode === 'create' ? 'creating' : 'updating'} subcategory: ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Subcategories
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog('create')}
          disabled={categories.length === 0}
        >
          Add Subcategory
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subcategories.map((subcategory) => (
                <TableRow key={subcategory.id}>
                  <TableCell>{subcategory.id}</TableCell>
                  <TableCell>{subcategory.name}</TableCell>
                  <TableCell>{subcategory.category.name}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog('edit', subcategory)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {subcategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No subcategories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Subcategory Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{dialogMode === 'create' ? 'Create New Subcategory' : 'Edit Subcategory'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              name="categoryId"
              value={newSubcategory.categoryId}
              onChange={handleInputChange}
              label="Category"
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Subcategory Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newSubcategory.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={newSubcategory.description}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button 
            onClick={handleSaveSubcategory} 
            variant="contained" 
            disabled={saving || !newSubcategory.name || !newSubcategory.categoryId}
          >
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}