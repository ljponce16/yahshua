const { test, expect, request } = require('@playwright/test')

const BASE_URL = 'http://localhost:3000'

test.describe('Employees Test', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/employees')
    });

    test('Employees Module Loads Correctly', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Employees' })).toBeVisible()
    })

    test('Add Employee function (', async ({ page }) => {
        await page.getByRole('button', {name: '+ Add Employee'}).click()
        await page.locator('label:text("First Name *")').locator('..').locator('input').fill('John');
        await page.locator('label:text("Last Name *")').locator('..').locator('input').fill('Doe');
        await page.locator('label:text("Email *")').locator('..').locator('input').fill('johndoe@company.doe');
        await page.locator('label:text("Position *")').locator('..').locator('input').fill('Intern');
        await page.locator('label:text("Department *")').locator('..').locator('input').fill('Engineering');
        await page.locator('label:text("Employment Type *")').locator('..').locator('select').selectOption({value: 'regular'});
        await page.locator('label:text("Monthly Salary (₱) *")').locator('..').locator('input').fill('20000');
        await page.locator('label:text("Date Hired *")').locator('..').locator('input').fill('2026-01-01');
        await page.getByRole('button', {name: 'Add Employee'}).click()

        const row = page.getByRole('row', { name: /John.*Doe/i });
        await expect(row).toBeVisible();
        await expect(row).toContainText('johndoe@company.doe');
        await expect(row).toContainText('Intern');
    })

    test('Blank Input Field Add Employee', async ({ page }) => {
        await page.getByRole('button', {name: '+ Add Employee'}).click()
       
        await page.getByRole('button', {name: 'Add Employee'}).click()

        await expect(page.getByRole('button', {name: '+ Add Employee'})).not.toBeVisible()
    })
    
})

test.describe('Calculator Test', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/calculate')
    });

    test('Calculator Module Loads Correctly', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Payroll Calculator' })).toBeVisible()
    })

    test('Calculate Payroll Function', async ({ page }) => {
        await page.locator('label:text("Employee *")').locator('..').locator('select').selectOption({value: "1"});
        await page.locator('label:text("Month *")').locator('..').locator('select').selectOption({value: "1"});
        await page.locator('label:text("Year *")').locator('..').locator('select').selectOption({value: "2026"});

        await page.getByRole('button', {name: 'Calculate Payroll'}).click()
        const netPay = page.locator('div:text("Net Pay")').locator('..').locator('div.text-success')
        await expect(netPay).toBeVisible()
    })

    test('Calculate Payroll with Negative Override Salary', async ({ page }) => {
        await page.locator('label:text("Employee *")').locator('..').locator('select').selectOption({value: "1"});
        await page.locator('label:text("Month *")').locator('..').locator('select').selectOption({value: "1"});
        await page.locator('label:text("Year *")').locator('..').locator('select').selectOption({value: "2026"});
        await page.getByPlaceholder("Leave blank to use employee's salary").fill("-20000");

        await expect(page.getByText("Salary must be a positive integer")).toBeVisible();

    })
    
})