/**
 * Personal Test Case — Override Salary Validation
 */

const API = 'http://localhost:8000/api'

describe('Personal Test Case — Override Salary Validation', () => {
  it('fails for negative input and passes for positive', () => {
    cy.visit('/')
    cy.get('nav a[href="/calculate"]').click()
    cy.url().should('include', '/calculate')

    cy.get('select').first().select(1)
    cy.get('input[type="number"]').first().clear().type('-1')
    cy.get('input[type="number"]').first().invoke('val').then((value) => {
      expect(Number(value)).to.be.at.least(0)
    })

    cy.get('input[type="number"]').first().clear().type('100')
    cy.get('input[type="number"]').first().invoke('val').then((value) => {
      expect(Number(value)).to.be.at.least(0)
    })
  })
})


describe('API — Calculation Boundaries', () => {
  const expectSuccessStatus = (status) => {
    expect([200, 201]).to.include(status)
  }

  it('applies SSS ceiling at 20,000 MSC', () => {
    cy.request({
      method: 'POST',
      url: `${API}/calculate-payroll/`,
      body: {
        employee_id: 1,
        period_month: 8,
        period_year: 2025,
        override_salary: 50000,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expectSuccessStatus(res.status)
      expect(Number(res.body.sss_employee)).to.be.closeTo(900, 0.01)
      expect(Number(res.body.sss_employer)).to.be.closeTo(1900, 0.01)
    })
  })

  it('applies PhilHealth floor at 10,000 base', () => {
    cy.request({
      method: 'POST',
      url: `${API}/calculate-payroll/`,
      body: {
        employee_id: 1,
        period_month: 9,
        period_year: 2025,
        override_salary: 5000,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expectSuccessStatus(res.status)
      expect(Number(res.body.philhealth_employee)).to.be.closeTo(250, 0.01)
      expect(Number(res.body.philhealth_employer)).to.be.closeTo(250, 0.01)
    })
  })

  it('applies PhilHealth ceiling at 100,000 base', () => {
    cy.request({
      method: 'POST',
      url: `${API}/calculate-payroll/`,
      body: {
        employee_id: 1,
        period_month: 10,
        period_year: 2025,
        override_salary: 300000,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expectSuccessStatus(res.status)
      expect(Number(res.body.philhealth_employee)).to.be.closeTo(2500, 0.01)
      expect(Number(res.body.philhealth_employer)).to.be.closeTo(2500, 0.01)
    })
  })

  it('caps Pag-IBIG employee contribution at 200', () => {
    cy.request({
      method: 'POST',
      url: `${API}/calculate-payroll/`,
      body: {
        employee_id: 1,
        period_month: 11,
        period_year: 2025,
        override_salary: 25000,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expectSuccessStatus(res.status)
      expect(Number(res.body.pagibig_employee)).to.be.closeTo(200, 0.01)
      expect(Number(res.body.pagibig_employer)).to.be.closeTo(200, 0.01)
    })
  })

  it('calculates monthly tax for 25,000 salary as 625', () => {
    cy.request({
      method: 'POST',
      url: `${API}/calculate-payroll/`,
      body: {
        employee_id: 1,
        period_month: 12,
        period_year: 2025,
        override_salary: 25000,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expectSuccessStatus(res.status)
      expect(Number(res.body.income_tax)).to.be.closeTo(625, 0.01)
    })
  })
})

describe('API — Validation Errors', () => {
  const employeePayload = () => ({
    first_name: 'Task3',
    last_name: 'Validation',
    email: `task3.validation.${Date.now()}@example.com`,
    position: 'QA Engineer',
    department: 'Quality Assurance',
    employment_type: 'regular',
    monthly_salary: '45000.00',
    date_hired: '2024-01-01',
  })

  it('rejects calculate-payroll when employee_id is missing', () => {
    cy.request({
      method: 'POST',
      url: `${API}/calculate-payroll/`,
      body: {
        period_month: 1,
        period_year: 2025,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('employee_id')
    })
  })

  it('rejects calculate-payroll when period_month is out of range', () => {
    cy.request({
      method: 'POST',
      url: `${API}/calculate-payroll/`,
      body: {
        employee_id: 1,
        period_month: 13,
        period_year: 2025,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('period_month')
    })
  })

  it('rejects calculate-payroll when period_year is out of range', () => {
    cy.request({
      method: 'POST',
      url: `${API}/calculate-payroll/`,
      body: {
        employee_id: 1,
        period_month: 1,
        period_year: 1999,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('period_year')
    })
  })

  it('rejects employee creation with invalid employment_type', () => {
    const payload = employeePayload()
    payload.employment_type = 'intern'

    cy.request({
      method: 'POST',
      url: `${API}/employees/`,
      body: payload,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('employment_type')
    })
  })

  it('rejects employee creation with missing email', () => {
    const payload = employeePayload()
    delete payload.email

    cy.request({
      method: 'POST',
      url: `${API}/employees/`,
      body: payload,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(400)
      expect(res.body).to.have.property('email')
    })
  })
})