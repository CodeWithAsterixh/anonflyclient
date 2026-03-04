import React from 'react';

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'light' | 'dark';
  children?: React.ReactNode;
}
