'use client';

import * as React from 'react';
import { SignInPage } from '@toolpad/core/SignInPage';
import {AuthProvider} from '@toolpad/core';
import {useRouter} from "next/navigation";
import axios from '../../src/core/network/axios'


const providerMap = [
  {id: "credentials", name: "Credentials"},
];


export default function SignIn() {
  const router = useRouter();

  const signIn = async (provider: AuthProvider, formData: FormData) => {
    if (provider.id === "credentials") {
      try {
        await axios.post('/auth/admin/login', {
          email: formData.get('email'),
          password: formData.get('password')
        })
        router.replace('/');
      } catch (e: any) {
        // error message to be displayed by SignInPage
        if (e.status === 401 || e.status === 403 ) {
          return {error: e.response?.data?.message}
        }
        return {error: 'Something went wrong.'}
      }
    }

    return {};  // added to avoid Typescript error when passing this function to SignInPage
  }

  return (
    <SignInPage
      providers={providerMap}
      signIn={signIn}
    />
  );
}
