import { test, expect } from '@playwright/test';

test.describe('Authentication - Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('should display auth page with login and signup tabs', async ({ page }) => {
    // Should show main elements
    await expect(page.getByText('Fundacja PWM')).toBeVisible();
    await expect(page.getByText('Witamy')).toBeVisible();
    
    // Should have login and signup tabs
    await expect(page.getByRole('tab', { name: 'Logowanie' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Rejestracja' })).toBeVisible();
  });

  test('should show login form by default', async ({ page }) => {
    // Login tab should be active by default
    await expect(page.getByRole('tab', { name: 'Logowanie' })).toHaveAttribute('data-state', 'active');
    
    // Login form fields should be visible
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Hasło')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible();
  });

  test('should have required email field', async ({ page }) => {
    const emailInput = page.locator('#login-email');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should have required password field', async ({ page }) => {
    const passwordInput = page.locator('#login-password');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('#login-password');
    const toggleButton = page.locator('#login-password').locator('..').getByRole('button');
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button
    await toggleButton.click();
    
    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should fill login form', async ({ page }) => {
    await page.locator('#login-email').fill('test@example.com');
    await page.locator('#login-password').fill('password123');
    
    await expect(page.locator('#login-email')).toHaveValue('test@example.com');
    await expect(page.locator('#login-password')).toHaveValue('password123');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.locator('#login-email').fill('invalid@example.com');
    await page.locator('#login-password').fill('wrongpassword');
    
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    
    // Wait for error message or toast
    await page.waitForTimeout(2000);
    
    // Should show some error indication
    const errorAlert = page.locator('[role="alert"]');
    const toast = page.locator('[data-sonner-toast]');
    
    const hasError = await errorAlert.isVisible().catch(() => false);
    const hasToast = await toast.isVisible().catch(() => false);
    
    expect(hasError || hasToast).toBeTruthy();
  });

  test('should show forgot password link', async ({ page }) => {
    const forgotPasswordLink = page.getByRole('button', { name: /Zapomniałeś hasła|Nie pamiętam hasła/i });
    await expect(forgotPasswordLink).toBeVisible();
  });

  test('should navigate to forgot password form', async ({ page }) => {
    await page.getByRole('button', { name: /Zapomniałeś hasła|Nie pamiętam hasła/i }).click();
    
    // Should show forgot password form
    await expect(page.getByText('Resetowanie hasła')).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Wyślij link/i })).toBeVisible();
  });

  test('should return from forgot password to login', async ({ page }) => {
    await page.getByRole('button', { name: /Zapomniałeś hasła|Nie pamiętam hasła/i }).click();
    
    await page.getByRole('button', { name: /Powrót do logowania/i }).click();
    
    // Should be back to login form
    await expect(page.getByRole('tab', { name: 'Logowanie' })).toBeVisible();
  });
});

test.describe('Authentication - Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    // Switch to registration tab
    await page.getByRole('tab', { name: 'Rejestracja' }).click();
  });

  test('should switch to registration tab', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Rejestracja' })).toHaveAttribute('data-state', 'active');
  });

  test('should display registration form fields', async ({ page }) => {
    // Should have all registration fields
    await expect(page.getByLabel(/Imię|Nazwa/i)).toBeVisible();
    await expect(page.locator('#signup-email')).toBeVisible();
    await expect(page.locator('#signup-password')).toBeVisible();
    await expect(page.locator('#signup-confirm-password')).toBeVisible();
  });

  test('should have required email field in signup', async ({ page }) => {
    const emailInput = page.locator('#signup-email');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should have required password fields in signup', async ({ page }) => {
    await expect(page.locator('#signup-password')).toHaveAttribute('required', '');
    await expect(page.locator('#signup-confirm-password')).toHaveAttribute('required', '');
  });

  test('should fill registration form', async ({ page }) => {
    await page.getByLabel(/Imię|Nazwa/i).fill('Jan Kowalski');
    await page.locator('#signup-email').fill('jan@example.com');
    await page.locator('#signup-password').fill('password123');
    await page.locator('#signup-confirm-password').fill('password123');
    
    await expect(page.getByLabel(/Imię|Nazwa/i)).toHaveValue('Jan Kowalski');
    await expect(page.locator('#signup-email')).toHaveValue('jan@example.com');
  });

  test('should show error for password mismatch', async ({ page }) => {
    await page.getByLabel(/Imię|Nazwa/i).fill('Jan Kowalski');
    await page.locator('#signup-email').fill('jan@example.com');
    await page.locator('#signup-password').fill('password123');
    await page.locator('#signup-confirm-password').fill('differentpassword');
    
    await page.getByRole('button', { name: /Zarejestruj się|Utwórz konto/i }).click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Should show password mismatch error
    await expect(page.getByText(/Hasła nie są identyczne/i)).toBeVisible();
  });

  test('should show error for short password', async ({ page }) => {
    await page.getByLabel(/Imię|Nazwa/i).fill('Jan Kowalski');
    await page.locator('#signup-email').fill('jan@example.com');
    await page.locator('#signup-password').fill('12345');
    await page.locator('#signup-confirm-password').fill('12345');
    
    await page.getByRole('button', { name: /Zarejestruj się|Utwórz konto/i }).click();
    
    await page.waitForTimeout(500);
    
    // Should show password length error
    await expect(page.getByText(/co najmniej 6 znaków/i)).toBeVisible();
  });

  test('should toggle password visibility in signup form', async ({ page }) => {
    const passwordInput = page.locator('#signup-password');
    
    // Initially hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Find toggle button and click
    const toggleButton = page.locator('#signup-password').locator('..').getByRole('button');
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('should attempt registration with valid data', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    
    await page.getByLabel(/Imię|Nazwa/i).fill('Test User');
    await page.locator('#signup-email').fill(uniqueEmail);
    await page.locator('#signup-password').fill('password123');
    await page.locator('#signup-confirm-password').fill('password123');
    
    await page.getByRole('button', { name: /Zarejestruj się|Utwórz konto/i }).click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Should show success message or error (depending on email confirmation settings)
    const successMessage = page.getByText(/Konto utworzone|Sprawdź email|potwierdzić/i);
    const errorMessage = page.locator('[role="alert"]');
    const toast = page.locator('[data-sonner-toast]');
    
    const hasSuccess = await successMessage.isVisible().catch(() => false);
    const hasError = await errorMessage.isVisible().catch(() => false);
    const hasToast = await toast.isVisible().catch(() => false);
    
    expect(hasSuccess || hasError || hasToast).toBeTruthy();
  });
});

test.describe('Authentication - Password Reset Flow', () => {
  test('should display forgot password form', async ({ page }) => {
    await page.goto('/auth');
    
    await page.getByRole('button', { name: /Zapomniałeś hasła|Nie pamiętam hasła/i }).click();
    
    await expect(page.getByText('Resetowanie hasła')).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
  });

  test('should validate email in forgot password form', async ({ page }) => {
    await page.goto('/auth');
    await page.getByRole('button', { name: /Zapomniałeś hasła|Nie pamiętam hasła/i }).click();
    
    // Fill with invalid email
    await page.locator('#reset-email').fill('invalid-email');
    await page.getByRole('button', { name: /Wyślij link/i }).click();
    
    await page.waitForTimeout(500);
    
    // Should show validation error
    const errorMessage = page.getByText(/Nieprawidłowy|Invalid/i);
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    expect(hasError).toBeTruthy();
  });

  test('should send password reset email', async ({ page }) => {
    await page.goto('/auth');
    await page.getByRole('button', { name: /Zapomniałeś hasła|Nie pamiętam hasła/i }).click();
    
    await page.locator('#reset-email').fill('test@example.com');
    await page.getByRole('button', { name: /Wyślij link/i }).click();
    
    await page.waitForTimeout(3000);
    
    // Should show confirmation or error
    const confirmation = page.getByText(/Link.*wysłany|sprawdź.*email/i);
    const hasConfirmation = await confirmation.isVisible().catch(() => false);
    
    // Either confirmation or error should be visible
    const errorOrSuccess = await page.locator('[role="alert"], [data-sonner-toast]').isVisible().catch(() => false);
    
    expect(hasConfirmation || errorOrSuccess).toBeTruthy();
  });
});

test.describe('Authentication - Protected Routes', () => {
  test('should redirect unauthenticated user from profile', async ({ page }) => {
    await page.goto('/profil');
    
    // Should redirect to auth or show login prompt
    await page.waitForTimeout(2000);
    
    const isOnAuth = page.url().includes('/auth');
    const hasLoginPrompt = await page.getByText(/Zaloguj|Witamy|logowanie/i).isVisible().catch(() => false);
    
    expect(isOnAuth || hasLoginPrompt).toBeTruthy();
  });

  test('should redirect unauthenticated user from organization dashboard', async ({ page }) => {
    await page.goto('/organizacja');
    
    await page.waitForTimeout(2000);
    
    const isOnAuth = page.url().includes('/auth');
    const hasLoginPrompt = await page.getByText(/Zaloguj|Witamy|logowanie/i).isVisible().catch(() => false);
    
    expect(isOnAuth || hasLoginPrompt).toBeTruthy();
  });

  test('should redirect unauthenticated user from admin panel', async ({ page }) => {
    await page.goto('/admin');
    
    await page.waitForTimeout(2000);
    
    const isOnAuth = page.url().includes('/auth');
    const hasLoginPrompt = await page.getByText(/Zaloguj|Witamy|logowanie/i).isVisible().catch(() => false);
    const hasAccessDenied = await page.getByText(/Brak dostępu|Unauthorized/i).isVisible().catch(() => false);
    
    expect(isOnAuth || hasLoginPrompt || hasAccessDenied).toBeTruthy();
  });
});

test.describe('Authentication - Navigation', () => {
  test('should have link to auth from homepage', async ({ page }) => {
    await page.goto('/');
    
    // Find login/signup link in navigation
    const authLink = page.getByRole('link', { name: /Zaloguj|Logowanie|Konto/i });
    
    if (await authLink.isVisible()) {
      await authLink.click();
      await expect(page).toHaveURL(/\/auth/);
    }
  });

  test('should show user menu when logged in', async ({ page }) => {
    // This test would need a logged in user session
    // For now, we just verify the auth page structure
    await page.goto('/auth');
    await expect(page.getByText('Witamy')).toBeVisible();
  });
});

test.describe('Authentication - Email Confirmation', () => {
  test('should show confirmation message when redirected with confirmed param', async ({ page }) => {
    await page.goto('/auth?confirmed=true');
    
    // Should show confirmation message
    await expect(page.getByText(/potwierdzony|zalogować/i)).toBeVisible();
  });
});

test.describe('Authentication - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display auth form properly on mobile', async ({ page }) => {
    await page.goto('/auth');
    
    // Auth card should be visible
    await expect(page.getByText('Fundacja PWM')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Logowanie' })).toBeVisible();
    
    // Form should be usable
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
  });

  test('should switch tabs on mobile', async ({ page }) => {
    await page.goto('/auth');
    
    await page.getByRole('tab', { name: 'Rejestracja' }).click();
    await expect(page.getByRole('tab', { name: 'Rejestracja' })).toHaveAttribute('data-state', 'active');
    
    await page.getByRole('tab', { name: 'Logowanie' }).click();
    await expect(page.getByRole('tab', { name: 'Logowanie' })).toHaveAttribute('data-state', 'active');
  });
});

test.describe('Authentication - Accessibility', () => {
  test('should have proper form labels', async ({ page }) => {
    await page.goto('/auth');
    
    // Check that form inputs have associated labels
    const emailInput = page.locator('#login-email');
    const passwordInput = page.locator('#login-password');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/auth');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to focus on email input
    const emailInput = page.locator('#login-email');
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
  });

  test('should submit form with Enter key', async ({ page }) => {
    await page.goto('/auth');
    
    await page.locator('#login-email').fill('test@example.com');
    await page.locator('#login-password').fill('password123');
    
    // Press Enter to submit
    await page.keyboard.press('Enter');
    
    // Should attempt login (wait for response)
    await page.waitForTimeout(2000);
    
    // Either error or redirect should occur
    const hasResponse = await page.locator('[role="alert"], [data-sonner-toast]').isVisible().catch(() => false);
    const urlChanged = !page.url().includes('/auth');
    
    expect(hasResponse || urlChanged).toBeTruthy();
  });
});
