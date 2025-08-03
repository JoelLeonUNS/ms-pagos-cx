require('dotenv').config();
const Plan = require('./models/Plan');

async function testPlanes() {
  try {
    console.log('🧪 Probando modelo Plan...');
    const planes = await Plan.getAll();
    console.log('✅ Planes obtenidos exitosamente:');
    console.log(JSON.stringify(planes, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

testPlanes();
