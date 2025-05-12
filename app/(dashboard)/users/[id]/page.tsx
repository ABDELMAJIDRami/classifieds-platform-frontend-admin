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
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import Link from 'next/link';
import axios from '../../../../src/core/network/axios';
import {useNotifications} from "@toolpad/core";
import {User} from "@/src/core/interfaces/User";


export default function UserDetailPage() {
  const notifications = useNotifications();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/users/${userId}`);
      setUser(response.data);
    } catch (e) {
      // @ts-ignore
      notifications.show(`Fetching user failed. ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });

    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    fetchUser();
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
            User Details
          </Typography>
        </Box>
        {user && (
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            component={Link} 
            href={`/users/${userId}/edit`}
          >
            Edit User
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{xs: 12}}>
                <Typography variant="h6" gutterBottom>
                  {`${user.firstName} ${user.lastName}`}
                </Typography>
                <Chip 
                  label={user.role.name} 
                  color={user.role.name === 'manager' ? 'primary' : 'default'}
                  size="small" 
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={user.isActive ? 'Active' : 'Inactive'} 
                  color={user.isActive ? 'success' : 'error'}
                  size="small" 
                />
              </Grid>
              
              <Grid size={{xs: 12}}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid size={{xs: 12, sm: 6}}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {user.email}
                </Typography>
              </Grid>
              
              <Grid size={{xs: 12, sm: 6}}>
                <Typography variant="subtitle2" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body1">
                  {user.id}
                </Typography>
              </Grid>
              
              <Grid size={{xs: 12, sm: 6}}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {new Date(user.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid size={{xs: 12, sm: 6}}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(user.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info">User not found</Alert>
      )}
    </Box>
  );
}