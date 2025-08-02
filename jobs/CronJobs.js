const SuscripcionService = require('../services/SuscripcionService');

class CronJobs {
  
  // Ejecutar verificación de suscripciones cada hora
  static iniciarCronJobs() {
    console.log('🕐 Iniciando trabajos programados...');
    
    // Verificar vencimientos cada hora
    setInterval(async () => {
      try {
        console.log('🔄 Ejecutando verificación de suscripciones...');
        const resultado = await SuscripcionService.procesarVencimientos();
        console.log('✅ Verificación completada:', resultado.message);
      } catch (error) {
        console.error('❌ Error en verificación automática:', error.message);
      }
    }, 60 * 60 * 1000); // Cada hora

    // Verificar renovaciones cada día a las 9:00 AM
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 9 && now.getMinutes() === 0) {
        try {
          console.log('🔄 Ejecutando renovaciones automáticas diarias...');
          const resultado = await SuscripcionService.procesarVencimientos();
          console.log('✅ Renovaciones completadas:', resultado.message);
        } catch (error) {
          console.error('❌ Error en renovaciones automáticas:', error.message);
        }
      }
    }, 60 * 1000); // Cada minuto (para verificar la hora)

    console.log('✅ Trabajos programados iniciados correctamente');
  }

  // Ejecutar verificación manual
  static async ejecutarVerificacionManual() {
    try {
      console.log('🔄 Ejecutando verificación manual...');
      const resultado = await SuscripcionService.procesarVencimientos();
      console.log('✅ Verificación manual completada:', resultado.message);
      return resultado;
    } catch (error) {
      console.error('❌ Error en verificación manual:', error.message);
      throw error;
    }
  }
}

module.exports = CronJobs;
