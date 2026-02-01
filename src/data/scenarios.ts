import rawData from './scenarios.json'

type ScenarioCollection = {
  version: string
  source: string
  generatedAt: string
  scenarios: string[]
}

const data = rawData as ScenarioCollection

export const scenarios = data.scenarios
export const scenarioOptions = scenarios.map((scenario) => ({
  label: scenario,
  value: scenario,
}))
