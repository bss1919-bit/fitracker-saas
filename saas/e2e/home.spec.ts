import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    // Basic check for the marketing or login page
    await expect(page).toHaveTitle(/FitTracker Pro/);
});

test('login flow redirect', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to auth/login or similar if not authenticated
    await expect(page.url()).toContain('/auth');
});
