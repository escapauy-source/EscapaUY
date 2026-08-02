
import { seedDatabase } from './seedDatabase';

(async () => {
    console.log('🚀 Running Seed Script...');
    const result = await seedDatabase();
    console.log('Seed Result:', result);
})();
