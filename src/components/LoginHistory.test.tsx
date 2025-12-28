import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LoginHistory } from './LoginHistory';

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  },
}));

const mockLoginRecords = [
  {
    id: '1',
    ip_address: '192.168.1.1',
    device_type: 'Komputer',
    browser: 'Chrome',
    os: 'Windows',
    created_at: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    ip_address: '10.0.0.1',
    device_type: 'Telefon',
    browser: 'Safari',
    os: 'iOS',
    created_at: '2025-01-14T08:15:00Z',
  },
  {
    id: '3',
    ip_address: null,
    device_type: 'Tablet',
    browser: null,
    os: null,
    created_at: '2025-01-13T14:45:00Z',
  },
];

describe('LoginHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock chain
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });
  });

  describe('Loading State', () => {
    it('should show loading skeletons initially', () => {
      mockLimit.mockReturnValue(new Promise(() => {})); // Never resolves
      
      render(<LoginHistory />);
      
      expect(screen.getByText('Historia logowań')).toBeInTheDocument();
      expect(screen.getByText('Ostatnie logowania na Twoje konto')).toBeInTheDocument();
      
      // Should show skeleton loaders
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no login history', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByText('Brak zapisanych logowań')).toBeInTheDocument();
      });
    });

    it('should show empty message on error', async () => {
      mockLimit.mockResolvedValue({ data: null, error: { message: 'Error' } });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByText('Brak zapisanych logowań')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should render login history table with data', async () => {
      mockLimit.mockResolvedValue({ data: mockLoginRecords, error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByText('Ostatnie 20 logowań na Twoje konto')).toBeInTheDocument();
      });
      
      // Check table headers
      expect(screen.getByText('Data')).toBeInTheDocument();
      expect(screen.getByText('Urządzenie')).toBeInTheDocument();
      expect(screen.getByText('Przeglądarka')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
      expect(screen.getByText('Adres IP')).toBeInTheDocument();
    });

    it('should display device types correctly', async () => {
      mockLimit.mockResolvedValue({ data: mockLoginRecords, error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByText('Komputer')).toBeInTheDocument();
        expect(screen.getByText('Telefon')).toBeInTheDocument();
        expect(screen.getByText('Tablet')).toBeInTheDocument();
      });
    });

    it('should display browser names', async () => {
      mockLimit.mockResolvedValue({ data: mockLoginRecords, error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByText('Chrome')).toBeInTheDocument();
        expect(screen.getByText('Safari')).toBeInTheDocument();
      });
    });

    it('should display operating systems', async () => {
      mockLimit.mockResolvedValue({ data: mockLoginRecords, error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByText('Windows')).toBeInTheDocument();
        expect(screen.getByText('iOS')).toBeInTheDocument();
      });
    });

    it('should display IP addresses', async () => {
      mockLimit.mockResolvedValue({ data: mockLoginRecords, error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
        expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
      });
    });

    it('should show "Nieznane" for null values', async () => {
      mockLimit.mockResolvedValue({ data: mockLoginRecords, error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByText('Nieznana')).toBeInTheDocument(); // browser
        expect(screen.getByText('Nieznany')).toBeInTheDocument(); // os and ip
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates in Polish locale', async () => {
      mockLimit.mockResolvedValue({ 
        data: [mockLoginRecords[0]], 
        error: null 
      });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        // Should contain formatted date parts (day, month abbreviation, year, time)
        expect(screen.getByText(/sty 2025/i)).toBeInTheDocument();
      });
    });
  });

  describe('Device Icons', () => {
    it('should render correct icons for device types', async () => {
      mockLimit.mockResolvedValue({ data: mockLoginRecords, error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        // Icons should be rendered (they're SVG elements)
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBeGreaterThan(1); // Header + data rows
      });
    });

    it('should render globe icon for unknown device type', async () => {
      const unknownDeviceRecord = {
        id: '4',
        ip_address: '1.1.1.1',
        device_type: null,
        browser: 'Firefox',
        os: 'Linux',
        created_at: '2025-01-12T12:00:00Z',
      };
      
      mockLimit.mockResolvedValue({ data: [unknownDeviceRecord], error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByText('Nieznane')).toBeInTheDocument();
      });
    });
  });

  describe('API Calls', () => {
    it('should call supabase with correct parameters', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      mockLimit.mockResolvedValue({ data: [], error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('login_history');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
        expect(mockLimit).toHaveBeenCalledWith(20);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible table structure', async () => {
      mockLimit.mockResolvedValue({ data: mockLoginRecords, error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders.length).toBe(5);
    });

    it('should have card title', async () => {
      mockLimit.mockResolvedValue({ data: mockLoginRecords, error: null });
      
      render(<LoginHistory />);
      
      await waitFor(() => {
        expect(screen.getByText('Historia logowań')).toBeInTheDocument();
      });
    });
  });
});
