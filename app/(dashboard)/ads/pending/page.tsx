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
  Alert, Chip
} from '@mui/material';
import Link from 'next/link';
import axios from '@/src/core/network/axios';
import {Ad} from "@/src/core/interfaces/Ad";
import {getCurrentAdVersionFor} from "@/src/core/helpers";
import {useNotifications} from "@toolpad/core";


export default function PendingAdsPage() {
  const notifications = useNotifications();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingAds = async () => {
    try {
      const {data} = await axios.get(`/ads/pending`);

      setAds(data);
    } catch (e) {
      // @ts-ignore
      notifications.show(`Error fetching pending ads. ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });
    } finally {
      setLoading(false);
    }
  }

  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

    switch (status) {
      case 'approved':
        color = 'success';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'rejected':
        color = 'error';
        break;
    }

    return <Chip label={status} color={color} size="small" />;
  }

  useEffect(() => {
    fetchPendingAds().then();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Pending Ads
        </Typography>
      </Box>

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
                <TableCell>Title</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>{ad.id}</TableCell>
                  <TableCell>{getCurrentAdVersionFor(ad).title}</TableCell>
                  <TableCell>${getCurrentAdVersionFor(ad).price}</TableCell>
                  <TableCell>
                    {ad.category.name}
                    {ad.subcategory && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {ad.subcategory.name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {ad.city.name}, {ad.city.country.name}
                  </TableCell>
                  <TableCell>
                    <Link href={`/users/${ad.user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {`${ad.user.firstName} ${ad.user.lastName}`}
                    </Link>
                  </TableCell>
                  <TableCell>{getStatusChip(getCurrentAdVersionFor(ad).status)}</TableCell>
                  <TableCell>{new Date(ad.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={Link} 
                      href={`/ads/${ad.id}`}
                      sx={{ m: 0.5 }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="contained" 
                      color="warning"
                      size="small" 
                      component={Link} 
                      href={`/ads/${ad.id}/moderate`}
                      sx={{ m: 0.5 }}
                    >
                      Moderate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {ads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No pending ads found
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