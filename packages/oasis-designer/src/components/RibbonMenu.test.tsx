// RibbonMenu.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RibbonMenu, { RibbonMenuProps } from './RibbonMenu';

// Mock lazy‑loaded tab components – they just render a placeholder element
jest.mock('./ribbon/RibbonTabInicio', () => () => <div data-testid="tab-inicio">Inicio Content</div>);
jest.mock('./ribbon/RibbonTabInsertar', () => (props: any) => (
  <div data-testid="tab-insertar">Insertar Content</div>
));
jest.mock('./ribbon/RibbonTabDiseno', () => (props: any) => (
  <div data-testid="tab-diseno">Diseño Content</div>
));
jest.mock('./ribbon/RibbonTabMarca', () => (props: any) => (
  <div data-testid="tab-marca">Marca Content</div>
));
jest.mock('./ribbon/RibbonTabFormato', () => (props: any) => (
  <div data-testid="tab-formato">Formato Content</div>
));

describe('RibbonMenu component', () => {
  const defaultProps: RibbonMenuProps = {
    activeRibbonTab: 'inicio',
    setActiveRibbonTab: jest.fn(),
    theme: 'light',
  };

  test('renders fallback UI when required props are missing', () => {
    // @ts-ignore – intentionally pass invalid props for the test
    render(<RibbonMenu />);
    expect(screen.getByText(/⚠️ Error: RibbonMenu recibió props inválidos./i)).toBeInTheDocument();
  });

  test('shows the active tab and its content', async () => {
    render(<RibbonMenu {...defaultProps} />);
    // the initial active tab is "inicio"
    const inicioButton = screen.getByRole('tab', { name: /inicio/i });
    expect(inicioButton).toHaveAttribute('aria-selected', 'true');
    // content from the mocked lazy component should appear
    expect(await screen.findByTestId('tab-inicio')).toBeInTheDocument();
  });

  test('clicking another tab updates active state via callback', () => {
    const setActive = jest.fn();
    render(<RibbonMenu {...defaultProps} setActiveRibbonTab={setActive} />);
    const insertarButton = screen.getByRole('tab', { name: /insertar/i });
    fireEvent.click(insertarButton);
    expect(setActive).toHaveBeenCalledWith('insertar');
  });

  test('keyboard navigation – ArrowRight moves to next tab', () => {
    const setActive = jest.fn();
    render(<RibbonMenu {...defaultProps} setActiveRibbonTab={setActive} />);
    const inicioButton = screen.getByRole('tab', { name: /inicio/i });
    // focus the active button
    inicioButton.focus();
    fireEvent.keyDown(inicioButton, { key: 'ArrowRight' });
    expect(setActive).toHaveBeenCalledWith('insertar');
  });

  test('keyboard activation – Enter selects focused tab', () => {
    const setActive = jest.fn();
    render(<RibbonMenu {...defaultProps} setActiveRibbonTab={setActive} />);
    const insertarButton = screen.getByRole('tab', { name: /insertar/i });
    insertarButton.focus();
    fireEvent.keyDown(insertarButton, { key: 'Enter' });
    expect(setActive).toHaveBeenCalledWith('insertar');
  });
});
