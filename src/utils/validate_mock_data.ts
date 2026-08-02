
import { hotels, activities, partners } from '../data/mockData';

console.log('--- START VALIDATION ---');

let errorCount = 0;

function check(condition: boolean, msg: string) {
    if (!condition) {
        console.error(`[ERROR] ${msg}`);
        errorCount++;
    }
}

try {
    console.log(`Partners: ${partners.length}`);
    console.log(`Hotels: ${hotels.length}`);
    console.log(`Activities: ${activities.length}`);

    // PARTNERS
    const partnerIds = new Set(partners.map(p => p.id));
    partners.forEach(p => {
        check(!!p.id, `Partner has no ID: ${JSON.stringify(p)}`);
        check(!!p.name, `Partner ${p.id} has no name`);
    });

    // HOTELS
    const hotelIds = new Set();
    hotels.forEach((h, i) => {
        const id = h.id || `INDEX_${i}`;
        check(!!h.id, `Hotel at index ${i} has no ID`);
        if (h.id) {
            check(!hotelIds.has(h.id), `Duplicate Hotel ID: ${h.id}`);
            hotelIds.add(h.id);
        }

        check(!!h.partnerId, `Hotel ${id} has no partnerId`);
        check(partnerIds.has(h.partnerId), `Hotel ${id} references unknown partnerId: ${h.partnerId}`);

        check(!!h.name, `Hotel ${id} has no name`);
        check(typeof h.name === 'object' && !!h.name.es, `Hotel ${id} has invalid name structure (must be LocalizedString)`);

        check(!!h.description, `Hotel ${id} has no description`);
        check(typeof h.description === 'object' && !!h.description.es, `Hotel ${id} has invalid description structure`);

        check(Array.isArray(h.images), `Hotel ${id} images is not an array`);
        check(h.images && h.images.length > 0, `Hotel ${id} has no images`);

        check(typeof h.city === 'string', `Hotel ${id} has invalid city`);
        check(typeof h.pricePerNight === 'number', `Hotel ${id} has invalid pricePerNight`);
    });

    // ACTIVITIES
    const activityIds = new Set();
    activities.forEach((a, i) => {
        const id = a.id || `INDEX_${i}`;
        check(!!a.id, `Activity at index ${i} has no ID`);
        if (a.id) {
            check(!activityIds.has(a.id), `Duplicate Activity ID: ${a.id}`);
            activityIds.add(a.id);
        }

        check(!!a.partnerId, `Activity ${id} has no partnerId`);
        check(partnerIds.has(a.partnerId), `Activity ${id} references unknown partnerId: ${a.partnerId}`);

        check(!!a.name, `Activity ${id} has no name`);
        check(typeof a.name === 'object' && !!a.name.es, `Activity ${id} has invalid name structure`);

        check(!!a.description, `Activity ${id} has no description`);
        check(typeof a.description === 'object' && !!a.description.es, `Activity ${id} has invalid description structure`);

        check(Array.isArray(a.images), `Activity ${id} images is not an array`);
        check(a.images && a.images.length > 0, `Activity ${id} has no images`);

        check(typeof a.city === 'string', `Activity ${id} has invalid city`);
        check(typeof a.price === 'number', `Activity ${id} has invalid price`);
    });

    console.log(`--- VALIDATION FINISHED with ${errorCount} errors ---`);
    if (errorCount > 0) process.exit(1);

} catch (e) {
    console.error('CRITICAL EXCEPTION:', e);
    process.exit(1);
}
