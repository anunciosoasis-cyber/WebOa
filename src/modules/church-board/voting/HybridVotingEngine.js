/**
 * Engine de Votación Híbrida para Junta Oasis
 * Consolida votos presenciales (manuales) con votos online en tiempo real.
 */

export class HybridVotingEngine {
  /**
   * Calcula el resultado final de la votación
   * @param {Object} onlineVotes - Votos recibidos por el sistema (ej. { inFavor: 10, against: 2, abstentions: 1 })
   * @param {Object} manualVotes - Votos ingresados por el secretario (ej. { inFavor: 5, against: 1, abstentions: 0 })
   * @param {number} quorumMin - Mínimo de asistentes requeridos para que la votación sea válida
   * @param {string} majorityType - Tipo de mayoría ('simple', 'dos_tercios', 'absoluta')
   */
  static calculateResult(onlineVotes, manualVotes, quorumMin, majorityType = 'simple') {
    const totalInFavor = (onlineVotes?.inFavor || 0) + (manualVotes?.inFavor || 0);
    const totalAgainst = (onlineVotes?.against || 0) + (manualVotes?.against || 0);
    const totalAbstentions = (onlineVotes?.abstentions || 0) + (manualVotes?.abstentions || 0);

    const totalVotes = totalInFavor + totalAgainst + totalAbstentions;

    // Validación de Quórum
    if (totalVotes < quorumMin) {
      return {
        totalInFavor,
        totalAgainst,
        totalAbstentions,
        totalVotes,
        isPassed: false,
        status: 'QUORUM_NOT_MET',
        message: `No se alcanzó el quórum mínimo de ${quorumMin} votos.`
      };
    }

    let isPassed = false;

    switch (majorityType) {
      case 'simple':
        // Mayoría simple: Más votos a favor que en contra (las abstenciones no suman al total requerido)
        isPassed = totalInFavor > totalAgainst;
        break;
      
      case 'dos_tercios':
        // 2/3 de los votos emitidos (incluyendo abstenciones según el reglamento común de iglesias, o excluyéndolos dependiendo de la configuración)
        // Asumiendo que se calcula sobre los votos válidamente emitidos (favor + contra)
        const validVotes = totalInFavor + totalAgainst;
        isPassed = totalInFavor >= Math.ceil(validVotes * (2 / 3));
        break;

      case 'absoluta':
        // Mayoría absoluta: Mitad más uno del total de miembros de la junta presentes
        isPassed = totalInFavor > (totalVotes / 2);
        break;

      default:
        isPassed = totalInFavor > totalAgainst;
    }

    return {
      totalInFavor,
      totalAgainst,
      totalAbstentions,
      totalVotes,
      isPassed,
      status: isPassed ? 'PASSED' : 'REJECTED',
      message: isPassed ? 'La moción ha sido aprobada.' : 'La moción ha sido rechazada.'
    };
  }
}
