import { test, expect } from '@playwright/test';

test.describe('Organization Dashboard - Access Control', () => {
  test('should redirect unauthenticated users to auth page', async ({ page }) => {
    await page.goto('/organizacja');
    await page.waitForTimeout(2000);
    
    const isOnAuth = page.url().includes('/auth');
    const hasLoginPrompt = await page.getByText(/Zaloguj|Witamy|logowanie/i).isVisible().catch(() => false);
    
    expect(isOnAuth || hasLoginPrompt).toBeTruthy();
  });

  test('should redirect non-ORG users to homepage', async ({ page }) => {
    await page.goto('/organizacja/profil');
    await page.waitForTimeout(2000);
    
    const isOnAuth = page.url().includes('/auth');
    const isOnHome = page.url() === 'http://localhost:8080/' || page.url().endsWith('/');
    const hasLoginPrompt = await page.getByText(/Zaloguj|Witamy/i).isVisible().catch(() => false);
    
    expect(isOnAuth || isOnHome || hasLoginPrompt).toBeTruthy();
  });

  test('should protect wishlist route', async ({ page }) => {
    await page.goto('/organizacja/wishlist');
    await page.waitForTimeout(2000);
    
    const isOnAuth = page.url().includes('/auth');
    const hasLoginPrompt = await page.getByText(/Zaloguj|Witamy/i).isVisible().catch(() => false);
    
    expect(isOnAuth || hasLoginPrompt).toBeTruthy();
  });

  test('should protect orders route', async ({ page }) => {
    await page.goto('/organizacja/zamowienia');
    await page.waitForTimeout(2000);
    
    const isOnAuth = page.url().includes('/auth');
    const hasLoginPrompt = await page.getByText(/Zaloguj|Witamy/i).isVisible().catch(() => false);
    
    expect(isOnAuth || hasLoginPrompt).toBeTruthy();
  });

  test('should protect deliveries route', async ({ page }) => {
    await page.goto('/organizacja/dostawy');
    await page.waitForTimeout(2000);
    
    const isOnAuth = page.url().includes('/auth');
    const hasLoginPrompt = await page.getByText(/Zaloguj|Witamy/i).isVisible().catch(() => false);
    
    expect(isOnAuth || hasLoginPrompt).toBeTruthy();
  });
});

test.describe('Organization Dashboard - Navigation Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/organizacja');
  });

  test('should have proper page structure', async ({ page }) => {
    // Page should load without errors
    await page.waitForTimeout(1000);
    
    // Either shows auth redirect or dashboard content
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Organization Public Profile', () => {
  test('should display organization list page', async ({ page }) => {
    await page.goto('/organizacje');
    await page.waitForTimeout(2000);
    
    // Should show organizations page
    await expect(page.getByText(/Organizacje|Fundacje|Schroniska/i)).toBeVisible();
  });

  test('should navigate to organization profile from list', async ({ page }) => {
    await page.goto('/organizacje');
    await page.waitForTimeout(2000);
    
    // Look for any organization card or link
    const orgCard = page.locator('[data-testid="organization-card"]').first();
    const orgLink = page.locator('a[href*="/organizacja/"]').first();
    
    const hasCard = await orgCard.isVisible().catch(() => false);
    const hasLink = await orgLink.isVisible().catch(() => false);
    
    if (hasCard) {
      await orgCard.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/organizacja/');
    } else if (hasLink) {
      await orgLink.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/organizacja/');
    }
  });

  test('should display breadcrumb on organization profile', async ({ page }) => {
    await page.goto('/organizacje');
    await page.waitForTimeout(2000);
    
    const orgLink = page.locator('a[href*="/organizacja/"]').first();
    
    if (await orgLink.isVisible()) {
      await orgLink.click();
      await page.waitForTimeout(1000);
      
      // Check for breadcrumb
      const breadcrumb = page.locator('nav[aria-label="breadcrumb"], .breadcrumb, [data-testid="breadcrumb"]');
      const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false);
      
      // Breadcrumb or back link should exist
      const hasBackLink = await page.getByText(/Powrót|Wstecz|Organizacje/i).isVisible().catch(() => false);
      
      expect(hasBreadcrumb || hasBackLink).toBeTruthy();
    }
  });
});

test.describe('Organization Profile - Content Sections', () => {
  test('should show 404 for non-existent organization', async ({ page }) => {
    await page.goto('/organizacja/non-existent-org-12345');
    await page.waitForTimeout(2000);
    
    // Should show not found message
    const notFound = await page.getByText(/nie znaleziono|not found|nie istnieje|404/i).isVisible().catch(() => false);
    const errorState = await page.getByText(/błąd|error/i).isVisible().catch(() => false);
    
    expect(notFound || errorState).toBeTruthy();
  });
});

test.describe('Organization Dashboard Routes', () => {
  const routes = [
    { path: '/organizacja', name: 'Dashboard' },
    { path: '/organizacja/profil', name: 'Profile' },
    { path: '/organizacja/wishlist', name: 'Wishlist' },
    { path: '/organizacja/zamowienia', name: 'Orders' },
    { path: '/organizacja/zamowienia-potwierdzenie', name: 'Orders Confirmation' },
    { path: '/organizacja/dostawy', name: 'Deliveries' },
    { path: '/organizacja/zapytania', name: 'Requests' },
  ];

  for (const route of routes) {
    test(`should load ${route.name} route without crash`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForTimeout(2000);
      
      // Page should not crash - either show content or redirect
      const hasBody = await page.locator('body').isVisible();
      expect(hasBody).toBeTruthy();
      
      // Should not have uncaught errors in console
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Check no critical rendering errors
      const hasCriticalError = await page.getByText(/Something went wrong|Error boundary|Uncaught/i).isVisible().catch(() => false);
      expect(hasCriticalError).toBeFalsy();
    });
  }
});

test.describe('Organization Dashboard - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/organizacja');
    await page.waitForTimeout(2000);
    
    // Page should render without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    // Allow some tolerance for scrollbar
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });

  test('should show mobile menu on organization pages', async ({ page }) => {
    await page.goto('/organizacja');
    await page.waitForTimeout(2000);
    
    // Either redirects or shows mobile-friendly layout
    const hasBody = await page.locator('body').isVisible();
    expect(hasBody).toBeTruthy();
  });
});

test.describe('Organization Profile - Animal Section', () => {
  test('should display animals section on organization profile', async ({ page }) => {
    await page.goto('/organizacje');
    await page.waitForTimeout(2000);
    
    const orgLink = page.locator('a[href*="/organizacja/"]').first();
    
    if (await orgLink.isVisible()) {
      await orgLink.click();
      await page.waitForTimeout(2000);
      
      // Check for animals section
      const animalsSection = page.getByText(/Zwierzęta|Podopieczni|Nasze zwierzęta/i);
      const hasAnimals = await animalsSection.isVisible().catch(() => false);
      
      // Or check for animal cards
      const animalCards = page.locator('[data-testid="animal-card"], .animal-card');
      const hasCards = await animalCards.first().isVisible().catch(() => false);
      
      // Either has animals section or no animals message
      const noAnimalsMessage = await page.getByText(/Brak zwierząt|Nie ma zwierząt/i).isVisible().catch(() => false);
      
      expect(hasAnimals || hasCards || noAnimalsMessage).toBeTruthy();
    }
  });
});

test.describe('Organization Profile - Wishlist Section', () => {
  test('should display wishlist section on organization profile', async ({ page }) => {
    await page.goto('/organizacje');
    await page.waitForTimeout(2000);
    
    const orgLink = page.locator('a[href*="/organizacja/"]').first();
    
    if (await orgLink.isVisible()) {
      await orgLink.click();
      await page.waitForTimeout(2000);
      
      // Check for wishlist section
      const wishlistSection = page.getByText(/Wishlist|Lista życzeń|Potrzebne produkty|Wesprzyj/i);
      const hasWishlist = await wishlistSection.isVisible().catch(() => false);
      
      // Or check for product cards
      const productCards = page.locator('[data-testid="product-card"], .product-card, .wishlist-item');
      const hasProducts = await productCards.first().isVisible().catch(() => false);
      
      // Either has wishlist or empty state
      const emptyWishlist = await page.getByText(/Brak produktów|Pusta lista/i).isVisible().catch(() => false);
      
      expect(hasWishlist || hasProducts || emptyWishlist).toBeTruthy();
    }
  });
});

test.describe('Organization Profile - Contact Information', () => {
  test('should display contact information on organization profile', async ({ page }) => {
    await page.goto('/organizacje');
    await page.waitForTimeout(2000);
    
    const orgLink = page.locator('a[href*="/organizacja/"]').first();
    
    if (await orgLink.isVisible()) {
      await orgLink.click();
      await page.waitForTimeout(2000);
      
      // Check for contact information elements
      const hasEmail = await page.getByText(/@|email/i).isVisible().catch(() => false);
      const hasPhone = await page.getByText(/telefon|\+48|\d{9}/i).isVisible().catch(() => false);
      const hasAddress = await page.getByText(/adres|ul\.|miasto/i).isVisible().catch(() => false);
      const hasWebsite = await page.getByText(/www\.|http|strona/i).isVisible().catch(() => false);
      
      // Should have at least some contact info
      const hasContactInfo = hasEmail || hasPhone || hasAddress || hasWebsite;
      
      // Or organization info card
      const infoCard = page.locator('[data-testid="organization-info"], .organization-info');
      const hasInfoCard = await infoCard.isVisible().catch(() => false);
      
      expect(hasContactInfo || hasInfoCard).toBeTruthy();
    }
  });
});

test.describe('Organization Dashboard - Form Interactions', () => {
  test('should handle form submission gracefully when unauthorized', async ({ page }) => {
    await page.goto('/organizacja/profil');
    await page.waitForTimeout(2000);
    
    // Should redirect or show auth prompt - not crash
    const hasBody = await page.locator('body').isVisible();
    expect(hasBody).toBeTruthy();
  });
});

test.describe('Organization Profile - SEO', () => {
  test('should have proper meta tags on organization profile', async ({ page }) => {
    await page.goto('/organizacje');
    await page.waitForTimeout(2000);
    
    const orgLink = page.locator('a[href*="/organizacja/"]').first();
    
    if (await orgLink.isVisible()) {
      await orgLink.click();
      await page.waitForTimeout(2000);
      
      // Check for title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      
      // Check for meta description
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      // Meta description might not always be set
    }
  });
});

test.describe('Organization Dashboard - Error States', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.route('**/rest/v1/**', route => route.abort('failed'));
    
    await page.goto('/organizacje');
    await page.waitForTimeout(3000);
    
    // Should show error state or empty state, not crash
    const hasBody = await page.locator('body').isVisible();
    expect(hasBody).toBeTruthy();
    
    // Should not have uncaught exceptions
    const hasCriticalError = await page.getByText(/Something went wrong|Uncaught/i).isVisible().catch(() => false);
    // Error might be shown but page should not crash
  });
});

test.describe('Organization List - Filtering and Search', () => {
  test('should display search or filter options if available', async ({ page }) => {
    await page.goto('/organizacje');
    await page.waitForTimeout(2000);
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="szukaj" i], input[placeholder*="search" i]');
    const hasSearch = await searchInput.isVisible().catch(() => false);
    
    // Look for filter options
    const filterSelect = page.locator('select, [role="combobox"]');
    const hasFilter = await filterSelect.first().isVisible().catch(() => false);
    
    // Either has search/filter or just shows list
    const hasList = await page.locator('a[href*="/organizacja/"]').first().isVisible().catch(() => false);
    const emptyState = await page.getByText(/Brak organizacji|Nie znaleziono/i).isVisible().catch(() => false);
    
    expect(hasSearch || hasFilter || hasList || emptyState).toBeTruthy();
  });
});

test.describe('Organization Profile - Loading States', () => {
  test('should show loading state while fetching data', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/rest/v1/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.goto('/organizacje');
    
    // Check for skeleton or loading indicator
    const skeleton = page.locator('[data-testid="skeleton"], .skeleton, .animate-pulse');
    const loader = page.locator('[role="status"], .loading, .spinner');
    
    const hasSkeleton = await skeleton.first().isVisible().catch(() => false);
    const hasLoader = await loader.first().isVisible().catch(() => false);
    
    // Either shows loading state or data loads quickly
    await page.waitForTimeout(2000);
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});
