export const normalizeScenario = (scenario: string | null): string | null => {
  if (!scenario) return null
  const winterAliases = new Set([
    'Way of Winter',
    'Endless Dream',
    'Deviation: Survive, Capture, Preserve',
  ])
  return winterAliases.has(scenario) ? 'Way of Winter' : scenario
}
