/**
 * Playwright E2E Tests — PH Payroll Calculator
 *
 * Run with: npx playwright test (from e2e-tests/)
 *
 * These tests check both happy paths and known bugs.
 * Candidates should add more tests as they discover additional issues.
 */

// const { test, expect, request } = require('@playwright/test')

const BASE_URL = 'http://localhost:5173'
import {test, expect} from '@playwright/test';
import { WebData } from './employee_test_data';
const data = WebData;

test('Add Employee', async ({ page }) =>{

  // Filling in required fields
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Employees', exact: true }).click();
  await page.getByRole('button', { name: '+ Add Employee' }).click();
  await page.getByRole('textbox').first().fill(data.first_name);
  await page.getByRole('textbox').nth(1).fill(data.last_name);
  await page.locator('input[type="email"]').fill(data.email);
  await page.getByRole('textbox').nth(3).fill(data.position);
  await page.getByRole('textbox').nth(4).fill(data.department);
  await page.getByRole('combobox').selectOption(data.employment_type);
  await page.getByRole('spinbutton').fill(data.salary);
  await page.locator('input[type="date"]').fill(data.date_hired);
  await page.getByRole('button', { name: 'Add Employee' }).click();
});

test('Sad flow - Add Employee: Invalid email', async({page}) =>{

  // Filling in required fields
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Employees', exact: true }).click();
  await page.getByRole('button', { name: '+ Add Employee' }).click();
  await page.getByRole('textbox').first().fill(data.first_name);
  await page.getByRole('textbox').nth(1).fill(data.last_name);
  await page.locator('input[type="email"]').fill(data.invalid_email);
  await page.getByRole('textbox').nth(3).fill(data.position);
  await page.getByRole('textbox').nth(4).fill(data.department);
  await page.getByRole('combobox').selectOption(data.employment_type);
  await page.getByRole('spinbutton').fill(data.salary);
  await page.locator('input[type="date"]').fill(data.date_hired);
  await page.getByRole('button', { name: 'Add Employee' }).click();

  // Assert
  const error = page.locator("//div[@class='alert alert-danger mt-3']")
  await expect(error).toHaveText(/Enter a valid email address./);
})

test('Delete employee', async({page}) =>{

  // Filling in required fields
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Employees', exact: true }).click();
  await page.getByRole('button', { name: '+ Add Employee' }).click();
  await page.getByRole('textbox').first().fill(data.first_name);
  await page.getByRole('textbox').nth(1).fill(data.last_name);
  await page.locator('input[type="email"]').fill(data.email);
  await page.getByRole('textbox').nth(3).fill(data.position);
  await page.getByRole('textbox').nth(4).fill(data.department);
  await page.getByRole('combobox').selectOption(data.employment_type);
  await page.getByRole('spinbutton').fill(data.salary);
  await page.locator('input[type="date"]').fill(data.date_hired);
  await page.getByRole('button', { name: 'Add Employee' }).click();

  // Deleting specific user
  const fullName = `${data.first_name} ${data.last_name}`;
  const row = page.locator(`tr:has-text("${fullName}")`);
  await row.getByRole('button', { name: 'Delete' }).click();
  await page.locator('.btn.btn-danger').dblclick();
})

test('Calculate Payroll', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Calculator', exact: true }).click();
  await page.getByRole('combobox').first().selectOption('18');
  await page.getByRole('combobox').nth(1).selectOption('1');
  await page.getByRole('combobox').nth(2).selectOption('2025');
  await page.getByRole('button', { name: 'Calculate Payroll' }).click();

  // Assert
  const payroll = page.locator("//div[@class='card-body']")
  await expect(payroll).toBeVisible();
});

test('Filter payroll history', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'History', exact: true }).click();
  const yearSelect = page.getByRole('combobox');
  await yearSelect.selectOption(data.year);

  // Assert the year is selected
  await expect(yearSelect).toHaveValue(data.year);

  const payrollRows = page.locator('td tr');
  const rowCount = await payrollRows.count();

  for (let i = 0; i < rowCount; i++) {
    const rowText = await payrollRows.nth(i).innerText();
    expect(rowText).toContain(data.year)
  }
});
