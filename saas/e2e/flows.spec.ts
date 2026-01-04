import { test, expect } from '@playwright/test';

test.describe('Dashboard Flows', () => {
    test('unauthenticated redirect', async ({ page }) => {
        await page.goto('/dashboard');
        // Verify redirection
        await expect(page).toHaveURL(/.*\/auth\/login/);
    });

    test('login page renders correctly', async ({ page }) => {
        await page.goto('/auth/login');
        // Look for login text (depending on locale, but FitTracker is always there)
        await expect(page.locator('body')).toContainText('FitTracker');
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });
});

test.describe('Public Pages', () => {
    test('join page 404 for invalid coach', async ({ page }) => {
        const res = await page.goto('/en/join/00000000-0000-0000-0000-000000000000');
        // Next.js default notFound() might return 404 or show a page
        await expect(page.locator('h1, h2, p, body')).toContainText(/404|not found/i);
    });
});
