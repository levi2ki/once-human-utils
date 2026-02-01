import { Avatar, Card, Input, Select, Space, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { memetics, tierLabels } from '../data/memetics'
import { scenarioOptions } from '../data/scenarios'
import type { TierGroup } from '../types'
import { normalizeScenario } from '../utils/scenarioAliases'
import { PageLayout } from '../components/PageLayout'

const { Paragraph, Text } = Typography

const tierOptions = (Object.keys(tierLabels) as TierGroup[]).map((tier) => ({
  label: tierLabels[tier],
  value: tier,
}))

export const MemeticsLibraryPage = () => {
  const [search, setSearch] = useState('')
  const [scenario, setScenario] = useState<string | null>(null)
  const [tiers, setTiers] = useState<TierGroup[]>([])

  const effectiveScenario = useMemo(() => normalizeScenario(scenario), [scenario])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return memetics.filter((memetic) => {
      if (term && !memetic.name.toLowerCase().includes(term)) {
        return false
      }
      if (effectiveScenario && !(memetic.scenarios?.includes(effectiveScenario) ?? false)) {
        return false
      }
      if (tiers.length && !tiers.includes(memetic.tierGroup)) {
        return false
      }
      return true
    })
  }, [search, effectiveScenario, tiers])

  return (
    <PageLayout
      title="Memetics Library"
      description={<Text type="secondary">Browse memetic specializations and their effects.</Text>}
    >
      <Space direction="vertical" size="large" className="stretch">
        <div className="memetics-header-row">
          <Text type="secondary">Found: {filtered.length}</Text>
        </div>
        <div className="memetics-toolbar">
          <Input
            placeholder="Search by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />
          <Select
            placeholder="Scenario"
            allowClear
            options={scenarioOptions}
            value={scenario ?? undefined}
            onChange={(value) => setScenario(value ?? null)}
          />
          <Select
            mode="multiple"
            placeholder="Tier"
            options={tierOptions}
            value={tiers}
            onChange={(value) => setTiers(value as TierGroup[])}
          />
        </div>
        <div className="memetics-grid">
          {filtered.map((memetic) => (
            <Card
              key={memetic.id}
              className="memetic-card"
              size="small"
              title={
                <Space size="small">
                  <Avatar shape="square" src={memetic.icon || undefined} size={36}>
                    {memetic.name[0]}
                  </Avatar>
                  <span>{memetic.name}</span>
                </Space>
              }
            >
              {memetic.effectTitle ? <Text strong>{memetic.effectTitle}</Text> : null}
              <Paragraph type="secondary" ellipsis={{ rows: 3 }}>
                {memetic.description}
              </Paragraph>
              <Space wrap className="memetic-tags">
                <Tag color="blue">{tierLabels[memetic.tierGroup]}</Tag>
                {memetic.effectCategory ? (
                  <Tag color="gold">{memetic.effectCategory}</Tag>
                ) : null}
                {memetic.identity ? <Tag color="geekblue">{memetic.identity}</Tag> : null}
                {memetic.scenarios?.length ? (
                  <Tag>{memetic.scenarios.join(', ')}</Tag>
                ) : null}
              </Space>
            </Card>
          ))}
        </div>
      </Space>
    </PageLayout>
  )
}
