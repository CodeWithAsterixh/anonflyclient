/**
 * @file useAuth/index.ts
 * @description Export the shared authentication context hook.
 */

import { useAuth as useAuthFromContext } from '../../app/contexts/AuthContext';

export const useAuth = useAuthFromContext;
export * from './types';
