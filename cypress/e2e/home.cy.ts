describe('To-Do List App', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should display the To-Do List title', () => {
    cy.get('h1').should('contain', 'My To-Do List');
  });

  it('should allow adding a new todo', () => {
    const todoText = 'Learn Cypress testing';
    cy.get('input[placeholder="Add a new todo"]').type(todoText);
    cy.get('button[type="submit"]').click();
    cy.get('ul').should('contain', todoText);
  });

  it('should allow marking a todo as completed', () => {
    const todoText = 'Buy groceries';
    cy.get('input[placeholder="Add a new todo"]').type(todoText);
    cy.get('button[type="submit"]').click();

    cy.contains('li', todoText)
      .find('input[type="checkbox"]')
      .click();

    cy.contains('li', todoText)
      .find('span')
      .should('have.class', 'line-through');
  });

  it('should allow deleting a todo', () => {
    const todoText = 'Call mom';
    cy.get('input[placeholder="Add a new todo"]').type(todoText);
    cy.get('button[type="submit"]').click();

    cy.contains('li', todoText)
      .find('button.btn-error') // Select the delete button
      .click();

    cy.get('ul').should('not.contain', todoText);
  });
});
