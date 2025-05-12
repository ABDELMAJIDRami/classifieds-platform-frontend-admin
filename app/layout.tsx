'use client';

import * as React from 'react';
import {NextAppProvider} from '@toolpad/core/nextjs';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AdsClickRoundedIcon from '@mui/icons-material/AdsClickRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';

import type {Navigation} from '@toolpad/core/AppProvider';
import theme from '../theme';
import axios from "@/src/core/network/axios";
import {User} from "@/src/core/interfaces/User";
import {useRouter} from "next/navigation";
import {Suspense, useEffect} from "react";
import {NotificationsProvider} from "@toolpad/core";
import { UserContext } from '@/src/core/contexts/UserContext';
import {Box, CircularProgress} from "@mui/material";


const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: '',
    title: 'Dashboard',
    icon: <DashboardRoundedIcon/>,
  },
  {
    segment: 'users',
    title: 'Users',
    icon: <PersonRoundedIcon/>,
    pattern: 'users/(new|[0-9]+|[0-9]+/edit)',
  },
  {
    segment: 'ads',
    title: 'Ads',
    icon: <AdsClickRoundedIcon/>,
    pattern: 'ads/([0-9]+|[0-9]+/moderate)?',
    children: [
      {
        segment: '',
        title: 'All Ads',
      },
      {
        segment: 'pending',
        title: 'Pending Ads',
      }
    ]
  },
  {
    segment: 'categories',
    title: 'Categories',
    icon: <CategoryRoundedIcon/>,
    children: [
      {
        segment: '',
        title: 'All Categories',
      },
      {
        segment: 'subcategories',
        title: 'Subcategories',
      }
    ]
  },
];

const BRANDING = {
  title: 'Classifieds Platform - Admin',
};


export default function RootLayout(props: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<User>();
  const [isFetchingUser, setIsFetchingUser] = React.useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/users/me');
      setUser(response.data);
    } catch (e) {
      console.error('Failed to load user:', e);
    } finally {
      setIsFetchingUser(false);
    }
  };

  const signOut = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(undefined)
      router.replace('/signin');
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchUser().then();
  }, []);

  useEffect(() => {
    if (!isFetchingUser && (!user || user.role.name !== 'manager')) {
      router.push('/signin');
    }
  }, [isFetchingUser, user]);

  return (
    <html lang="en" data-toolpad-color-scheme="light" suppressHydrationWarning>
    <body>
    {/* This is needed bcz I am using useSearchParams inside PendingAdsContent */}
    <Suspense
      fallback={
        <Box sx={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>
          <CircularProgress/>
        </Box>
      }
    >
      <AppRouterCacheProvider options={{enableCssLayer: true}}>
        <UserContext.Provider value={{user, setUser, isFetchingUser}}>
          <NextAppProvider
            navigation={NAVIGATION}
            branding={BRANDING}
            session={user ? {user: {id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email}} : null}
            authentication={{
              signIn: () => {
                router.replace('/signin')
              },
              signOut
            }}
            theme={theme}
          >
            <NotificationsProvider>
                {props.children}
            </NotificationsProvider>
          </NextAppProvider>
        </UserContext.Provider>
      </AppRouterCacheProvider>
    </Suspense>
    </body>
    </html>
  );
}