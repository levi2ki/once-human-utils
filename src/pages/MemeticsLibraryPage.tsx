import { Avatar, Card, Input, Select, Space, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { memetics, tierLabels } from '../data/memetics'
import { scenarioOptions } from '../data/scenarios'
import type { MemeticRating, TierGroup } from '../types'
import { normalizeScenario } from '../utils/scenarioAliases'
import { PageLayout } from '../components/PageLayout'

const { Paragraph, Text } = Typography

const tierOptions = (Object.keys(tierLabels) as TierGroup[]).map((tier) => ({
  label: tierLabels[tier],
  value: tier,
}))

const ratingColors: Record<MemeticRating, string> = {
  SS: 'magenta',
  S: 'volcano',
  A: 'gold',
  B: 'blue',
  C: 'default',
}

export const MemeticsLibraryPage = () => {
  const [search, setSearch] = useState('')
  const [scenario, setScenario] = useState<string | null>(null)
  const [tiers, setTiers] = useState<TierGroup[]>([])
  const [effectCategory, setEffectCategory] = useState<string | null>(null)

  const effectiveScenario = useMemo(() => normalizeScenario(scenario), [scenario])
  const effectCategoryOptions = useMemo(() => {
    const categories = new Set<string>()
    memetics.forEach((memetic) => {
      if (memetic.effectCategory) {
        categories.add(memetic.effectCategory)
      }
    })
    return Array.from(categories)
      .sort((a, b) => a.localeCompare(b))
      .map((category) => ({ label: category, value: category }))
  }, [])

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
      if (effectCategory && memetic.effectCategory !== effectCategory) {
        return false
      }
      return true
    })
  }, [search, effectiveScenario, tiers, effectCategory])

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
          <Select
            placeholder="Effect category"
            allowClear
            options={effectCategoryOptions}
            value={effectCategory ?? undefined}
            onChange={(value) => setEffectCategory(value ?? null)}
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
              <Paragraph type="secondary">
                {memetic.description}
              </Paragraph>
              <Space wrap className="memetic-tags">
                <Tag color="blue">{tierLabels[memetic.tierGroup]}</Tag>
                {memetic.rating ? (
                  <Tag color={ratingColors[memetic.rating]}>{memetic.rating}</Tag>
                ) : null}
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
