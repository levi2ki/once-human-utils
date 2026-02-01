import { useMemo, useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Tabs,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons'
import { memetics, tierLabels } from '../data/memetics'
import { scenarioOptions } from '../data/scenarios'
import type { Config, Memetic, TierGroup } from '../types'
import { createConfig, createTechList, loadConfigs, saveConfigs } from '../storage/configStore'

const { Title, Paragraph, Text } = Typography

const MAX_LISTS_PER_CONFIG = 10

const tierOrder: TierGroup[] = ['tier1', 'tier2', 'tier3']

export const ConfigsPage = () => {
  const [configs, setConfigs] = useState<Config[]>(loadConfigs())
  const [activeConfigId, setActiveConfigId] = useState<string | null>(
    configs[0]?.id ?? null,
  )
  const [newListName, setNewListName] = useState('')
  const [renameTarget, setRenameTarget] = useState<Config | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameCharacterTarget, setRenameCharacterTarget] = useState<{
    listId: string
    name: string
  } | null>(null)
  const [renameCharacterValue, setRenameCharacterValue] = useState('')

  const config = configs.find((item) => item.id === activeConfigId) ?? null

  const memeticMap = useMemo(
    () => new Map(memetics.map((item) => [item.id, item])),
    [],
  )

  const winterAliases = useMemo(
    () =>
      new Set([
        'Way of Winter',
        'Endless Dream',
        'Deviation: Survive, Capture, Preserve',
      ]),
    [],
  )

  const effectiveScenario = useMemo(() => {
    const selectedScenario = config?.scenario ?? null
    return winterAliases.has(selectedScenario ?? '') ? 'Way of Winter' : selectedScenario
  }, [config?.scenario, winterAliases])

  const isPerkAllowed = (perk: Memetic | null) => {
    if (!perk) return true
    if (!effectiveScenario) return true
    return perk.scenarios?.includes(effectiveScenario) ?? false
  }

  const tierOptions = useMemo(() => {
    const selectedScenario = effectiveScenario

    const scenarioFiltered = effectiveScenario
      ? memetics.filter((item) => item.scenarios?.includes(effectiveScenario))
      : memetics

    return tierOrder.reduce<
      Record<TierGroup, { label: string; options: { label: string; value: string }[] }[]>
    >(
      (acc, tier) => {
        const groups = new Map<string, { label: string; value: string }[]>()
        scenarioFiltered
          .filter((item) => item.tierGroup === tier)
          .forEach((item) => {
            const category = item.effectCategory ?? 'Other'
            const bucket = groups.get(category) ?? []
            bucket.push({ label: item.name, value: item.id })
            groups.set(category, bucket)
          })

        acc[tier] = Array.from(groups.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([label, options]) => ({
            label,
            options: options.sort((a, b) => a.label.localeCompare(b.label)),
          }))
        return acc
      },
      { tier1: [], tier2: [], tier3: [] },
    )
  }, [effectiveScenario])

  const levelSlots: Record<TierGroup, number[]> = {
    tier1: [5, 10, 15],
    tier2: [20, 25, 30, 35],
    tier3: [40, 45, 50],
  }

  const listSelectedPerks = useMemo(() => {
    if (!config) return new Map<string, Set<string>>()
    const map = new Map<string, Set<string>>()
    config.lists.forEach((list) => {
      const picked = new Set<string>()
      tierOrder.forEach((tier) => {
        levelSlots[tier].forEach((level) => {
          const value = list.tiers[tier][level]
          if (value) {
            picked.add(value)
          }
        })
      })
      map.set(list.id, picked)
    })
    return map
  }, [config, levelSlots, tierOrder])

  const duplicatePerks = useMemo(() => {
    if (!config) return new Set<string>()
    const counts = new Map<string, number>()
    config.lists.forEach((list) => {
      tierOrder.forEach((tier) => {
        levelSlots[tier].forEach((level) => {
          const value = list.tiers[tier][level]
          if (value) {
            counts.set(value, (counts.get(value) ?? 0) + 1)
          }
        })
      })
    })
    const duplicates = new Set<string>()
    counts.forEach((count, value) => {
      if (count > 1) {
        duplicates.add(value)
      }
    })
    return duplicates
  }, [config, levelSlots, tierOrder])

  const getOptionsForSlot = (
    currentId: string | null,
    tier: TierGroup,
    listId: string,
  ) => {
    const groups = tierOptions[tier]
    const hasCurrent = currentId
      ? groups.some((group) => group.options.some((option) => option.value === currentId))
      : false

    const listPicked = listSelectedPerks.get(listId) ?? new Set<string>()
    const decoratedGroups = groups.map((group) => ({
      ...group,
      options: group.options.map((option) => ({
        ...option,
        disabled: listPicked.has(option.value) && option.value !== currentId,
      })),
    }))

    if (currentId && !hasCurrent) {
      return [
        {
          label: 'Selected',
          options: [
            {
              label: memeticMap.get(currentId)?.name ?? 'Selected',
              value: currentId,
            },
          ],
        },
        ...decoratedGroups,
      ]
    }

    return decoratedGroups
  }

  const updateConfigs = (next: Config[]) => {
    setConfigs(next)
    saveConfigs(next)
  }

  const handleAddConfig = (overrideName?: string) => {
    const name = (overrideName ?? '').trim()
    if (!name) return
    const config = createConfig(name)
    const next = [...configs, config]
    updateConfigs(next)
    setActiveConfigId(config.id)
  }

  const handleRemoveConfig = (id: string) => {
    const next = configs.filter((item) => item.id !== id)
    updateConfigs(next)
    setActiveConfigId(next[0]?.id ?? null)
  }

  const handleRenameConfig = (configId: string, name: string) => {
    const next = configs.map((item) =>
      item.id === configId ? { ...item, name } : item,
    )
    updateConfigs(next)
  }

  const handleScenarioChange = (scenario: string | null) => {
    if (!config) return
    const next = configs.map((item) =>
      item.id === config.id ? { ...item, scenario } : item,
    )
    updateConfigs(next)
  }

  const openRenameModal = (target: Config) => {
    setRenameTarget(target)
    setRenameValue(target.name)
  }

  const closeRenameModal = () => {
    setRenameTarget(null)
    setRenameValue('')
  }

  const submitRename = () => {
    if (!renameTarget) return
    const nextName = renameValue.trim()
    if (!nextName) return
    handleRenameConfig(renameTarget.id, nextName)
    closeRenameModal()
  }

  const openRenameCharacterModal = (listId: string, name: string) => {
    setRenameCharacterTarget({ listId, name })
    setRenameCharacterValue(name)
  }

  const closeRenameCharacterModal = () => {
    setRenameCharacterTarget(null)
    setRenameCharacterValue('')
  }

  const submitCharacterRename = () => {
    if (!renameCharacterTarget) return
    const nextName = renameCharacterValue.trim()
    if (!nextName) return
    handleRenameList(renameCharacterTarget.listId, nextName)
    closeRenameCharacterModal()
  }

  const handleAddList = () => {
    if (!config) return
    if (config.lists.length >= MAX_LISTS_PER_CONFIG) return
    const name = newListName.trim() || `Character ${config.lists.length + 1}`
    const nextList = createTechList(name)
    const nextConfig = { ...config, lists: [...config.lists, nextList] }
    const next = configs.map((item) => (item.id === config.id ? nextConfig : item))
    updateConfigs(next)
    setNewListName('')
  }

  const handleRemoveList = (listId: string) => {
    if (!config) return
    const nextConfig = {
      ...config,
      lists: config.lists.filter((list) => list.id !== listId),
    }
    const next = configs.map((item) => (item.id === config.id ? nextConfig : item))
    updateConfigs(next)
  }

  const handleRenameList = (listId: string, name: string) => {
    if (!config) return
    const nextConfig = {
      ...config,
      lists: config.lists.map((list) =>
        list.id === listId ? { ...list, name } : list,
      ),
    }
    const next = configs.map((item) => (item.id === config.id ? nextConfig : item))
    updateConfigs(next)
  }

  const handleSetPerk = (
    listId: string,
    tier: TierGroup,
    level: number,
    perkId: string | null,
  ) => {
    if (!config) return
    const nextConfig = {
      ...config,
      lists: config.lists.map((list) => {
        if (list.id !== listId) return list
        return {
          ...list,
          tiers: {
            ...list.tiers,
            [tier]: {
              ...list.tiers[tier],
              [level]: perkId,
            },
          },
        }
      }),
    }
    const next = configs.map((item) => (item.id === config.id ? nextConfig : item))
    updateConfigs(next)
  }

  const renderTooltip = (perk: Memetic) => (
    <Space direction="vertical" size={4} className="perk-tooltip">
      <Text strong>{perk.name}</Text>
      {perk.effectTitle && <Text>{perk.effectTitle}</Text>}
      {perk.description && <Text type="secondary">{perk.description}</Text>}
      <Space wrap>
        {perk.effectCategory && <Tag color="gold">{perk.effectCategory}</Tag>}
        {perk.identity && <Tag color="blue">{perk.identity}</Tag>}
        {perk.levels && (
          <Tag color="purple">Lv. {perk.levels.join(' / ')}</Tag>
        )}
      </Space>
      {perk.scenarios?.length ? (
        <Text type="secondary">Scenarios: {perk.scenarios.join(', ')}</Text>
      ) : null}
    </Space>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Title level={2}>Twink Tech Management</Title>
          <Paragraph type="secondary">
            Build configurations for Once Human memetic specializations.
          </Paragraph>
        </div>
      </div>

      <Card className="config-card">
        <Space direction="vertical" size="large" className="stretch">
          {configs.length === 0 ? (
            <Empty description="Create your first configuration." />
          ) : (
            <div className="config-editor">
              <Tabs
                className="config-tabs"
                type="editable-card"
                activeKey={activeConfigId ?? ''}
                onChange={(key) => setActiveConfigId(key)}
                onEdit={(targetKey, action) => {
                  if (action === 'add') {
                    handleAddConfig(`Config ${configs.length + 1}`)
                    return
                  }
                  if (action === 'remove' && typeof targetKey === 'string') {
                    const target = configs.find((item) => item.id === targetKey)
                    const hasPickedPerk = target?.lists.some((list) =>
                      tierOrder.some((tier) =>
                        levelSlots[tier].some((level) => list.tiers[tier][level]),
                      ),
                    )
                    const hasExtraData =
                      Boolean(target?.scenario) ||
                      Boolean(target?.lists.length) ||
                      Boolean(hasPickedPerk)
                    if (hasExtraData) {
                      Modal.confirm({
                        title: 'Delete configuration?',
                        content:
                          'This configuration contains data. Are you sure you want to delete it?',
                        okText: 'Delete',
                        okType: 'danger',
                        cancelText: 'Cancel',
                        onOk: () => handleRemoveConfig(targetKey),
                      })
                      return
                    }
                    handleRemoveConfig(targetKey)
                  }
                }}
                items={configs.map((item) => ({
                  key: item.id,
                  label: (
                    <Space size="small">
                      <span>{item.name}</span>
                      <Button
                        size="small"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(event) => {
                          event.stopPropagation()
                          openRenameModal(item)
                        }}
                      />
                    </Space>
                  ),
                }))}
              />

              {config ? (
                <Space direction="vertical" size="large" className="stretch">
                  <Card size="small" className="config-controls">
                    <div className="config-controls-grid">
                      <Space direction="vertical" size={4} className="stretch">
                        <Text type="secondary">Scenario</Text>
                        <Select
                          allowClear
                          placeholder="Select scenario"
                          options={scenarioOptions}
                          value={config.scenario ?? undefined}
                          onChange={(value) => handleScenarioChange(value ?? null)}
                          size="large"
                        />
                      </Space>
                      <div className="list-actions">
                        <Space
                          direction="vertical"
                          size={4}
                          className="stretch character-input"
                        >
                          <Text type="secondary">
                            Characters: {config.lists.length}/{MAX_LISTS_PER_CONFIG}
                          </Text>
                          <Input
                            placeholder="Type a name and press +"
                            value={newListName}
                            onChange={(event) => setNewListName(event.target.value)}
                            onPressEnter={handleAddList}
                            disabled={config.lists.length >= MAX_LISTS_PER_CONFIG}
                            size="large"
                          />
                        </Space>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddList}
                          disabled={config.lists.length >= MAX_LISTS_PER_CONFIG}
                          size="large"
                          className="add-character-button"
                        />
                      </div>
                    </div>
                  </Card>

                  {config.lists.length === 0 ? (
                    <Empty description="Add your first character." />
                  ) : (
                    <Space direction="vertical" size="large" className="stretch">
                      {config.lists.map((list) => (
                        <Card
                          key={list.id}
                          title={
                            <Space size="small">
                              <Text>{list.name}</Text>
                              <Button
                                size="small"
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => openRenameCharacterModal(list.id, list.name)}
                              />
                            </Space>
                          }
                          extra={
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                const hasPickedPerk = tierOrder.some((tier) =>
                                  levelSlots[tier].some((level) => list.tiers[tier][level]),
                                )
                                if (hasPickedPerk) {
                                  Modal.confirm({
                                    title: 'Delete character?',
                                    content:
                                      'This character contains data. Are you sure you want to delete it?',
                                    okText: 'Delete',
                                    okType: 'danger',
                                    cancelText: 'Cancel',
                                    onOk: () => handleRemoveList(list.id),
                                  })
                                  return
                                }
                                handleRemoveList(list.id)
                              }}
                            />
                          }
                        >
                          <div className="tier-grid">
                            {tierOrder.map((tier) => (
                              <div key={tier} className="tier-column">
                                <Space direction="vertical" size="small" className="stretch">
                                  <Title level={5}>{tierLabels[tier]}</Title>
                                  <div className="level-grid">
                                    {levelSlots[tier].map((level) => {
                                      const perkId = list.tiers[tier][level] ?? null
                                      const perk = perkId ? memeticMap.get(perkId) : null
                                          const invalidSelection = perk ? !isPerkAllowed(perk) : false
                                          const isDuplicate = perkId
                                            ? duplicatePerks.has(perkId)
                                            : false
                                          return (
                                            <div
                                              key={level}
                                              className={`level-slot${invalidSelection ? ' is-invalid' : ''}${
                                                isDuplicate ? ' is-duplicate' : ''
                                              }`}
                                            >
                                          <Text type="secondary">Level {level}</Text>
                                          <Select
                                            showSearch
                                            allowClear
                                            placeholder="Select perk"
                                                options={getOptionsForSlot(perkId, tier, list.id)}
                                            value={perkId ?? undefined}
                                            onChange={(value) =>
                                              handleSetPerk(
                                                list.id,
                                                tier,
                                                level,
                                                value ?? null,
                                              )
                                            }
                                            filterOption={(input, option) =>
                                              (option?.label ?? '')
                                                .toString()
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                            }
                                          />
                                          {perk ? (
                                            <Tooltip
                                              title={renderTooltip(perk)}
                                              overlayClassName="perk-tooltip-overlay"
                                              overlayInnerStyle={{
                                                background: '#ffffff',
                                                color: '#1f1f1f',
                                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                              }}
                                            >
                                              <Space align="center" className="perk-item">
                                                <Avatar
                                                  shape="square"
                                                  src={perk.icon || undefined}
                                                  size={40}
                                                >
                                                  {perk.name[0]}
                                                </Avatar>
                                                <Space direction="vertical" size={0}>
                                                  <Text>{perk.name}</Text>
                                                  <Text type="secondary">
                                                    {perk.identity ?? perk.effectCategory}
                                                  </Text>
                                                    {invalidSelection && (
                                                      <Tag color="red">Not available</Tag>
                                                    )}
                                                    {isDuplicate && !invalidSelection && (
                                                      <Tag color="gold">Duplicate</Tag>
                                                    )}
                                                </Space>
                                              </Space>
                                            </Tooltip>
                                          ) : (
                                            <Tag>Empty</Tag>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </Space>
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </Space>
                  )}
                </Space>
              ) : (
                <Empty description="Select a configuration tab." />
              )}
            </div>
          )}
        </Space>
        <Modal
          open={Boolean(renameTarget)}
          title="Rename configuration"
          onCancel={closeRenameModal}
          onOk={submitRename}
          okText="Save"
          cancelText="Cancel"
        >
          <Input
            placeholder="Configuration name"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            onPressEnter={submitRename}
          />
        </Modal>
        <Modal
          open={Boolean(renameCharacterTarget)}
          title="Rename character"
          onCancel={closeRenameCharacterModal}
          onOk={submitCharacterRename}
          okText="Save"
          cancelText="Cancel"
        >
          <Input
            placeholder="Character name"
            value={renameCharacterValue}
            onChange={(event) => setRenameCharacterValue(event.target.value)}
            onPressEnter={submitCharacterRename}
          />
        </Modal>
      </Card>
    </div>
  )
}
