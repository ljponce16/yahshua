const { test, expect } = require('@playwright/test')

const API_URL = 'http://localhost:8000/api'

test.describe('QA Assessment - Payroll API', () => {
  test('calculates payroll successfully for a valid employee', async ({ request }) => {
    const response = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {
        employee_id: 1,
        period_month: 7,
        period_year: 2025,
      },
    })

    expect(response.status()).toBe(200)

    const body = await response.json()

    expect(body).toHaveProperty('basic_salary')
    expect(body).toHaveProperty('income_tax')
    expect(body).toHaveProperty('net_pay')
  })

  test('rejects negative override salary', async ({ request }) => {
    const response = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {
        employee_id: 1,
        period_month: 7,
        period_year: 2025,
        override_salary: -10000,
      },
      failOnStatusCode: false,
    })

    expect(response.status()).toBe(400)
  })

  test('returns 404 for a nonexistent employee', async ({ request }) => {
    const response = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {
        employee_id: 99999,
        period_month: 7,
        period_year: 2025,
      },
      failOnStatusCode: false,
    })

    expect(response.status()).toBe(404)

    const body = await response.json()

    expect(body).toHaveProperty('error')
  })

  test('rejects an invalid payroll month', async ({ request }) => {
    const response = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {
        employee_id: 1,
        period_month: 13,
        period_year: 2025,
      },
      failOnStatusCode: false,
    })

    expect(response.status()).toBe(400)

    const body = await response.json()

    expect(body).toHaveProperty('period_month')
  })

  test('rejects payroll calculation when required fields are missing', async ({ request }) => {
    const response = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {},
      failOnStatusCode: false,
    })

    expect(response.status()).toBe(400)

    const body = await response.json()

    expect(body).toHaveProperty('employee_id')
    expect(body).toHaveProperty('period_month')
    expect(body).toHaveProperty('period_year')
  })
})