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
import type { Config, Memetic, TechSlot, TechSlotStatus, TierGroup } from '../types'
import { createConfig, createTechList, loadConfigs, saveConfigs } from '../storage/configStore'
import { normalizeScenario } from '../utils/scenarioAliases'
import { PageLayout } from '../components/PageLayout'

const { Title, Text } = Typography

const MAX_LISTS_PER_CONFIG = 10

const tierOrder: TierGroup[] = ['tier1', 'tier2', 'tier3']
const levelSlots: Record<TierGroup, number[]> = {
  tier1: [5, 10, 15],
  tier2: [20, 25, 30, 35],
  tier3: [40, 45, 50],
}

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
  const [editSlot, setEditSlot] = useState<{
    listId: string
    tier: TierGroup
    level: number
  } | null>(null)
  const [editPerkId, setEditPerkId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<TechSlotStatus | null>(null)
  const [editWishId, setEditWishId] = useState<string | null>(null)

  const config = configs.find((item) => item.id === activeConfigId) ?? null

  const memeticMap = useMemo(
    () => new Map(memetics.map((item) => [item.id, item])),
    [],
  )

  const effectiveScenario = useMemo(
    () => normalizeScenario(config?.scenario ?? null),
    [config?.scenario],
  )

  const isPerkAllowed = (perk: Memetic | null) => {
    if (!perk) return true
    if (!effectiveScenario) return true
    return perk.scenarios?.includes(effectiveScenario) ?? false
  }

  const tierOptions = useMemo(() => {
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

  const listSelectedPerks = useMemo(() => {
    if (!config) return new Map<string, Set<string>>()
    const map = new Map<string, Set<string>>()
    config.lists.forEach((list) => {
      const picked = new Set<string>()
      tierOrder.forEach((tier) => {
        levelSlots[tier].forEach((level) => {
          const value = list.tiers[tier][level]?.perkId
          if (value) {
            picked.add(value)
          }
        })
      })
      map.set(list.id, picked)
    })
    return map
  }, [config])

  const duplicatePerks = useMemo(() => {
    if (!config) return new Set<string>()
    const counts = new Map<string, number>()
    config.lists.forEach((list) => {
      tierOrder.forEach((tier) => {
        levelSlots[tier].forEach((level) => {
          const value = list.tiers[tier][level]?.perkId
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
  }, [config])

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

  const getWishOptionsForSlot = (currentId: string | null, tier: TierGroup) => {
    const groups = tierOptions[tier]
    const hasCurrent = currentId
      ? groups.some((group) => group.options.some((option) => option.value === currentId))
      : false

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
        ...groups,
      ]
    }

    return groups
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

  const openEditSlot = (
    listId: string,
    tier: TierGroup,
    level: number,
    slot: TechSlot,
  ) => {
    setEditSlot({ listId, tier, level })
    setEditPerkId(slot.perkId ?? null)
    setEditStatus(slot.status ?? null)
    setEditWishId(slot.wishId ?? null)
  }

  const closeEditSlot = () => {
    setEditSlot(null)
    setEditPerkId(null)
    setEditStatus(null)
    setEditWishId(null)
  }

  const submitEditSlot = () => {
    if (!editSlot) return
    const perkId = editPerkId ?? null
    const status = perkId ? editStatus : null
    const wishId = status === 'REPLACE' ? editWishId ?? null : null
    handleUpdateSlot(editSlot.listId, editSlot.tier, editSlot.level, {
      perkId,
      status,
      wishId,
    })
    closeEditSlot()
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

  const handleUpdateSlot = (
    listId: string,
    tier: TierGroup,
    level: number,
    updates: Partial<TechSlot>,
  ) => {
    if (!config) return
    const nextConfig = {
      ...config,
      lists: config.lists.map((list) => {
        if (list.id !== listId) return list
        const currentSlot = list.tiers[tier][level]
        const nextSlot: TechSlot = {
          perkId: 'perkId' in updates ? updates.perkId ?? null : currentSlot.perkId,
          status: 'status' in updates ? updates.status ?? null : currentSlot.status,
          wishId: 'wishId' in updates ? updates.wishId ?? null : currentSlot.wishId,
        }
        return {
          ...list,
          tiers: {
            ...list.tiers,
            [tier]: {
              ...list.tiers[tier],
              [level]: nextSlot,
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
      {perk.description && <Text>{perk.description}</Text>}
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

  const renderPerkOption = (option: { value?: string | number; label?: React.ReactNode }) => {
    const value = option.value?.toString() ?? ''
    const labelText = String(option.label ?? '')
    const perk = value ? memeticMap.get(value) : undefined
    return (
      <Space size="small">
        <Avatar
          shape="square"
          src={perk?.icon || undefined}
          size={20}
        >
          {labelText[0]}
        </Avatar>
        <span>{labelText}</span>
      </Space>
    )
  }

  return (
    <PageLayout
      title="Twink Tech Management"
      description={
        <Text type="secondary">
          Build configurations for Once Human memetic specializations.
        </Text>
      }
    >
      <Space direction="vertical" size="large" className="stretch">
        {configs.length === 0 ? (
          <Empty description="Create your first configuration.">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAddConfig('Config 1')}
            >
              Create configuration
            </Button>
          </Empty>
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
                      levelSlots[tier].some(
                        (level) => list.tiers[tier][level]?.perkId,
                      ),
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
                        className="scenario-select"
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
                          placeholder="Type Character name and press +"
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
                                levelSlots[tier].some(
                                  (level) => list.tiers[tier][level]?.perkId,
                                ),
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
                                    const slot = list.tiers[tier][level]
                                    const perkId = slot.perkId ?? null
                                    const perkStatus = slot.status ?? null
                                    const wishId = slot.wishId ?? null
                                    const perk = perkId ? memeticMap.get(perkId) : null
                                    const wishPerk = wishId ? memeticMap.get(wishId) : null
                                    const invalidSelection = perk ? !isPerkAllowed(perk) : false
                                    const isDuplicate = perkId
                                      ? duplicatePerks.has(perkId)
                                      : false
                                    return (
                                      <div
                                        key={level}
                                        className={`level-slot${invalidSelection ? ' is-invalid' : ''}${isDuplicate ? ' is-duplicate' : ''}`}
                                      >
                                        <Space
                                          align="center"
                                          className="perk-card"
                                          onClick={() =>
                                            openEditSlot(list.id, tier, level, slot)
                                          }
                                        >
                                          <div className="perk-card-header">
                                            <Text type="secondary">Level {level}</Text>
                                            <Button
                                              size="small"
                                              type="text"
                                              icon={<EditOutlined />}
                                            />
                                          </div>
                                          {perk ? (
                                            <Tooltip
                                              title={renderTooltip(perk)}
                                              overlayClassName="perk-tooltip-overlay"
                                            >
                                              <Space align="center" className="perk-item">
                                                <Avatar
                                                  shape="square"
                                                  src={perk.icon || undefined}
                                                  size={56}
                                                >
                                                  {perk.name[0]}
                                                </Avatar>
                                                <Space direction="vertical" size={0}>
                                                  <Text>{perk.name}</Text>
                                                  <Text type="secondary">
                                                    {perk.identity ?? perk.effectCategory}
                                                  </Text>
                                                  {perkStatus ||
                                                  (perkStatus === 'REPLACE' && wishPerk) ||
                                                  invalidSelection ||
                                                  isDuplicate ? (
                                                    <Space
                                                      wrap
                                                      size={4}
                                                      className="perk-slot-tags"
                                                    >
                                                      {perkStatus === 'HOLD' && (
                                                        <Tag color="green">HOLD</Tag>
                                                      )}
                                                      {perkStatus === 'REPLACE' && (
                                                        <Tag color="volcano">REPLACE</Tag>
                                                      )}
                                                      {perkStatus === 'REPLACE' && wishPerk ? (
                                                        <Tag color="purple">
                                                          WISH: {wishPerk.name}
                                                        </Tag>
                                                      ) : null}
                                                      {invalidSelection && (
                                                        <Tag color="red">Not available</Tag>
                                                      )}
                                                      {isDuplicate && !invalidSelection && (
                                                        <Tag color="gold">Duplicate</Tag>
                                                      )}
                                                    </Space>
                                                  ) : null}
                                                </Space>
                                              </Space>
                                            </Tooltip>
                                          ) : (
                                            <Tag>Empty</Tag>
                                          )}
                                        </Space>
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
          placeholder="Tech config name"
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
      <Modal
        open={Boolean(editSlot)}
        title="Select perk"
        onCancel={closeEditSlot}
        onOk={submitEditSlot}
        okText="Apply"
        cancelText="Cancel"
        className="perk-modal"
      >
        {editSlot ? (
          <Space direction="vertical" size="middle" className="stretch">
            <Select
              style={{ width: '100%' }}
              showSearch
              allowClear
              placeholder="Select perk"
              options={getOptionsForSlot(editPerkId, editSlot.tier, editSlot.listId)}
              value={editPerkId ?? undefined}
              onChange={(value) => {
                const nextValue = value ?? null
                setEditPerkId(nextValue)
                if (!nextValue) {
                  setEditStatus(null)
                  setEditWishId(null)
                }
              }}
              optionRender={(option) =>
                renderPerkOption({ value: option.value, label: option.label })
              }
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
            <Space direction="vertical" size={4} className="stretch">
              <Text type="secondary">Status</Text>
              <Select
                allowClear
                placeholder="HOLD or REPLACE"
                options={[
                  { label: 'HOLD', value: 'HOLD' },
                  { label: 'REPLACE', value: 'REPLACE' },
                ]}
                value={editStatus ?? undefined}
                onChange={(value) => {
                  const nextValue = (value as TechSlotStatus) ?? null
                  setEditStatus(nextValue)
                  if (nextValue !== 'REPLACE') {
                    setEditWishId(null)
                  }
                }}
                disabled={!editPerkId}
              />
            </Space>
            {editStatus === 'REPLACE' ? (
              <Space direction="vertical" size={4} className="stretch">
                <Text type="secondary">Wish (replacement)</Text>
                <Select
                  showSearch
                  allowClear
                  placeholder="Select wish perk"
                  options={getWishOptionsForSlot(editWishId, editSlot.tier)}
                  value={editWishId ?? undefined}
                  onChange={(value) => setEditWishId(value ?? null)}
                  optionRender={(option) =>
                    renderPerkOption({ value: option.value, label: option.label })
                  }
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Space>
            ) : null}
            {editPerkId ? (
              <div className="perk-preview">
                {renderTooltip(memeticMap.get(editPerkId) as Memetic)}
              </div>
            ) : null}
          </Space>
        ) : null}
      </Modal>

    </PageLayout>
  )
}
