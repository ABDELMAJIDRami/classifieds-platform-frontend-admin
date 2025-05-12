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
  CircularProgress
} from '@mui/material';
import axios from '../../../src/core/network/axios';
import Link from 'next/link';
import {useNotifications} from "@toolpad/core";
import {User} from "@/src/core/interfaces/User";


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const notifications = useNotifications();
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const {data} = await axios.get('/users');
      setUsers(data);
    } catch (e) {
      // @ts-ignore
      notifications.show(`Fetching users failed. ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers().then();
  }, []);

  return (
    <Box>
        <Typography variant="h5" component="h1" mb={3}>
          Users
        </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{whiteSpace: 'nowrap'}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role.name}</TableCell>
                  <TableCell>{user.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={Link} 
                      href={`/users/${user.id}`}
                      sx={{ m: 0.5 }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={Link} 
                      href={`/users/${user.id}/edit`}
                      sx={{ m: 0.5 }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}