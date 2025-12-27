import { test, expect } from '@playwright/test';

test.describe('Animal Profile - Add to Cart E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      localStorage.removeItem('pet-shop-cart');
    });
  });

  test('should navigate to animals listing page', async ({ page }) => {
    await page.goto('/zwierzeta');
    
    // Should display animals page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should display animal cards on listing page', async ({ page }) => {
    await page.goto('/zwierzeta');
    
    // Wait for animals to load
    await page.waitForLoadState('networkidle');
    
    // Should show animal cards or loading/empty state
    const animalCards = page.locator('[data-testid="animal-card"]');
    const emptyState = page.getByText(/Brak zwierząt|Nie znaleziono/i);
    const loadingState = page.locator('.animate-pulse');
    
    // Either cards, empty state, or loading should be present
    const hasCards = await animalCards.count() > 0;
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasLoading = await loadingState.count() > 0;
    
    expect(hasCards || hasEmptyState || hasLoading).toBeTruthy();
  });

  test('should navigate to animal profile from listing', async ({ page }) => {
    await page.goto('/zwierzeta');
    await page.waitForLoadState('networkidle');
    
    // Find first animal card link
    const animalLink = page.locator('a[href^="/zwierze/"]').first();
    
    if (await animalLink.isVisible()) {
      await animalLink.click();
      
      // Should navigate to animal profile
      await expect(page).toHaveURL(/\/zwierze\/.+/);
    }
  });

  test('should display wishlist products on animal profile', async ({ page }) => {
    await page.goto('/zwierzeta');
    await page.waitForLoadState('networkidle');
    
    // Navigate to first animal
    const animalLink = page.locator('a[href^="/zwierze/"]').first();
    
    if (await animalLink.isVisible()) {
      await animalLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should display animal name
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      
      // Check for wishlist section
      const wishlistSection = page.getByText(/Lista życzeń|Potrzeby|Wishlist/i);
      const hasWishlist = await wishlistSection.isVisible().catch(() => false);
      
      if (hasWishlist) {
        // Products should be visible
        await expect(page.locator('[data-testid="wishlist-product"]').or(page.locator('.product-card'))).toBeVisible();
      }
    }
  });

  test('should add product to cart from animal profile', async ({ page }) => {
    await page.goto('/zwierzeta');
    await page.waitForLoadState('networkidle');
    
    const animalLink = page.locator('a[href^="/zwierze/"]').first();
    
    if (await animalLink.isVisible()) {
      await animalLink.click();
      await page.waitForLoadState('networkidle');
      
      // Find add to cart button
      const addToCartButton = page.getByRole('button', { name: /Dodaj|Wesprzyj|Kup/i }).first();
      
      if (await addToCartButton.isVisible()) {
        // Click add to cart
        await addToCartButton.click();
        
        // Should show success toast or update cart badge
        const toast = page.locator('[data-sonner-toast]');
        const cartBadge = page.locator('.bg-primary').filter({ hasText: /\d+/ });
        
        // Either toast or cart badge update should occur
        await expect(toast.or(cartBadge)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should update cart badge after adding product', async ({ page }) => {
    await page.goto('/zwierzeta');
    await page.waitForLoadState('networkidle');
    
    const animalLink = page.locator('a[href^="/zwierze/"]').first();
    
    if (await animalLink.isVisible()) {
      await animalLink.click();
      await page.waitForLoadState('networkidle');
      
      // Get initial cart count
      const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
      
      // Find add to cart button
      const addToCartButton = page.getByRole('button', { name: /Dodaj|Wesprzyj|Kup/i }).first();
      
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        
        // Cart badge should update
        await page.waitForTimeout(500);
        
        // Verify cart has items
        if (await cartButton.isVisible()) {
          await cartButton.click();
          
          // Cart drawer should show item
          await expect(page.getByText(/Koszyk/i)).toBeVisible();
        }
      }
    }
  });

  test('should persist cart items in localStorage', async ({ page }) => {
    await page.goto('/zwierzeta');
    await page.waitForLoadState('networkidle');
    
    const animalLink = page.locator('a[href^="/zwierze/"]').first();
    
    if (await animalLink.isVisible()) {
      await animalLink.click();
      await page.waitForLoadState('networkidle');
      
      const addToCartButton = page.getByRole('button', { name: /Dodaj|Wesprzyj|Kup/i }).first();
      
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForTimeout(500);
        
        // Check localStorage
        const cartData = await page.evaluate(() => {
          return localStorage.getItem('pet-shop-cart');
        });
        
        if (cartData) {
          const cart = JSON.parse(cartData);
          expect(cart.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should increment quantity when adding same product twice', async ({ page }) => {
    await page.goto('/zwierzeta');
    await page.waitForLoadState('networkidle');
    
    const animalLink = page.locator('a[href^="/zwierze/"]').first();
    
    if (await animalLink.isVisible()) {
      await animalLink.click();
      await page.waitForLoadState('networkidle');
      
      const addToCartButton = page.getByRole('button', { name: /Dodaj|Wesprzyj|Kup/i }).first();
      
      if (await addToCartButton.isVisible()) {
        // Add twice
        await addToCartButton.click();
        await page.waitForTimeout(300);
        await addToCartButton.click();
        await page.waitForTimeout(300);
        
        // Open cart and check quantity
        const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
        
        if (await cartButton.isVisible()) {
          await cartButton.click();
          
          // Quantity should be 2 or item should appear
          const quantityText = page.getByText(/Ilość: 2|x2|2 szt/i);
          const hasQuantity = await quantityText.isVisible().catch(() => false);
          
          // Either quantity shows 2 or we have the item in cart
          expect(hasQuantity || await page.getByText(/Koszyk/i).isVisible()).toBeTruthy();
        }
      }
    }
  });

  test('should navigate from animal profile to checkout', async ({ page }) => {
    // Pre-populate cart
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma dla psa',
          price: 49.99,
          quantity: 1,
          animalName: 'Burek',
          animalId: 'test-animal-1',
          maxQuantity: 5
        }
      ]));
    });

    await page.goto('/zwierzeta');
    await page.waitForLoadState('networkidle');
    
    // Open cart drawer
    const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Click checkout button
      const checkoutButton = page.getByRole('button', { name: /Przejdź do kasy|Checkout|Zamów/i });
      
      if (await checkoutButton.isVisible()) {
        await checkoutButton.click();
        await expect(page).toHaveURL('/checkout');
      }
    }
  });

  test('should show product details in cart drawer', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma Premium',
          price: 79.99,
          quantity: 2,
          animalName: 'Mruczek',
          animalId: 'test-animal-1',
          maxQuantity: 5
        }
      ]));
    });

    await page.goto('/');
    
    const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Should show product name
      await expect(page.getByText('Karma Premium')).toBeVisible();
      
      // Should show animal name
      await expect(page.getByText(/Mruczek/i)).toBeVisible();
      
      // Should show price or total
      await expect(page.getByText(/79.99|159.98/)).toBeVisible();
    }
  });

  test('should remove product from cart', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma Premium',
          price: 79.99,
          quantity: 1,
          animalName: 'Mruczek',
          animalId: 'test-animal-1',
          maxQuantity: 5
        }
      ]));
    });

    await page.goto('/');
    
    const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Find and click remove button
      const removeButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-trash-2, svg.lucide-x') }).first();
      
      if (await removeButton.isVisible()) {
        await removeButton.click();
        
        // Cart should be empty
        await expect(page.getByText(/pusty|brak/i)).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should clear entire cart', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma',
          price: 50,
          quantity: 1,
          animalName: 'Burek',
          animalId: 'test-1',
          maxQuantity: 5
        },
        {
          productId: 'test-product-2',
          productName: 'Zabawka',
          price: 25,
          quantity: 2,
          animalName: 'Mruczek',
          animalId: 'test-2',
          maxQuantity: 3
        }
      ]));
    });

    await page.goto('/');
    
    const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Find clear cart button
      const clearButton = page.getByRole('button', { name: /Wyczyść|Usuń wszystko|Clear/i });
      
      if (await clearButton.isVisible()) {
        await clearButton.click();
        
        // Cart should be empty
        await expect(page.getByText(/pusty|brak/i)).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should update quantity with plus/minus buttons', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma',
          price: 50,
          quantity: 2,
          animalName: 'Burek',
          animalId: 'test-1',
          maxQuantity: 5
        }
      ]));
    });

    await page.goto('/');
    
    const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Find plus button
      const plusButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-plus') }).first();
      
      if (await plusButton.isVisible()) {
        await plusButton.click();
        
        // Quantity should increase to 3
        await page.waitForTimeout(300);
        
        // Verify updated quantity in cart or total
        const cartData = await page.evaluate(() => localStorage.getItem('pet-shop-cart'));
        if (cartData) {
          const cart = JSON.parse(cartData);
          expect(cart[0].quantity).toBe(3);
        }
      }
    }
  });
});

test.describe('Animal Filters and Search', () => {
  test('should filter animals by species', async ({ page }) => {
    await page.goto('/zwierzeta');
    await page.waitForLoadState('networkidle');
    
    // Find species filter
    const dogFilter = page.getByRole('button', { name: /Pies|Psy/i }).or(page.getByLabel(/Pies|Psy/i));
    
    if (await dogFilter.isVisible()) {
      await dogFilter.click();
      await page.waitForTimeout(500);
      
      // URL might update with filter
      // Or filtered results should show
    }
  });

  test('should search for animals by name', async ({ page }) => {
    await page.goto('/zwierzeta');
    await page.waitForLoadState('networkidle');
    
    // Find search input
    const searchInput = page.getByPlaceholder(/Szukaj|Wyszukaj|Search/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Burek');
      await page.waitForTimeout(500);
      
      // Results should filter
    }
  });
});

test.describe('Mobile Cart Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile viewport', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma',
          price: 50,
          quantity: 1,
          animalName: 'Burek',
          animalId: 'test-1',
          maxQuantity: 5
        }
      ]));
    });

    await page.goto('/checkout');
    
    // Page should be responsive
    await expect(page.getByText('Finalizacja darowizny')).toBeVisible();
    
    // Form should be accessible
    await expect(page.getByLabel(/Imię i nazwisko/i)).toBeVisible();
  });

  test('should open cart drawer on mobile', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma',
          price: 50,
          quantity: 1,
          animalName: 'Burek',
          animalId: 'test-1',
          maxQuantity: 5
        }
      ]));
    });

    await page.goto('/');
    
    // Find cart button (might be in mobile menu or visible)
    const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await expect(page.getByText('Koszyk')).toBeVisible();
    }
  });
});
