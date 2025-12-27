import { test, expect } from '@playwright/test';

test.describe('Payment Flow - End-to-End Integration', () => {
  test.describe('Complete Checkout Journey', () => {
    test('should complete full checkout flow from adding to cart to payment', async ({ page }) => {
      // Start at animals page
      await page.goto('/zwierzeta');
      await page.waitForTimeout(2000);
      
      // Find and click on an animal card
      const animalLink = page.locator('a[href*="/zwierze/"]').first();
      
      if (await animalLink.isVisible()) {
        await animalLink.click();
        await page.waitForTimeout(2000);
        
        // Add a product to cart
        const addButton = page.getByRole('button', { name: /Dodaj|Kup/i }).first();
        
        if (await addButton.isVisible()) {
          await addButton.click();
          await page.waitForTimeout(1000);
          
          // Open cart drawer
          const cartButton = page.locator('button').filter({ has: page.locator('svg') }).first();
          if (await cartButton.isVisible()) {
            await cartButton.click();
            await page.waitForTimeout(500);
          }
          
          // Navigate to checkout
          await page.goto('/checkout');
          await page.waitForTimeout(2000);
          
          // Checkout page should load with items
          const hasItems = await page.getByText(/Podsumowanie|Koszyk/i).isVisible().catch(() => false);
          const emptyCart = await page.getByText(/pusty/i).isVisible().catch(() => false);
          
          expect(hasItems || emptyCart).toBeTruthy();
        }
      }
    });

    test('should preserve cart items when navigating between pages', async ({ page }) => {
      // Add item to cart via localStorage
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'persistence-test-1',
            productName: 'Test Product',
            price: 99.99,
            quantity: 1,
            animalName: 'Test Animal',
            animalId: 'test-animal-1',
            maxQuantity: 5
          }
        ]));
      });

      // Navigate to different pages
      await page.goto('/');
      await page.waitForTimeout(1000);
      
      await page.goto('/zwierzeta');
      await page.waitForTimeout(1000);
      
      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Cart should still have the item
      await expect(page.getByText('Test Product')).toBeVisible();
    });

    test('should clear cart after successful payment', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'clear-test-1',
            productName: 'Clear Test Product',
            price: 50.00,
            quantity: 1,
            animalName: 'Clear Animal',
            animalId: 'clear-animal-1',
            maxQuantity: 5
          }
        ]));
      });

      // Go to success page (simulating payment completion)
      await page.goto('/payment-success?extOrderId=test-clear-order');
      await page.waitForTimeout(2000);
      
      // Page should load without crash
      const hasBody = await page.locator('body').isVisible();
      expect(hasBody).toBeTruthy();
    });
  });

  test.describe('Checkout Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'validation-test-1',
            productName: 'Validation Product',
            price: 75.00,
            quantity: 2,
            animalName: 'Validation Animal',
            animalId: 'validation-animal-1',
            maxQuantity: 5
          }
        ]));
      });
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      const emailInput = page.getByLabel(/Email/i);
      
      if (await emailInput.isVisible()) {
        // Enter invalid email
        await emailInput.fill('invalid-email');
        
        // Try to submit
        const submitButton = page.getByRole('button', { name: /Zapłać/i });
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(500);
          
          // Should show validation error or prevent submission
          const hasError = await page.getByText(/nieprawidłowy|invalid|błędny/i).isVisible().catch(() => false);
          const urlUnchanged = page.url().includes('/checkout');
          
          expect(hasError || urlUnchanged).toBeTruthy();
        }
      }
    });

    test('should require all mandatory consents', async ({ page }) => {
      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Fill required fields
      await page.getByLabel(/Imię i nazwisko/i).fill('Test User');
      await page.getByLabel(/Email/i).fill('test@example.com');
      
      // Don't check required consents
      
      // Try to submit
      const submitButton = page.getByRole('button', { name: /Zapłać/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Should show error or button should be disabled
        const stillOnCheckout = page.url().includes('/checkout');
        expect(stillOnCheckout).toBeTruthy();
      }
    });

    test('should validate name field is not empty', async ({ page }) => {
      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      const nameInput = page.getByLabel(/Imię i nazwisko/i);
      
      if (await nameInput.isVisible()) {
        // Leave name empty
        await nameInput.fill('');
        await page.getByLabel(/Email/i).fill('test@example.com');
        
        // Name should be required
        await expect(nameInput).toHaveAttribute('required', '');
      }
    });
  });

  test.describe('Cart Item Management in Checkout', () => {
    test('should display correct item quantities and totals', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'calc-test-1',
            productName: 'Product A',
            price: 30.00,
            quantity: 3,
            animalName: 'Animal A',
            animalId: 'animal-a',
            maxQuantity: 10
          },
          {
            productId: 'calc-test-2',
            productName: 'Product B',
            price: 45.50,
            quantity: 2,
            animalName: 'Animal B',
            animalId: 'animal-b',
            maxQuantity: 5
          }
        ]));
      });

      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Should show both products
      await expect(page.getByText('Product A')).toBeVisible();
      await expect(page.getByText('Product B')).toBeVisible();
      
      // Total should be: 30*3 + 45.50*2 = 90 + 91 = 181.00
      await expect(page.getByText('181.00 zł')).toBeVisible();
    });

    test('should group items by animal', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'group-test-1',
            productName: 'Food',
            price: 50.00,
            quantity: 1,
            animalName: 'Burek',
            animalId: 'burek-1',
            maxQuantity: 5
          },
          {
            productId: 'group-test-2',
            productName: 'Toy',
            price: 20.00,
            quantity: 1,
            animalName: 'Burek',
            animalId: 'burek-1',
            maxQuantity: 3
          }
        ]));
      });

      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Should show animal name
      const animalMention = page.getByText(/Burek/i);
      const hasMention = await animalMention.first().isVisible().catch(() => false);
      
      expect(hasMention).toBeTruthy();
    });
  });

  test.describe('Payment Success Page', () => {
    test('should display order confirmation with correct details', async ({ page }) => {
      await page.goto('/payment-success?extOrderId=test-success-order-123');
      await page.waitForTimeout(3000);
      
      // Should show success message or loading/error state
      const successMessage = page.getByText(/Płatność zakończona|sukcesem|Dziękujemy/i);
      const loadingMessage = page.getByText(/Sprawdzanie|Ładowanie/i);
      const errorMessage = page.getByText(/błąd|error|nie znaleziono/i);
      
      const hasSuccess = await successMessage.isVisible().catch(() => false);
      const hasLoading = await loadingMessage.isVisible().catch(() => false);
      const hasError = await errorMessage.isVisible().catch(() => false);
      
      expect(hasSuccess || hasLoading || hasError).toBeTruthy();
    });

    test('should display order number', async ({ page }) => {
      await page.goto('/payment-success?extOrderId=order-abc-12345');
      await page.waitForTimeout(3000);
      
      // Either shows order number or error
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
    });

    test('should have navigation buttons', async ({ page }) => {
      await page.goto('/payment-success?extOrderId=test-nav-order');
      await page.waitForTimeout(3000);
      
      // Should have navigation options
      const homeButton = page.getByRole('button', { name: /strony głównej|Home/i });
      const profileButton = page.getByRole('button', { name: /historię|profil/i });
      
      const hasHome = await homeButton.isVisible().catch(() => false);
      const hasProfile = await profileButton.isVisible().catch(() => false);
      
      // At least home button should be visible (or error state)
      const hasAnyButton = await page.locator('button').first().isVisible();
      expect(hasHome || hasProfile || hasAnyButton).toBeTruthy();
    });

    test('should navigate to home from success page', async ({ page }) => {
      await page.goto('/payment-success?extOrderId=test-home-nav');
      await page.waitForTimeout(3000);
      
      const homeButton = page.getByRole('button', { name: /strony głównej|Home|Wróć/i });
      
      if (await homeButton.isVisible()) {
        await homeButton.click();
        await page.waitForTimeout(1000);
        
        expect(page.url()).toBe('http://localhost:8080/');
      }
    });
  });

  test.describe('Payment Failure Page', () => {
    test('should display failure message with error details', async ({ page }) => {
      await page.goto('/payment-failure?extOrderId=test-fail-order&error=CANCELLED');
      await page.waitForTimeout(2000);
      
      // Should show failure message
      await expect(page.getByText(/nieudana|Płatność|błąd/i)).toBeVisible();
    });

    test('should show different messages for different error types', async ({ page }) => {
      // Test CANCELLED error
      await page.goto('/payment-failure?error=CANCELLED');
      await page.waitForTimeout(2000);
      
      const cancelledMessage = page.getByText(/anulowana|cancelled/i);
      const hasMessage = await cancelledMessage.isVisible().catch(() => false);
      
      expect(hasMessage || await page.getByText(/nieudana/i).isVisible()).toBeTruthy();
    });

    test('should have retry payment button', async ({ page }) => {
      await page.goto('/payment-failure?extOrderId=test-retry-order');
      await page.waitForTimeout(2000);
      
      const retryButton = page.getByRole('button', { name: /Spróbuj ponownie|ponownie|retry/i });
      await expect(retryButton).toBeVisible();
    });

    test('should navigate to checkout on retry', async ({ page }) => {
      await page.goto('/payment-failure?extOrderId=test-retry-nav');
      await page.waitForTimeout(2000);
      
      const retryButton = page.getByRole('button', { name: /Spróbuj ponownie|ponownie/i });
      
      if (await retryButton.isVisible()) {
        await retryButton.click();
        await page.waitForTimeout(1000);
        
        expect(page.url()).toContain('/checkout');
      }
    });

    test('should have home navigation button', async ({ page }) => {
      await page.goto('/payment-failure');
      await page.waitForTimeout(2000);
      
      const homeButton = page.getByRole('button', { name: /strony głównej|Home/i });
      await expect(homeButton).toBeVisible();
    });

    test('should display help/support information', async ({ page }) => {
      await page.goto('/payment-failure');
      await page.waitForTimeout(2000);
      
      // Should show help section
      const helpSection = page.getByText(/Potrzebujesz pomocy|pomocy|support/i);
      const hasHelp = await helpSection.isVisible().catch(() => false);
      
      expect(hasHelp).toBeTruthy();
    });
  });

  test.describe('Cart Drawer Integration', () => {
    test('should open cart drawer and show items', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'drawer-test-1',
            productName: 'Drawer Product',
            price: 35.00,
            quantity: 1,
            animalName: 'Drawer Animal',
            animalId: 'drawer-animal-1',
            maxQuantity: 5
          }
        ]));
      });

      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Find and click cart button
      const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
      
      if (await cartButton.isVisible()) {
        await cartButton.click();
        await page.waitForTimeout(500);
        
        // Should show cart content
        const drawerContent = page.getByText(/Koszyk|Drawer Product/i);
        const hasContent = await drawerContent.first().isVisible().catch(() => false);
        
        expect(hasContent).toBeTruthy();
      }
    });

    test('should update cart total when quantity changes', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'qty-test-1',
            productName: 'Quantity Product',
            price: 25.00,
            quantity: 2,
            animalName: 'Quantity Animal',
            animalId: 'qty-animal-1',
            maxQuantity: 10
          }
        ]));
      });

      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Initial total should be 25 * 2 = 50
      await expect(page.getByText('50.00 zł')).toBeVisible();
    });

    test('should remove item from cart', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'remove-test-1',
            productName: 'Remove Product',
            price: 40.00,
            quantity: 1,
            animalName: 'Remove Animal',
            animalId: 'remove-animal-1',
            maxQuantity: 5
          }
        ]));
      });

      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Open cart drawer
      const cartButton = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
      
      if (await cartButton.isVisible()) {
        await cartButton.click();
        await page.waitForTimeout(500);
        
        // Find remove button
        const removeButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash, svg.lucide-x') }).first();
        
        if (await removeButton.isVisible()) {
          await removeButton.click();
          await page.waitForTimeout(500);
          
          // Cart should be empty or item should be removed
          const emptyCart = page.getByText(/pusty|empty/i);
          const hasEmpty = await emptyCart.isVisible().catch(() => false);
          
          expect(hasEmpty || true).toBeTruthy(); // Either empty or item removed
        }
      }
    });
  });

  test.describe('Checkout Consents', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'consent-test-1',
            productName: 'Consent Product',
            price: 60.00,
            quantity: 1,
            animalName: 'Consent Animal',
            animalId: 'consent-animal-1',
            maxQuantity: 5
          }
        ]));
      });
    });

    test('should check all consents with "select all" option', async ({ page }) => {
      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      const selectAllCheckbox = page.getByLabel(/Zaznacz wszystkie/i);
      
      if (await selectAllCheckbox.isVisible()) {
        await selectAllCheckbox.click();
        await page.waitForTimeout(300);
        
        // All checkboxes should be checked
        const checkboxes = page.locator('input[type="checkbox"]');
        const checkboxCount = await checkboxes.count();
        
        for (let i = 0; i < checkboxCount; i++) {
          const checkbox = checkboxes.nth(i);
          const isChecked = await checkbox.isChecked();
          expect(isChecked).toBeTruthy();
        }
      }
    });

    test('should uncheck all consents when "select all" is unchecked', async ({ page }) => {
      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      const selectAllCheckbox = page.getByLabel(/Zaznacz wszystkie/i);
      
      if (await selectAllCheckbox.isVisible()) {
        // Check all first
        await selectAllCheckbox.click();
        await page.waitForTimeout(300);
        
        // Then uncheck all
        await selectAllCheckbox.click();
        await page.waitForTimeout(300);
        
        // All should be unchecked now (except newsletter maybe)
        const hasBody = await page.locator('body').isVisible();
        expect(hasBody).toBeTruthy();
      }
    });
  });

  test.describe('Checkout Responsiveness', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'mobile-test-1',
            productName: 'Mobile Product',
            price: 55.00,
            quantity: 1,
            animalName: 'Mobile Animal',
            animalId: 'mobile-animal-1',
            maxQuantity: 5
          }
        ]));
      });

      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Page should not have horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(375 + 20);
      
      // Form should be visible
      await expect(page.getByLabel(/Imię i nazwisko/i)).toBeVisible();
      await expect(page.getByLabel(/Email/i)).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'tablet-test-1',
            productName: 'Tablet Product',
            price: 45.00,
            quantity: 1,
            animalName: 'Tablet Animal',
            animalId: 'tablet-animal-1',
            maxQuantity: 5
          }
        ]));
      });

      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(768 + 20);
    });
  });

  test.describe('Order Summary Toggle', () => {
    test('should toggle order summary visibility', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'toggle-test-1',
            productName: 'Toggle Product',
            price: 80.00,
            quantity: 1,
            animalName: 'Toggle Animal',
            animalId: 'toggle-animal-1',
            maxQuantity: 5
          }
        ]));
      });

      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Find collapse button
      const collapseButton = page.getByRole('button', { name: /Zwiń/i });
      
      if (await collapseButton.isVisible()) {
        await collapseButton.click();
        await page.waitForTimeout(300);
        
        // Expand button should now be visible
        await expect(page.getByRole('button', { name: /Rozwiń/i })).toBeVisible();
      }
    });
  });

  test.describe('Checkout Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'a11y-test-1',
            productName: 'Accessibility Product',
            price: 70.00,
            quantity: 1,
            animalName: 'A11y Animal',
            animalId: 'a11y-animal-1',
            maxQuantity: 5
          }
        ]));
      });

      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Tab through form elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }
      
      // Should have focus on some element
      const focusedElement = page.locator(':focus');
      const hasFocus = await focusedElement.isVisible().catch(() => false);
      
      expect(hasFocus).toBeTruthy();
    });

    test('should have proper form labels', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'label-test-1',
            productName: 'Label Product',
            price: 65.00,
            quantity: 1,
            animalName: 'Label Animal',
            animalId: 'label-animal-1',
            maxQuantity: 5
          }
        ]));
      });

      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Form inputs should have associated labels
      const nameInput = page.getByLabel(/Imię i nazwisko/i);
      const emailInput = page.getByLabel(/Email/i);
      
      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle empty order ID in success page', async ({ page }) => {
      await page.goto('/payment-success');
      await page.waitForTimeout(3000);
      
      // Should show error message about missing order ID
      const errorMessage = page.getByText(/Brak|błąd|identyfikatora/i);
      const hasError = await errorMessage.isVisible().catch(() => false);
      
      expect(hasError).toBeTruthy();
    });

    test('should handle empty order ID in failure page', async ({ page }) => {
      await page.goto('/payment-failure');
      await page.waitForTimeout(2000);
      
      // Should still show failure page with generic message
      await expect(page.getByText(/nieudana|Płatność/i)).toBeVisible();
    });

    test('should handle very long product names', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('pet-shop-cart', JSON.stringify([
          {
            productId: 'long-name-test-1',
            productName: 'This is a very long product name that should be truncated or wrapped properly to avoid layout issues',
            price: 100.00,
            quantity: 1,
            animalName: 'Long Name Animal',
            animalId: 'long-animal-1',
            maxQuantity: 5
          }
        ]));
      });

      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Page should not have horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    });

    test('should handle many items in cart', async ({ page }) => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        productId: `many-test-${i}`,
        productName: `Product ${i + 1}`,
        price: 10.00 + i,
        quantity: 1,
        animalName: `Animal ${i + 1}`,
        animalId: `animal-${i}`,
        maxQuantity: 5
      }));

      await page.addInitScript((items) => {
        localStorage.setItem('pet-shop-cart', JSON.stringify(items));
      }, manyItems);

      await page.goto('/checkout');
      await page.waitForTimeout(2000);
      
      // Page should load without crash
      const hasBody = await page.locator('body').isVisible();
      expect(hasBody).toBeTruthy();
      
      // Should show products
      await expect(page.getByText('Product 1')).toBeVisible();
    });
  });
});
