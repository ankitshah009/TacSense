function analyzeTone(voiceMetrics = {}, heartRate = null) {
  let score = 0;
  if (voiceMetrics.pitch && voiceMetrics.pitch > 300) {
    score += 1;
  }
  if (voiceMetrics.tempo && voiceMetrics.tempo > 170) {
    score += 1;
  }
  if (heartRate && heartRate > 100) {
    score += 1;
  }
  return score > 1 ? 'stressed' : 'calm';
}

module.exports = { analyzeTone };
