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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import axios from '@/src/core/network/axios';
import {useNotifications} from "@toolpad/core";
import {Category} from "@/src/core/interfaces/Category";


export default function CategoriesPage() {
  const notifications = useNotifications();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [categoryData, setCategoryData] = useState<{id?: number, name: string, description: string}>({ 
    name: '', 
    description: '' 
  });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // For subcategories modal
  const [openSubcategoriesModal, setOpenSubcategoriesModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      const {data} = await axios.get(`/categories`, {
        withCredentials: true
      });

      setCategories(data);
    } catch (e) {
      // @ts-ignore
      notifications.show(`Error loading categories. ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategories().then();
  }, []);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setCategoryData({ 
        id: category.id, 
        name: category.name, 
        description: category.description || '' 
      });
      setIsEditing(true);
    } else {
      setCategoryData({ name: '', description: '' });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryData({
      ...categoryData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveCategory = async () => {
    setSaving(true);

    try {
      if (isEditing) {
        // Update existing category
        const { data: updatedCategory } = await axios.patch(
          `/categories/${categoryData.id}`, 
          { name: categoryData.name, description: categoryData.description },
        );
        
        // Update the categories list
        setCategories(categories.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        ));
        
        notifications.show(`Category updated successfully`, {
          severity: "success",
          autoHideDuration: 3000
        });
      } else {
        // Create new category
        const { data: createdCategory } = await axios.post(
          '/categories',
          { name: categoryData.name, description: categoryData.description },
        );

        // Update the categories list
        setCategories([...categories, createdCategory]);
        
        notifications.show(`Category created successfully`, {
          severity: "success",
          autoHideDuration: 3000
        });
      }

      // Close the dialog
      handleCloseDialog();
    } catch (e) {
      // @ts-ignore
      notifications.show(`Error ${isEditing ? 'updating' : 'creating'} category. ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleOpenSubcategoriesModal = (category: Category) => {
    setSelectedCategory(category);
    setOpenSubcategoriesModal(true);
  };
  
  const handleCloseSubcategoriesModal = () => {
    setOpenSubcategoriesModal(false);
    setSelectedCategory(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Categories
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Add Category
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
                <TableCell>Description</TableCell>
                <TableCell>Subcategories</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <Button 
                      variant="text" 
                      size="small"
                      onClick={() => handleOpenSubcategoriesModal(category)}
                    >
                      {category.subcategories?.length ?? 0} subcategories
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleOpenDialog(category)}
                      startIcon={<EditIcon />}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Category Dialog (for both Create and Edit) */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? 'Edit Category' : 'Create New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={categoryData.name}
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
            value={categoryData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained" 
            disabled={saving || !categoryData.name}
          >
            {saving ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Subcategories Modal */}
      <Dialog 
        open={openSubcategoriesModal} 
        onClose={handleCloseSubcategoriesModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCategory?.name} - Subcategories
        </DialogTitle>
        <DialogContent>
          {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 ? (
            <List>
              {selectedCategory.subcategories.map((subcategory, index) => (
                <React.Fragment key={subcategory.id}>
                  <ListItem>
                    <ListItemText 
                      primary={subcategory.name} 
                      secondary={subcategory.description || 'No description'} 
                    />
                  </ListItem>
                  {index < (selectedCategory.subcategories?.length ?? 0) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body1" sx={{ py: 2, textAlign: 'center' }}>
              No subcategories found for this category.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseSubcategoriesModal}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}