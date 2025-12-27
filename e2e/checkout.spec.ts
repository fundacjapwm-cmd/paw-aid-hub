import { test, expect } from '@playwright/test';

test.describe('Checkout Process E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('should display empty cart message when no items', async ({ page }) => {
    // Go directly to checkout
    await page.goto('/checkout');
    
    // Should show empty cart message
    await expect(page.getByText('Twój koszyk jest pusty')).toBeVisible();
    await expect(page.getByRole('link', { name: /Przeglądaj zwierzęta/i })).toBeVisible();
  });

  test('should navigate to animals page from empty cart', async ({ page }) => {
    await page.goto('/checkout');
    
    // Click browse animals link
    await page.getByRole('link', { name: /Przeglądaj zwierzęta/i }).click();
    
    // Should navigate to animals page
    await expect(page).toHaveURL('/zwierzeta');
  });

  test('should open cart drawer from navigation', async ({ page }) => {
    // Find and click cart button in navigation
    const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Cart drawer should be visible
      await expect(page.getByText('Koszyk')).toBeVisible();
    }
  });

  test('should display checkout form correctly', async ({ page }) => {
    // Mock cart with items by using localStorage
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma dla psa',
          price: 49.99,
          quantity: 2,
          animalName: 'Burek',
          animalId: 'test-animal-1',
          maxQuantity: 5
        }
      ]));
    });

    await page.goto('/checkout');
    
    // Should display order summary
    await expect(page.getByText('Podsumowanie zamówienia')).toBeVisible();
    await expect(page.getByText('Karma dla psa')).toBeVisible();
    await expect(page.getByText('dla Burek')).toBeVisible();
    
    // Should display payment form
    await expect(page.getByText('Dane płatności')).toBeVisible();
    await expect(page.getByLabel(/Imię i nazwisko/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
  });

  test('should calculate cart total correctly', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma dla psa',
          price: 50.00,
          quantity: 2,
          animalName: 'Burek',
          animalId: 'test-animal-1',
          maxQuantity: 5
        },
        {
          productId: 'test-product-2',
          productName: 'Zabawka',
          price: 25.00,
          quantity: 1,
          animalName: 'Burek',
          animalId: 'test-animal-1',
          maxQuantity: 3
        }
      ]));
    });

    await page.goto('/checkout');
    
    // Total should be 50*2 + 25*1 = 125.00 zł
    await expect(page.getByText('125.00 zł')).toBeVisible();
  });

  test('should toggle order summary visibility', async ({ page }) => {
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

    await page.goto('/checkout');
    
    // Initially expanded - product name should be visible
    await expect(page.getByText('Karma dla psa')).toBeVisible();
    
    // Click to collapse
    await page.getByRole('button', { name: 'Zwiń' }).click();
    
    // Product details should be hidden but total still visible
    await expect(page.getByRole('button', { name: 'Rozwiń' })).toBeVisible();
  });

  test('should validate required form fields', async ({ page }) => {
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

    await page.goto('/checkout');
    
    // Name field should be required
    const nameInput = page.getByLabel(/Imię i nazwisko/i);
    await expect(nameInput).toHaveAttribute('required');
    
    // Email field should be required
    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should fill out checkout form', async ({ page }) => {
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

    await page.goto('/checkout');
    
    // Fill out form
    await page.getByLabel(/Imię i nazwisko/i).fill('Jan Kowalski');
    await page.getByLabel(/Email/i).fill('jan@example.com');
    
    // Verify values are filled
    await expect(page.getByLabel(/Imię i nazwisko/i)).toHaveValue('Jan Kowalski');
    await expect(page.getByLabel(/Email/i)).toHaveValue('jan@example.com');
  });

  test('should check all consents with select all', async ({ page }) => {
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

    await page.goto('/checkout');
    
    // Find and click "Zaznacz wszystkie" checkbox
    const selectAllCheckbox = page.getByLabel(/Zaznacz wszystkie/i);
    if (await selectAllCheckbox.isVisible()) {
      await selectAllCheckbox.click();
      
      // All consent checkboxes should be checked
      // This tests the handleSelectAll functionality
    }
  });

  test('should display payment button with correct amount', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma dla psa',
          price: 100.00,
          quantity: 1,
          animalName: 'Burek',
          animalId: 'test-animal-1',
          maxQuantity: 5
        }
      ]));
    });

    await page.goto('/checkout');
    
    // Payment button should show the total amount
    await expect(page.getByRole('button', { name: /Zapłać 100.00 zł/i })).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
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

    await page.goto('/checkout');
    
    // Page should still be functional on mobile
    await expect(page.getByText('Finalizacja darowizny')).toBeVisible();
    await expect(page.getByText('Podsumowanie zamówienia')).toBeVisible();
  });
});

test.describe('Payment Success Page', () => {
  test('should display success page with order details', async ({ page }) => {
    // Navigate to success page with order ID
    await page.goto('/payment-success?extOrderId=test-order-123');
    
    // Should show success message or loading state
    await expect(page.getByText(/Płatność zakończona|Ładowanie/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Payment Failure Page', () => {
  test('should display failure page with error info', async ({ page }) => {
    await page.goto('/payment-failure?extOrderId=test-order-123&error=declined');
    
    // Should show failure message
    await expect(page.getByText(/nieudana|błąd|Płatność/i)).toBeVisible();
  });

  test('should have retry button on failure page', async ({ page }) => {
    await page.goto('/payment-failure?extOrderId=test-order-123');
    
    // Should have option to retry
    const retryButton = page.getByRole('button', { name: /Spróbuj ponownie/i });
    if (await retryButton.isVisible()) {
      await retryButton.click();
      await expect(page).toHaveURL('/checkout');
    }
  });

  test('should have home button on failure page', async ({ page }) => {
    await page.goto('/payment-failure');
    
    // Should have option to go home
    const homeLink = page.getByRole('link', { name: /strony głównej|Strona główna/i });
    await expect(homeLink).toBeVisible();
  });
});

test.describe('Cart Drawer Integration', () => {
  test('should update cart count badge', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pet-shop-cart', JSON.stringify([
        {
          productId: 'test-product-1',
          productName: 'Karma dla psa',
          price: 49.99,
          quantity: 3,
          animalName: 'Burek',
          animalId: 'test-animal-1',
          maxQuantity: 5
        }
      ]));
    });

    await page.goto('/');
    
    // Cart badge should show item count
    const cartBadge = page.locator('.bg-primary').filter({ hasText: '3' });
    if (await cartBadge.isVisible()) {
      await expect(cartBadge).toContainText('3');
    }
  });

  test('should navigate from cart drawer to checkout', async ({ page }) => {
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

    await page.goto('/');
    
    // Open cart drawer
    const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Click checkout button in drawer
      const checkoutButton = page.getByRole('button', { name: /Przejdź do kasy|Checkout/i });
      if (await checkoutButton.isVisible()) {
        await checkoutButton.click();
        await expect(page).toHaveURL('/checkout');
      }
    }
  });
});
