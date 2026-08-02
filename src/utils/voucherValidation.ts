import { PartnerVoucher } from '@/types';

/**
 * Resultado de validación de voucher QR
 */
export interface VoucherValidationResult {
    isValid: boolean;
    error?: string;
    voucher?: PartnerVoucher;
    qrData?: {
        bookingId: string;
        activityId: string;
        timestamp: string;
    };
}

/**
 * Valida un QR de voucher escaneado
 * Formato esperado: bookingId_activityId_timestamp
 */
export function validateVoucherQR(
    qrData: string,
    availableVouchers: PartnerVoucher[]
): VoucherValidationResult {
    console.log('[VOUCHER_VALIDATION] Validando QR:', qrData);

    // 1. Parse QR data
    const parts = qrData.split('_');
    if (parts.length !== 3) {
        console.error('[VOUCHER_VALIDATION] Formato QR inválido. Esperado: bookingId_activityId_timestamp');
        return {
            isValid: false,
            error: 'Formato de QR inválido. El código no tiene el formato correcto.',
        };
    }

    const [bookingId, activityId, timestamp] = parts;

    console.log('[VOUCHER_VALIDATION] QR parseado:', { bookingId, activityId, timestamp });

    // 2. Buscar voucher que coincida
    const matchingVoucher = availableVouchers.find(v => {
        // Check if bookingId matches
        if (!v.bookingId.includes(bookingId)) return false;

        // Check if this voucher has the activity
        const hasActivity = v.services.some(s =>
            s.activityId.replace(/[^a-zA-Z0-9]/g, '') === activityId
        );

        return hasActivity;
    });

    if (!matchingVoucher) {
        console.warn('[VOUCHER_VALIDATION] No se encontró voucher válido');
        return {
            isValid: false,
            error: 'Voucher no encontrado. Verifica que el QR sea válido.',
            qrData: { bookingId, activityId, timestamp },
        };
    }

    console.log('[VOUCHER_VALIDATION] ✅ Voucher válido encontrado:', matchingVoucher.voucherId);

    // 3. Check if already redeemed (placeholder - necesitaría backend)
    // En producción, esto debería consultar una DB para ver si ya se escaneó

    // 4. Check if expired (placeholder)
    // Podrías validar si el timestamp es muy antiguo

    return {
        isValid: true,
        voucher: matchingVoucher,
        qrData: { bookingId, activityId, timestamp },
    };
}

/**
 * Interfaz para tracking de vouchers escaneados
 */
export interface ScannedVoucher {
    voucherId: string;
    bookingId: string;
    activityName: string;
    scannedAt: string;
    scannedBy: string; // Partner ID
    pax: {
        adults: number;
        children: number;
    };
    amount: number;
}

/**
 * Registra un voucher como escaneado
 * En producción esto debería hacer POST a backend
 */
export function markVoucherAsScanned(
    voucher: PartnerVoucher,
    partnerId: string
): ScannedVoucher {
    console.log('[VOUCHER_VALIDATION] Marcando voucher como escaneado:', voucher.voucherId);

    const scannedVoucher: ScannedVoucher = {
        voucherId: voucher.voucherId,
        bookingId: voucher.bookingId,
        activityName: voucher.services[0].activityName,
        scannedAt: new Date().toISOString(),
        scannedBy: partnerId,
        pax: {
            adults: voucher.services[0].pax.adults,
            children: voucher.services[0].pax.children,
        },
        amount: voucher.balanceDue, // 85% que le corresponde al partner
    };

    // TODO: En producción, hacer POST a /api/vouchers/scan
    // await fetch('/api/vouchers/scan', { method: 'POST', body: JSON.stringify(scannedVoucher) });

    console.log('[VOUCHER_VALIDATION] ✅ Voucher registrado:', scannedVoucher);

    return scannedVoucher;
}
