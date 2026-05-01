import { render, screen } from '@testing-library/react';
import Profile from '../src/app/profile/page';
import { SessionProvider } from 'next-auth/react';
import React from 'react';

describe('Profile Page', () => {
  it('renders loading state correctly', () => {
    render(<SessionProvider session={null}><Profile /></SessionProvider>);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('renders user templates and public templates when session is authenticated', async () => {
    // Mock session data
    const session = { user: { id: 'test-user-id' }, status: 'authenticated' };

    render(<SessionProvider session={session}><Profile /></SessionProvider>);
    expect(await screen.findByText(/mis plantillas/i)).toBeInTheDocument();
    expect(await screen.findByText(/plantillas públicas/i)).toBeInTheDocument();
  });
});
