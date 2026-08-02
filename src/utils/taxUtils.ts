import { IVA_RATE, DEPOSIT_PERCENTAGE } from '@/config/constants';

/**
 * Motor de Beneficios Fiscales Uruguay
 * Implementa Ley 19.253 (Inclusión Financiera)
 * 
 * FASE 3: CHECKOUT Y REPARTO DE FONDOS (15% / 85%)
 */

export interface TaxBreakdown {
  // Montos base
  hotelSubtotal: number;
  activitiesSubtotal: number;
  subtotal: number; // Total BRUTO (con IVA incluido)

  // Beneficios fiscales
  accommodationIVADiscount: number; // Descuento IVA hoteles (10%)
  gastronomyIVADiscount: number; // Descuento IVA gastronomía (18.03%)
  totalDiscount: number; // Suma de todos los descuentos

  // Montos finales
  finalTotal: number; // Total NETO (después de descuentos)
  depositWeb: number; // 15% que se paga online
  balanceLocal: number; // 85% que se paga en destino
}

export interface TaxItem {
  category: 'hotel' | 'restaurante' | 'actividad' | string;
  grossAmount: number; // Monto BRUTO (con IVA incluido)
  vatBenefitOverride?: number; // % específico del Partner
}

export interface TaxCalculationParams {
  items: TaxItem[];
  isNonUruguayanResident: boolean; // ¿Es extranjero?
  paidElectronically: boolean; // ¿Paga con tarjeta/transferencia?
}

/**
 * FASE 2C: Aplicación de Beneficios Fiscales (Solo para Extranjeros)
 * 
 * Hoteles: Subtotal / 1.10 (Elimina el 10% de IVA)
 * Gastronomía: Subtotal × 0.8197 (Aplica reducción del 18.03%)
 */
export function calculateTaxBenefits(params: TaxCalculationParams): TaxBreakdown {
  const {
    items,
    isNonUruguayanResident,
    paidElectronically,
  } = params;

  let totalGross = 0; // Total BRUTO (con IVA)
  let hotelSubtotal = 0;
  let activitiesSubtotal = 0;
  let totalDiscount = 0; // Total de descuentos aplicados
  let totalNetPrice = 0; // Total NETO (después de descuentos)

  // 📌 Constantes de IVA según normativa uruguaya
  const GASTRONOMY_IVA_REDUCTION = 0.18032786885; // ~18.03% (Exact: 1 - 1/1.22)
  const HOTEL_IVA_REDUCTION = 0.18032786885; // ~18.03% (Exact: 1 - 1/1.22)

  console.log('[TAX_ENGINE_DEBUG] 💳 Iniciando Motor de Impuestos:', {
    isNonUruguayanResident: isNonUruguayanResident,
    paidElectronically: paidElectronically,
    itemsCount: items.length
  });

  // 📌 PROCESAR CADA ITEM (Hotel, Restaurante, Actividad)
  items.forEach((item, index) => {
    totalGross += item.grossAmount;
    let discount = 0;

    console.log(`[TAX_ENGINE_DEBUG] 📦 Item ${index + 1}:`, {
      category: item.category,
      grossAmount: item.grossAmount
    });

    // ✅ CASO 1: EXTRANJERO + PAGO ELECTRÓNICO = Aplica beneficios completos
    if (isNonUruguayanResident && paidElectronically) {

      if (item.category === 'hotel') {
        hotelSubtotal += item.grossAmount;

        // ✅ Hoteles: IVA 0 para extranjeros (Eliminar 10%)
        // Fórmula: Precio sin IVA = Precio con IVA / 1.10
        // Descuento = Precio con IVA - Precio sin IVA
        // ✅ Hoteles: IVA 0 para extranjeros (Eliminar 10%) - User requested Zero VAT (22% removal logic)
        // Fórmula: Precio sin IVA = Precio con IVA / 1.22
        // Descuento = Precio con IVA - Precio sin IVA
        discount = item.grossAmount - (item.grossAmount / 1.22);

        console.log(`[TAX_ENGINE_DEBUG] 🏨 Hotel (Extranjero):`, {
          grossAmount: item.grossAmount,
          ivaRate: '10%',
          calculation: `$${item.grossAmount} × ${HOTEL_IVA_REDUCTION} = $${discount}`,
          netAmount: item.grossAmount - discount
        });

      } else if (item.category === 'restaurante') {
        activitiesSubtotal += item.grossAmount;

        // ✅ Gastronomía: Reducción del 18.03% (equivale a quitar 22% IVA)
        // ✅ Gastronomía: Reducción del 18.03% (equivale a quitar 22% IVA)
        // Formula Exacta: Precio - (Precio / 1.22)
        discount = item.grossAmount - (item.grossAmount / 1.22);

        console.log(`[TAX_ENGINE_DEBUG] 🍽️ Restaurante (Extranjero):`, {
          grossAmount: item.grossAmount,
          ivaReduction: '18.03%',
          calculation: `$${item.grossAmount} × ${GASTRONOMY_IVA_REDUCTION} = $${discount}`,
          netAmount: item.grossAmount - discount
        });

      } else {
        activitiesSubtotal += item.grossAmount;

        // ✅ Actividades: Descuento según registro del Partner
        const benefitRate = item.vatBenefitOverride || 9; // 9% por defecto

        // Use exact formula for 9 points VAT reduction if applicable
        // discount = item.grossAmount * (benefitRate / 100);
        // For unified Zero VAT (18.03%) requested by user:
        discount = item.grossAmount - (item.grossAmount / 1.22);

        console.log(`[TAX_ENGINE_DEBUG] 🎯 Actividad (Extranjero):`, {
          grossAmount: item.grossAmount,
          benefitRate: `${benefitRate}%`,
          calculation: `$${item.grossAmount} × ${benefitRate / 100} = $${discount}`,
          netAmount: item.grossAmount - discount
        });
      }

    }
    // ✅ CASO 2: URUGUAYO + PAGO ELECTRÓNICO = Beneficio básico solo en gastronomía (9 puntos)
    else {
      if (item.category === 'hotel') {
        hotelSubtotal += item.grossAmount;
        // Uruguayos NO tienen descuento en hoteles
      } else {
        activitiesSubtotal += item.grossAmount;

        // Beneficio de inclusión financiera (9 puntos) solo si paga electrónicamente
        if (paidElectronically) {
          discount = item.grossAmount * 0.09;
          console.log(`[TAX_ENGINE_DEBUG] 🇺🇾 Uruguayo (Inclusión Financiera):`, {
            grossAmount: item.grossAmount,
            benefit: '9%',
            discount: discount
          });
        }
      }
    }

    totalDiscount += discount;
    totalNetPrice += (item.grossAmount - discount);
  });

  // ✅ CRÍTICO: RESTAR el descuento del total bruto
  const finalTotal = totalGross - totalDiscount;

  console.log('[TAX_ENGINE_DEBUG] 💰 Resultado Final:', {
    totalGross: totalGross,
    totalDiscount: totalDiscount,
    finalTotal: finalTotal,
    formula: `$${totalGross} (bruto) - $${totalDiscount} (descuentos) = $${finalTotal} (neto)`
  });

  // ⚠️ VALIDACIÓN DE SANIDAD: El total neto NUNCA puede ser mayor que el bruto
  if (finalTotal > totalGross) {
    console.error('[TAX_ENGINE_ERROR] ❌ CRITICAL: finalTotal > totalGross!', {
      totalGross: totalGross,
      totalDiscount: totalDiscount,
      finalTotal: finalTotal,
      message: 'Los descuentos se están SUMANDO en lugar de RESTAR'
    });

    // Fallback seguro: devolver sin descuentos
    return {
      hotelSubtotal,
      activitiesSubtotal,
      subtotal: totalGross,
      accommodationIVADiscount: 0,
      gastronomyIVADiscount: 0,
      totalDiscount: 0,
      finalTotal: totalGross,
      depositWeb: totalGross * DEPOSIT_PERCENTAGE,
      balanceLocal: totalGross * (1 - DEPOSIT_PERCENTAGE),
    };
  }

  // ✅ FASE 3: REPARTO DE FONDOS (15% Web / 85% Local)
  // La seña (15%) se calcula sobre el NETO (después de beneficios)
  const depositWeb = totalNetPrice * DEPOSIT_PERCENTAGE;
  const balanceLocal = finalTotal - depositWeb;

  console.log('[TAX_ENGINE_DEBUG] 💳 Reparto de Fondos:', {
    totalNet: totalNetPrice,
    depositWeb: depositWeb,
    depositPercentage: `${DEPOSIT_PERCENTAGE * 100}%`,
    balanceLocal: balanceLocal,
    balancePercentage: `${(1 - DEPOSIT_PERCENTAGE) * 100}%`
  });

  return {
    hotelSubtotal,
    activitiesSubtotal,
    subtotal: totalGross, // Total BRUTO
    accommodationIVADiscount: items
      .filter(i => i.category === 'hotel')
      .reduce((sum, i) => sum + (isNonUruguayanResident && paidElectronically ? i.grossAmount * HOTEL_IVA_REDUCTION : 0), 0),
    gastronomyIVADiscount: items
      .filter(i => i.category === 'restaurante')
      .reduce((sum, i) => sum + (isNonUruguayanResident && paidElectronically ? i.grossAmount * GASTRONOMY_IVA_REDUCTION : 0), 0),
    totalDiscount, // Total de descuentos
    finalTotal, // Total NETO
    depositWeb, // 15% online
    balanceLocal, // 85% en destino
  };
}

/**
 * Formatea montos en pesos uruguayos
 */
export function formatUYU(amount: number): string {
  return `$${Math.round(amount).toLocaleString('es-UY')}`;
}

