/**
 * Mock Data for Partner Dashboard Development - Professional Edition
 * 
 * Incluye datos con cumplimiento legal uruguayo:
 * - Residencia de turistas (Ley 19.253 - IVA CERO)
 * - Configuración legal del partner (Ley 17.250)
 * - Transparencia financiera BCU (Split 15/85)
 * - Sistema de disponibilidad (días y horarios)
 */

import type { AvailabilitySettings } from './availabilityValidator';

export type TouristResidence = 'Uruguay' | 'Argentina' | 'Brasil' | 'Chile' | 'USA' | 'Europa' | 'Otro';
export type CapacityLevel = 0 | 1 | 2 | 3; // 0=Óptimo, 1=Normal, 2=Alerta, 3=Saturado

export interface MockBooking {
    id: string;
    bookingCode: string;
    guestName: string;
    guestEmail: string;
    touristResidence: TouristResidence; // Para IVA CERO (Ley 19.253)
    activity: string;
    date: string;
    time: string;
    guests: number;
    adults: number;
    children: number;
    status: 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
    totalAmount: number;
    paidAmount: number; // 15% seña
    remainingAmount: number; // 85% saldo
    ivaExempt: boolean; // Auto-calculado según residencia
    qrCode: string;
    createdAt: string;
}

export interface MockVoucher {
    id: string;
    voucherCode: string;
    bookingId: string;
    partnerName: string;
    activity: string;
    validUntil: string;
    amount: number;
    status: 'active' | 'redeemed' | 'expired';
    qrData: string;
    redemptionDate?: string;
}

/**
 * Configuración Legal del Partner (Ley 17.250 - Defensa del Consumidor)
 */
export interface PartnerLegalConfig {
    partnerId: string;
    razonSocial: string;
    rut: string; // Formato: 12-345678-001-2
    registroMINTUR: string;
    domicilioReal: string;
    telefono: string;
    email: string;
    isConfigured: boolean; // Si completó el onboarding legal
}

/**
 * Servicio del Partner para el Catálogo "Mi Vidriera"
 * Datos públicos vs. privados (post-pago)
 */
export interface PartnerService {
    id: string;
    partnerId: string;
    // Datos públicos (siempre visibles)
    name: string;
    description: string;
    category: string;
    capacity: number;
    availableHours: string[];
    duration: number; // minutos
    price: number;
    images: string[]; // URLs (máx 10)
    // Datos privados (solo post-pago en voucher)
    contactInfo: {
        address: string;
        phone: string;
        coordinates: { lat: number; lng: number };
        arrivalInstructions: string;
    };
    isActive: boolean;
    createdAt?: string;
}

/**
 * Genera un código QR ficticio en formato base64
 */
function generateMockQR(data: string): string {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='white' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='monospace' font-size='12'%3E${encodeURIComponent(data)}%3C/text%3E%3C/svg%3E`;
}

/**
 * Calcula si aplica IVA CERO según Ley 19.253
 */
function calculateIvaExempt(residence: TouristResidence): boolean {
    return residence !== 'Uruguay'; // Extranjeros tienen IVA CERO
}

/**
 * Reservas Mock para Bodega El Legado
 */
export const mockBookings: MockBooking[] = [
    {
        id: 'booking-001',
        bookingCode: 'ESC-2026-001',
        guestName: 'María González',
        guestEmail: 'maria.gonzalez@example.com',
        touristResidence: 'Uruguay',
        activity: 'Cata Premium de Vinos',
        date: '2026-01-25',
        time: '14:00',
        guests: 2,
        adults: 2,
        children: 0,
        status: 'confirmed',
        totalAmount: 8500,
        paidAmount: 1275, // 15% deposit
        remainingAmount: 7225, // 85% remaining
        ivaExempt: false, // Local - paga IVA
        qrCode: generateMockQR('ESC-2026-001'),
        createdAt: '2026-01-20T10:30:00Z',
    },
    {
        id: 'booking-002',
        bookingCode: 'ESC-2026-002',
        guestName: 'João da Silva',
        guestEmail: 'joao.silva@example.com',
        touristResidence: 'Brasil',
        activity: 'Tour Viñedos + Almuerzo',
        date: '2026-01-26',
        time: '11:00',
        guests: 4,
        adults: 2,
        children: 2,
        status: 'confirmed',
        totalAmount: 15600,
        paidAmount: 2340, // 15% deposit
        remainingAmount: 13260, // 85% remaining
        ivaExempt: true, // Extranjero - IVA CERO
        qrCode: generateMockQR('ESC-2026-002'),
        createdAt: '2026-01-21T14:15:00Z',
    },
    {
        id: 'booking-003',
        bookingCode: 'ESC-2026-003',
        guestName: 'Carlos Pérez',
        guestEmail: 'carlos.perez@example.com',
        touristResidence: 'Uruguay',
        activity: 'Cata Premium de Vinos',
        date: '2026-01-27',
        time: '16:00',
        guests: 2,
        adults: 2,
        children: 0,
        status: 'pending',
        totalAmount: 8500,
        paidAmount: 1275,
        remainingAmount: 7225,
        ivaExempt: false,
        qrCode: generateMockQR('ESC-2026-003'),
        createdAt: '2026-01-22T09:00:00Z',
    },
    {
        id: 'booking-004',
        bookingCode: 'ESC-2026-004',
        guestName: 'Ana Rodríguez',
        guestEmail: 'ana.rodriguez@example.com',
        touristResidence: 'Argentina',
        activity: 'Experiencia Gourmet Completa',
        date: '2026-01-28',
        time: '13:00',
        guests: 6,
        adults: 4,
        children: 2,
        status: 'confirmed',
        totalAmount: 28900,
        paidAmount: 4335,
        remainingAmount: 24565,
        ivaExempt: true, // Extranjero - IVA CERO
        qrCode: generateMockQR('ESC-2026-004'),
        createdAt: '2026-01-23T11:45:00Z',
    },
    {
        id: 'booking-005',
        bookingCode: 'ESC-2026-005',
        guestName: 'Pablo Martínez',
        guestEmail: 'pablo.martinez@example.com',
        touristResidence: 'Uruguay',
        activity: 'Cata Premium de Vinos',
        date: '2026-01-24',
        time: '18:00',
        guests: 2,
        adults: 2,
        children: 0,
        status: 'checked-in',
        totalAmount: 8500,
        paidAmount: 1275,
        remainingAmount: 7225,
        ivaExempt: false,
        qrCode: generateMockQR('ESC-2026-005'),
        createdAt: '2026-01-18T16:20:00Z',
    },
    {
        id: 'booking-006',
        bookingCode: 'ESC-2026-006',
        guestName: 'Michael Johnson',
        guestEmail: 'michael.j@example.com',
        touristResidence: 'USA',
        activity: 'Tour Viñedos + Almuerzo',
        date: '2026-01-29',
        time: '10:00',
        guests: 2,
        adults: 2,
        children: 0,
        status: 'confirmed',
        totalAmount: 12000,
        paidAmount: 1800,
        remainingAmount: 10200,
        ivaExempt: true, // Extranjero - IVA CERO
        qrCode: generateMockQR('ESC-2026-006'),
        createdAt: '2026-01-23T08:00:00Z',
    },
];

/**
 * Vouchers Mock para testing del escáner QR
 */
export const mockVouchers: MockVoucher[] = [
    {
        id: 'voucher-001',
        voucherCode: 'VOUCH-ESC-001',
        bookingId: 'booking-001',
        partnerName: 'Bodega El Legado',
        activity: 'Cata Premium de Vinos',
        validUntil: '2026-02-25',
        amount: 7225,
        status: 'active',
        qrData: 'VOUCH-ESC-001|booking-001|7225',
    },
    {
        id: 'voucher-002',
        voucherCode: 'VOUCH-ESC-002',
        bookingId: 'booking-002',
        partnerName: 'Bodega El Legado',
        activity: 'Tour Viñedos + Almuerzo',
        validUntil: '2026-02-26',
        amount: 13260,
        status: 'active',
        qrData: 'VOUCH-ESC-002|booking-002|13260',
    },
    {
        id: 'voucher-003',
        voucherCode: 'VOUCH-ESC-003',
        bookingId: 'booking-003',
        partnerName: 'Bodega El Legado',
        activity: 'Cata Premium de Vinos',
        validUntil: '2026-02-27',
        amount: 7225,
        status: 'active',
        qrData: 'VOUCH-ESC-003|booking-003|7225',
    },
    {
        id: 'voucher-004',
        voucherCode: 'VOUCH-ESC-004',
        bookingId: 'booking-004',
        partnerName: 'Bodega El Legado',
        activity: 'Experiencia Gourmet Completa',
        validUntil: '2026-02-28',
        amount: 24565,
        status: 'active',
        qrData: 'VOUCH-ESC-004|booking-004|24565',
    },
    {
        id: 'voucher-005',
        voucherCode: 'VOUCH-ESC-005',
        bookingId: 'booking-005',
        partnerName: 'Bodega El Legado',
        activity: 'Cata Premium de Vinos',
        validUntil: '2026-02-24',
        amount: 7225,
        status: 'redeemed',
        qrData: 'VOUCH-ESC-005|booking-005|7225',
        redemptionDate: '2026-01-24T18:15:00Z',
    },
    {
        id: 'voucher-006',
        voucherCode: 'VOUCH-ESC-006',
        bookingId: 'booking-006',
        partnerName: 'Bodega El Legado',
        activity: 'Tour Viñedos + Almuerzo',
        validUntil: '2026-02-29',
        amount: 10200,
        status: 'active',
        qrData: 'VOUCH-ESC-006|booking-006|10200',
    },
];

/**
 * Configuración Legal Mock del Partner
 */
export const mockPartnerConfig: PartnerLegalConfig = {
    partnerId: 'partner-001',
    razonSocial: 'Bodega El Legado S.A.',
    rut: '21-345678-001-5',
    registroMINTUR: 'MINTUR-2024-1856',
    domicilioReal: 'Ruta 30 Km 18, Carmelo, Colonia',
    telefono: '+598 4542 1234',
    email: 'contacto@bodegaellegado.com.uy',
    isConfigured: true,
};

/**
 * Estado actual de capacidad del establecimiento
 */
export function getCurrentCapacityLevel(): { level: CapacityLevel; percentage: number } {
    const currentHour = new Date().getHours();

    // Simulación basada en la hora
    if (currentHour >= 12 && currentHour <= 14) {
        return { level: 2, percentage: 78 }; // Hora pico - Alerta
    } else if (currentHour >= 18 && currentHour <= 20) {
        return { level: 3, percentage: 92 }; // Noche - Saturado
    } else if (currentHour >= 10 && currentHour <= 11) {
        return { level: 1, percentage: 45 }; // Mañana - Normal
    }

    return { level: 0, percentage: 25 }; // Fuera de horario - Óptimo
}

/**
 * Helper para buscar una reserva por código QR
 */
export function findBookingByQR(qrData: string): MockBooking | null {
    return mockBookings.find(b => b.bookingCode === qrData) || null;
}

/**
 * Helper para buscar un voucher por código QR
 */
export function findVoucherByQR(qrData: string): MockVoucher | null {
    const voucherCode = qrData.split('|')[0];
    return mockVouchers.find(v => v.voucherCode === voucherCode) || null;
}

/**
 * Helper para marcar un voucher como redimido
 */
export function redeemVoucher(voucherId: string): boolean {
    const voucher = mockVouchers.find(v => v.id === voucherId);
    if (voucher && voucher.status === 'active') {
        voucher.status = 'redeemed';
        voucher.redemptionDate = new Date().toISOString();
        return true;
    }
    return false;
}

/**
 * Helper para obtener estadísticas del día
 */
export function getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = mockBookings.filter(b => b.date === today);

    return {
        todayVisitors: todayBookings.reduce((sum, b) => sum + b.guests, 0),
        todayRevenue: todayBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        checkedIn: todayBookings.filter(b => b.status === 'checked-in').length,
        pending: todayBookings.filter(b => b.status === 'confirmed').length,
    };
}

/**
 * Helper para obtener reservas con IVA CERO
 */
export function getIvaExemptBookings(): MockBooking[] {
    return mockBookings.filter(b => b.ivaExempt);
}

/**
 * Servicio Mock para el Catálogo "Mi Vidriera"
 * Incluye 10 fotos de alta calidad para testing
 */
export const mockPartnerService: PartnerService = {
    id: 'service-001',
    partnerId: 'partner-001',
    name: 'Tour Premium de Viñedos con Degustación',
    description: 'Descubre la magia del enoturismo uruguayo en nuestra bodega boutique. Recorre viñedos centenarios mientras aprendes sobre el proceso de elaboración del vino. Culmina con una degustación de 5 vinos premium maridados con quesos artesanales locales. Una experiencia sensorial inolvidable en el corazón de Carmelo.',
    category: 'Enoturismo',
    capacity: 20,
    availableHours: ['10:00-12:00', '14:00-16:00', '17:00-19:00'],
    duration: 120,
    price: 4500,
    images: [
        'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&h=1080&fit=crop&q=90',
        'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=1920&h=1080&fit=crop&q=90',
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1920&h=1080&fit=crop&q=90',
        'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=1920&h=1080&fit=crop&q=90',
        'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=1920&h=1080&fit=crop&q=90',
        'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=1920&h=1080&fit=crop&q=90',
        'https://images.unsplash.com/photo-1584916201218-e2fa697c9574?w=1920&h=1080&fit=crop&q=90',
        'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=1920&h=1080&fit=crop&q=90',
        'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=1920&h=1080&fit=crop&q=90',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop&q=90',
    ],
    contactInfo: {
        address: 'Ruta 30 Km 18, Carmelo, Colonia',
        phone: '+598 4542 1234',
        coordinates: { lat: -33.9936, lng: -58.2848 },
        arrivalInstructions: 'Al llegar, estacionar en el área señalizada frente a la entrada principal. Tocar el timbre y nuestro equipo te recibirá. Si llegas en auto particular, hay estacionamiento gratuito disponible.',
    },
    isActive: true,
    createdAt: '2026-01-15T10:00:00Z',
};

/**
 * Configuración de Disponibilidad Mock del Partner
 * Miércoles cerrado, fines de semana con horario extendido
 */
export const mockPartnerAvailability: AvailabilitySettings = {
    days: {
        monday: { open: true, slots: ['morning', 'afternoon'] },
        tuesday: { open: true, slots: ['morning', 'afternoon'] },
        wednesday: { open: false, slots: [], note: 'Cerrado los miércoles' },
        thursday: { open: true, slots: ['morning', 'afternoon'] },
        friday: { open: true, slots: ['morning', 'afternoon', 'evening'] },
        saturday: { open: true, slots: ['morning', 'afternoon', 'evening'] },
        sunday: { open: true, slots: ['afternoon', 'evening'] },
    },
    specialDates: {
        '2026-12-25': { open: false, slots: [], note: 'Cerrado por Navidad' },
        '2026-01-01': { open: false, slots: [], note: 'Cerrado por Año Nuevo' },
    },
    timezone: 'America/Montevideo',
    lastUpdated: '2026-01-23T10:00:00Z',
};
