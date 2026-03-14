import { test, expect } from '@playwright/test';

test.describe('Flujo de Reserva E2E', () => {
  
  test('El usuario puede crear y cancelar una reserva completa', async ({ page }) => {
    
    // 1. Ir a la página principal e iniciar reserva
    await test.step('Navegar a la web y abrir modal', async () => {
      await page.goto('http://localhost:3000/');
      // Abrimos el modal con el botón principal
      await page.getByRole('main').getByRole('button', { name: /RESERVAR CITA/i }).click();
    });

    // 2. Seleccionar el primer servicio disponible
    await test.step('Seleccionar Servicio', async () => {
      // Acotamos la búsqueda EXCLUSIVAMENTE dentro del modal (.max-w-lg)
      await page.locator('.max-w-lg .group.cursor-pointer').first().click();
      
      // Esperamos a que el botón Continuar esté activo
      await expect(page.getByRole('button', { name: 'Continuar' })).toBeEnabled();
      await page.getByRole('button', { name: 'Continuar' }).click();
    });

    // 3. Seleccionar Profesional
    await test.step('Seleccionar Profesional', async () => {
      // Acotamos la búsqueda EXCLUSIVAMENTE dentro del modal (.max-w-lg)
      await page.locator('.max-w-lg button.group.overflow-hidden').first().click();
      await page.getByRole('button', { name: 'Continuar' }).click();
    });

    // 4. Seleccionar Fecha y Hora (Dinámico)
    await test.step('Seleccionar Fecha y Hora', async () => {
      // Acotamos el calendario al modal
      await page.locator('.max-w-lg table button:not([disabled])').first().click();
      
      // Buscamos el primer botón que tenga formato de hora (ej: "10:00") dentro del modal
      await page.locator('.max-w-lg button').filter({ hasText: /^\d{2}:\d{2}$/ }).first().click();
      await page.getByRole('button', { name: 'Continuar' }).click();
    });

    // 5. Rellenar formulario de cliente
    await test.step('Rellenar Formulario', async () => {
      await page.getByPlaceholder('Ej: Alex García').fill('Héctor Celda');
      await page.getByPlaceholder('Ej: 600 123 456').fill('634779186');
      await page.getByPlaceholder('nombre@ejemplo.com').fill('celdajusticiahector@gmail.com');
      
      await expect(page.getByRole('button', { name: 'Continuar' })).toBeEnabled();
      await page.getByRole('button', { name: 'Continuar' }).click();
    });

    // 6. Confirmar reserva
    await test.step('Confirmar Reserva', async () => {
      await page.getByRole('button', { name: 'Confirmar' }).click();
      
      // Esperamos a ver el texto "Confirmada" en la pantalla de éxito
      await expect(page.getByRole('heading', { name: 'Confirmada' })).toBeVisible({ timeout: 15000 });
      await page.getByRole('link', { name: 'Finalizar' }).click();
    });

    // 7. Gestionar la cancelación en la página de Mis Reservas
    await test.step('Cancelar la reserva', async () => {
      // Esperamos a que la URL sea la de reserva y la página esté cargada
      await expect(page).toHaveURL(/.*reserva/);
      await page.waitForLoadState('networkidle');

      // TRATAMIENTO DE CHOQUE PARA EL MODAL:
      // Buscamos el botón "Ahora no" o la "X" del modal de notificaciones
      const modalCloseBtn = page.locator('button:has-text("Ahora no"), button:has([size="18"])').first();
      
      if (await modalCloseBtn.isVisible()) {
        await modalCloseBtn.click();
        // Clave: Esperamos a que el contenedor con z-9990 desaparezca por completo
        await expect(page.locator('.z-\\[9990\\]')).not.toBeVisible({ timeout: 5000 });
      }

      // ACCIÓN DE CLIC REFORZADA:
      // A veces el scroll o pequeñas animaciones molestan. Usamos dispatchEvent para un clic a nivel de sistema.
      const ticketCard = page.locator('button.group.text-left').first();
      await expect(ticketCard).toBeVisible();
      await ticketCard.click({ force: true, delay: 500 });
      
      // Cancelar definitivamente
      const cancelBtn = page.getByRole('button', { name: 'Cancelar Reserva' });
      await expect(cancelBtn).toBeVisible();
      await cancelBtn.click();
      
      // Verificamos el toast de éxito
      await expect(page.getByText('Reserva cancelada correctamente')).toBeVisible();
    });

  });
});