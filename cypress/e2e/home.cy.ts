describe('Home Page', () => {
  it('should display "Hello World!"', () => {
    // Visit the root URL of your application
    // Make sure your Next.js development server is running on http://localhost:3000
    cy.visit('http://localhost:3000');

    // Assert that the h1 element contains the text "Hello World!"
    // Using should('contains', 'X') is robust as it looks for the text anywhere within the element
    cy.get('h1').should('contain', 'Hello World!');

    // You could also be more specific, if you remember the exact text and element
    cy.contains('h1', 'Hello World!').should('be.visible');

    // Or check for the button we added with DaisyUI
    cy.get('.btn-primary').should('contain', 'Click Me!');
  });
});
