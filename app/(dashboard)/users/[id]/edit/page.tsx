'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import {useNotifications} from "@toolpad/core";
import axios from "../../../../../src/core/network/axios";
import { User } from '@/src/core/interfaces/User';


export default function UserEditPage() {
  const notifications = useNotifications();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [editableData, setEditableData] = useState({
    firstName: '',
    lastName: '',
    isActive: true
  });

  const fetchData = async () => {
    try {
      const response = await axios.get(`/users/${userId}`);

      setUser(response.data);
      setEditableData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        isActive: response.data.isActive
      });
    } catch (e) {
      console.log(12312)
      // @ts-ignore
      notifications.show(`Fetching user failed. ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableData({
      ...editableData,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableData({
      ...editableData,
      [e.target.name]: e.target.checked
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await axios.patch(`/users/${userId}`, editableData);

      setUser(response.data);
      notifications.show('User updated successfully.', {
        severity: "success",
        autoHideDuration: 3000
      });

      router.replace(`/users/${userId}`);
    } catch (e) {
      // @ts-ignore
      notifications.show(`Update failed. ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchData().then();
  }, [userId]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.back()}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1">
            Edit User
          </Typography>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <Card>
          <CardContent>
            <form onSubmit={handleUpdate}>
              <Grid container spacing={3}>
                <Grid size={{xs:12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={editableData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                
                <Grid size={{xs:12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={editableData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                
                <Grid size={{xs:12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={user.email}
                    disabled
                  />
                </Grid>
                
                <Grid size={{xs:12, sm: 6}}>
                  <FormControl fullWidth>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      labelId="role-label"
                      name="roleId"
                      value={user.role.id}
                      label="Role"
                      disabled
                    >
                      <MenuItem value={user.role.id}>
                        {user.role.name}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{xs:12, sm: 6}}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editableData.isActive}
                        onChange={handleSwitchChange}
                        name="isActive"
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                </Grid>
                
                <Grid size={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid size={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      startIcon={<SaveIcon />}
                      loading={isSaving}
                    >
                      Update
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info">User not found</Alert>
      )}
    </Box>
  );
}