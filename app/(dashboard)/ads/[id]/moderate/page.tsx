'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Button, 
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from '@/src/core/network/axios';
import {Ad} from "@/src/core/interfaces/Ad";
import {useNotifications} from "@toolpad/core";
import {getCurrentAdVersionFor} from "@/src/core/helpers";


export default function ModerateAdPage() {
  const notifications = useNotifications();
  const params = useParams();
  const router = useRouter();
  const adId = params.id as string;

  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchAd = async () => {
    try {
      const {data} = await axios.get(`/ads/${adId}`);
      console.log(data)
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
  
  const handleDecisionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDecision(event.target.value as 'approved' | 'rejected');
  };

  const handleRejectionReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRejectionReason(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const moderationData = {
        status: decision,
        ...(decision === 'rejected' && {rejectionReason}),
      };

      await axios.patch(`/ads/${adId}/versions/${getCurrentAdVersionFor(ad!).id}/moderate`, moderationData);

      notifications.show(`Ad has been ${decision} successfully`, {
        severity: "success",
        autoHideDuration: 3000
      });

      router.replace(`/ads/${adId}`);
    } catch (e) {
      // @ts-ignore
      notifications.show(`Error moderating ad. ${e.response?.data?.message || e.message}`, {
        severity: "error",
        autoHideDuration: 3000
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAd();
  }, [adId]);

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
            Moderate Ad
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : ad ? (
        <Grid container spacing={3}>
          <Grid size={{xs: 12, md: 6}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ad Details
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  {getCurrentAdVersionFor(ad).title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Posted by {ad.user.firstName} {ad.user.lastName} on {new Date(ad.createdAt).toLocaleDateString()}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {ad.category.name}
                  {ad.subcategory && ` > ${ad.subcategory.name}`}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {ad.city.name}, {ad.city.country.name}
                </Typography>
                
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  ${getCurrentAdVersionFor(ad).price}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 3 }}>
                  Description:
                </Typography>
                
                <Typography variant="body1">
                  {getCurrentAdVersionFor(ad).description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{xs: 12, md: 6}}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Moderation Decision
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <form onSubmit={handleSubmit}>
                  <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <FormLabel component="legend">Decision</FormLabel>
                    <RadioGroup
                      name="decision"
                      value={decision}
                      onChange={handleDecisionChange}
                    >
                      <FormControlLabel 
                        value="approved" 
                        control={<Radio />} 
                        label="Approve Ad" 
                      />
                      <FormControlLabel 
                        value="rejected" 
                        control={<Radio />} 
                        label="Reject Ad" 
                      />
                    </RadioGroup>
                  </FormControl>
                  
                  {decision === 'rejected' && (
                    <TextField
                      fullWidth
                      label="Rejection Reason"
                      multiline
                      rows={4}
                      value={rejectionReason}
                      onChange={handleRejectionReasonChange}
                      required
                      sx={{ mb: 3 }}
                      placeholder="Please provide a reason for rejecting this ad"
                    />
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => router.back()}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color={decision === 'approved' ? 'success' : 'error'}
                      startIcon={decision === 'approved' ? <CheckCircleIcon /> : <CancelIcon />}
                      disabled={submitting || (decision === 'rejected' && !rejectionReason)}
                    >
                      {decision === 'approved' ? 'Approve' : 'Reject'}
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">Ad not found or already moderated</Alert>
      )}
    </Box>
  );
}