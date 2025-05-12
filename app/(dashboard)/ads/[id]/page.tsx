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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import Link from 'next/link';
import axios from '@/src/core/network/axios';
import {Ad} from "@/src/core/interfaces/Ad";
import {AdVersion} from "@/src/core/interfaces/AdVersion";
import {useNotifications} from "@toolpad/core";
import {getCurrentAdVersionFor} from "@/src/core/helpers";


export default function AdDetailPage() {
  const notifications = useNotifications();
  const params = useParams();
  const router = useRouter();
  const adId = params.id as string;

  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAd = async () => {
    try {
      const {data} = await axios.get(`/ads/${adId}`);
      setAd(data);
    } catch (e) {
      // @ts-ignore
      notifications.show(`Error fetching ad. ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAd().then();
  }, [adId]);
  console.log('addddd', ad);

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
  };

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
            Ad Details
          </Typography>
        </Box>
        {ad && getCurrentAdVersionFor(ad).status === 'pending' && (
          <Button 
            variant="contained" 
            color="warning"
            component={Link} 
            href={`/ads/${adId}/moderate`}
          >
            Moderate Ad
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : ad ? (
        <Grid container spacing={3}>
          <Grid size={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {getCurrentAdVersionFor(ad).title}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {getStatusChip(getCurrentAdVersionFor(ad).status)}
                    <Chip 
                      label={`$${getCurrentAdVersionFor(ad).price}`}
                      color="primary" 
                      variant="outlined"
                    />
                  </Stack>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid size={{xs: 12, md: 8}}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {getCurrentAdVersionFor(ad).description}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{xs: 12, md: 8}}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Category
                      </Typography>
                      <Typography component="div" variant="body1" gutterBottom>
                        {ad.category.name}
                        {ad.subcategory && (
                          <Typography variant="body2" color="text.secondary">
                            {ad.subcategory.name}
                          </Typography>
                        )}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                        Location
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {ad.city.name}, {ad.city.country.name}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                        Posted By
                      </Typography>
                      <Typography component="div" variant="body1" gutterBottom>
                        <Link href={`/users/${ad.user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {`${ad.user.firstName} ${ad.user.lastName}`}
                        </Link>
                        <Typography variant="body2" color="text.secondary">
                          {ad.user.email}
                        </Typography>
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                        Price
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        ${getCurrentAdVersionFor(ad).price}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                        Posted On
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {new Date(ad.createdAt).toLocaleString()}
                      </Typography>

                      {getCurrentAdVersionFor(ad).moderator && (
                        <>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                            Moderated By
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            <Link href={`/users/${getCurrentAdVersionFor(ad).moderator!.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              {`${getCurrentAdVersionFor(ad).moderator!.firstName} ${getCurrentAdVersionFor(ad).moderator!.lastName}`}
                            </Link>
                          </Typography>
                        </>
                      )}
                      
                      {getCurrentAdVersionFor(ad).status === 'rejected' && getCurrentAdVersionFor(ad).rejectionReason && (
                        <>
                          <Typography variant="subtitle2" color="error" sx={{ mt: 2 }}>
                            Rejection Reason
                          </Typography>
                          <Typography variant="body1" color="error.light">
                            {getCurrentAdVersionFor(ad).rejectionReason}
                          </Typography>
                        </>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {ad.versions.length > 1 && (
            <Grid size={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Version History
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {ad.versions.sort((a, b) => b.versionNumber - a.versionNumber).map((version) => (
                    <Accordion key={version.id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <Typography>
                            Version {version.versionNumber}
                            {version.versionNumber === getCurrentAdVersionFor(ad).versionNumber && (
                              <Chip label="Current" size="small" color="primary" sx={{ ml: 1 }} />
                            )}
                          </Typography>
                          <Box>
                            {getStatusChip(version.status)}
                            <Typography variant="caption" sx={{ ml: 2 }}>
                              {new Date(version.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid size={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Title
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {version.title}
                            </Typography>
                          </Grid>

                          <Grid size={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Description
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {version.description}
                            </Typography>
                          </Grid>

                          <Grid size={{xs: 12, md: 8}}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Price
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              ${version.price}
                            </Typography>
                          </Grid>

                          {version.moderator && (
                            <Grid size={{xs: 12, md: 8}}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Moderated By
                              </Typography>
                              <Typography variant="body1" gutterBottom>
                                <Link href={`/users/${version.moderator.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  {`${version.moderator.firstName} ${version.moderator.lastName}`}
                                </Link>
                              </Typography>
                            </Grid>
                          )}

                          {version.status === 'rejected' && version.rejectionReason && (
                            <Grid size={12}>
                              <Typography variant="subtitle2" color="error">
                                Rejection Reason
                              </Typography>
                              <Typography variant="body1" color="error.light">
                                {version.rejectionReason}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      ) : (
        <Alert severity="info">Ad not found</Alert>
      )}
    </Box>
  );
}