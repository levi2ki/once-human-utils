import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { plants, plantMap } from '../data/plants'
import {
  createPlantingConfig,
  createPlantingFloor,
  loadPlantingConfigs,
  savePlantingConfigs,
} from '../storage/plantingStore'
import type { Plant, PlantingConfig } from '../types'
import { PageLayout } from '../components/PageLayout'

const { Paragraph, Text } = Typography

const BUILDINGS_PER_FLOOR = 45
const MAX_BUILDINGS = 250
type Range = { min: number; max: number; valid: boolean }

const toRange = (
  values: Plant[],
  minKey: 'waterMin' | 'lightMin',
  maxKey: 'waterMax' | 'lightMax',
  minStep = 1,
) => {
  if (!values.length) return null
  const min = Math.max(...values.map((plant) => plant[minKey] + minStep))
  const max = Math.min(...values.map((plant) => plant[maxKey]))
  return { min, max, valid: min <= max }
}

const formatRange = (range: Range | null, showOverlap = true) => {
  if (!range) return '—'
  if (!range.valid) return showOverlap ? 'No overlap' : '—'
  return `${range.min}–${range.max}`
}

const formatRangeRaw = (range: Range | null) => {
  if (!range) return '—'
  return `${range.min}–${range.max}`
}

const formatPlantRange = (
  plant: Plant | null,
  minKey: 'waterMin' | 'lightMin',
  maxKey: 'waterMax' | 'lightMax',
) => {
  if (!plant) return '—'
  return `${plant[minKey]}–${plant[maxKey]}`
}

const formatPlantRecommendedRange = (
  plant: Plant | null,
  minKey: 'waterMin' | 'lightMin',
  maxKey: 'waterMax' | 'lightMax',
  minStep = 10,
) => {
  if (!plant) return '—'
  const range = {
    min: plant[minKey] + minStep,
    max: plant[maxKey],
    valid: plant[minKey] + minStep <= plant[maxKey],
  }
  return formatRange(range)
}

export const PlantingConfigsPage = () => {
  const [configs, setConfigs] = useState<PlantingConfig[]>(loadPlantingConfigs())
  const [activeConfigId, setActiveConfigId] = useState<string | null>(
    configs[0]?.id ?? null,
  )
  const [renameTarget, setRenameTarget] = useState<PlantingConfig | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const config = configs.find((item) => item.id === activeConfigId) ?? null

  const updateConfigs = (next: PlantingConfig[]) => {
    setConfigs(next)
    savePlantingConfigs(next)
  }

  const handleAddConfig = (overrideName?: string) => {
    const name = overrideName ?? `Planting Config ${configs.length + 1}`
    const nextConfig = createPlantingConfig(name)
    updateConfigs([...configs, nextConfig])
    setActiveConfigId(nextConfig.id)
  }

  const handleRemoveConfig = (configId: string) => {
    const next = configs.filter((item) => item.id !== configId)
    updateConfigs(next)
    setActiveConfigId(next[0]?.id ?? null)
  }

  const handleRenameConfig = (configId: string, name: string) => {
    const next = configs.map((item) => (item.id === configId ? { ...item, name } : item))
    updateConfigs(next)
  }

  const openRenameModal = (target: PlantingConfig) => {
    setRenameTarget(target)
    setRenameValue(target.name)
  }

  const closeRenameModal = () => {
    setRenameTarget(null)
    setRenameValue('')
  }

  const submitRename = () => {
    if (!renameTarget) return
    const name = renameValue.trim()
    if (!name) return
    handleRenameConfig(renameTarget.id, name)
    closeRenameModal()
  }

  const handleAddFloor = () => {
    if (!config) return
    if ((config.floors.length + 1) * BUILDINGS_PER_FLOOR > MAX_BUILDINGS) return
    const nextFloor = createPlantingFloor()
    const nextConfig = { ...config, floors: [...config.floors, nextFloor] }
    updateConfigs(configs.map((item) => (item.id === config.id ? nextConfig : item)))
  }

  const handleRemoveFloor = (floorId: string) => {
    if (!config) return
    const nextConfig = {
      ...config,
      floors: config.floors.filter((floor) => floor.id !== floorId),
    }
    updateConfigs(configs.map((item) => (item.id === config.id ? nextConfig : item)))
  }

  const handleUpdateFloor = (
    floorId: string,
    updater: (floor: PlantingConfig['floors'][number]) => PlantingConfig['floors'][number],
  ) => {
    if (!config) return
    const nextConfig = {
      ...config,
      floors: config.floors.map((floor) =>
        floor.id === floorId ? updater(floor) : floor,
      ),
    }
    updateConfigs(configs.map((item) => (item.id === config.id ? nextConfig : item)))
  }

  const allPlants = useMemo(() => {
    if (!config) return []
    return config.floors
      .flatMap((floor) => floor.groups.map((group) => group.plantId))
      .filter((id): id is string => Boolean(id))
      .map((id) => plantMap.get(id))
      .filter((plant): plant is Plant => Boolean(plant))
  }, [config])

  const plantOptionsByGroup = useMemo(() => {
    const grouped = new Map<string, { label: string; value: string }[]>()
    plants.forEach((plant) => {
      const group = plant.group || 'Other'
      const entries = grouped.get(group) ?? []
      entries.push({ label: plant.name, value: plant.id })
      grouped.set(group, entries)
    })
    return Array.from(grouped.entries()).map(([group, options]) => ({
      label: group,
      options,
    }))
  }, [])

  const globalWaterRange = useMemo(
    () => toRange(allPlants, 'waterMin', 'waterMax', 10),
    [allPlants],
  )
  const globalLightRange = useMemo(
    () => toRange(allPlants, 'lightMin', 'lightMax', 10),
    [allPlants],
  )
  const globalWaterRangeOriginal = useMemo(
    () => toRange(allPlants, 'waterMin', 'waterMax', 0),
    [allPlants],
  )
  const globalLightRangeOriginal = useMemo(
    () => toRange(allPlants, 'lightMin', 'lightMax', 0),
    [allPlants],
  )

  const uniquePlantCount = useMemo(() => new Set(allPlants.map((plant) => plant.id)).size, [
    allPlants,
  ])

  const handleToggleAuto = (checked: boolean) => {
    if (!config) return
    const nextConfig = { ...config, autoMode: checked }
    updateConfigs(configs.map((item) => (item.id === config.id ? nextConfig : item)))
  }

  return (
    <PageLayout
      title="Planting Configs"
      description={
        <Text type="secondary">
          Manage planting floors, lighting groups, and irrigation ranges.
        </Text>
      }
      cardClassName="planting-card"
    >
      <Space direction="vertical" size="large" className="stretch">
        {configs.length === 0 ? (
          <Empty description="No planting configs yet">
            <Button type="primary" onClick={() => handleAddConfig('Planting Config 1')}>
              Create planting config
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
                  handleAddConfig()
                  return
                }
                if (action === 'remove' && typeof targetKey === 'string') {
                  const target = configs.find((item) => item.id === targetKey)
                  if (!target) return
                  const hasPlants = target.floors.some((floor) =>
                    floor.groups.some((group) => group.plantId),
                  )
                  if (hasPlants) {
                    Modal.confirm({
                      title: 'Delete planting config?',
                      content: 'This config has planted groups. Are you sure?',
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
                closable: true,
              }))}
            />

            {config ? (
              <Space direction="vertical" size="large" className="stretch">
                <Card size="small" className="config-controls">
                  <div className="planting-toolbar">
                    <Space direction="vertical" size="small">
                      <Text type="secondary">Buildings</Text>
                      <Text strong>
                        {config.floors.length * BUILDINGS_PER_FLOOR} / {MAX_BUILDINGS}
                      </Text>
                    </Space>
                    <Space direction="vertical" size="small">
                      <Text type="secondary">Auto planting</Text>
                      <Switch checked={config.autoMode} onChange={handleToggleAuto} />
                    </Space>
                    <Space direction="vertical" size="small">
                      <Text type="secondary">Growshroom gardeners</Text>
                      <Text strong>{config.autoMode ? uniquePlantCount : 0}</Text>
                    </Space>
                    <Space>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddFloor}
                        disabled={
                          (config.floors.length + 1) * BUILDINGS_PER_FLOOR >
                          MAX_BUILDINGS
                        }
                      >
                        Add floor
                      </Button>
                    </Space>
                  </div>
                  {config.autoMode ? (
                    <Space
                      size="small"
                      align="center"
                      className={`planting-floor-recommended${
                        globalWaterRange && !globalWaterRange.valid ? ' is-invalid' : ''
                      }${globalLightRange && !globalLightRange.valid ? ' is-invalid' : ''}`}
                    >
                      <Text type="secondary">Recommended</Text>
                      <Tooltip
                        title={
                          <Text type="secondary">
                            Original water: {formatRangeRaw(globalWaterRangeOriginal)}
                          </Text>
                        }
                      >
                        <Text type={globalWaterRange?.valid ? 'success' : undefined}>
                          💧 {formatRange(globalWaterRange)}
                        </Text>
                      </Tooltip>
                      <Tooltip
                        title={
                          <Text type="secondary">
                            Original light: {formatRangeRaw(globalLightRangeOriginal)}
                          </Text>
                        }
                      >
                        <Text type={globalLightRange?.valid ? 'success' : undefined}>
                          ☀️ {formatRange(globalLightRange)}
                        </Text>
                      </Tooltip>
                    </Space>
                  ) : null}
                </Card>

                <Space direction="vertical" size="large" className="stretch">
                  {config.floors
                    .map((floor, index) => ({ floor, index }))
                    .reverse()
                    .map(({ floor, index }) => {
                      const floorPlants = floor.groups
                        .map((group) => (group.plantId ? plantMap.get(group.plantId) : null))
                        .filter((plant): plant is Plant => Boolean(plant))
                      const floorWaterRange = toRange(floorPlants, 'waterMin', 'waterMax', 10)
                      const upperFloor = config.floors[index + 1]
                      const upperFloorPlants = upperFloor
                        ? upperFloor.groups
                            .map((group) =>
                              group.plantId ? plantMap.get(group.plantId) : null,
                            )
                            .filter((plant): plant is Plant => Boolean(plant))
                        : []
                      const upperFloorWaterRange = upperFloor
                        ? toRange(upperFloorPlants, 'waterMin', 'waterMax', 10)
                        : null
                      const waterMinOverride =
                        floorWaterRange && upperFloorWaterRange
                          ? Math.max(floorWaterRange.min, upperFloorWaterRange.min)
                          : null
                      const waterIsOverwritten =
                        floorWaterRange && upperFloorWaterRange
                          ? upperFloorWaterRange.min > floorWaterRange.min
                          : false
                      const adjustedWaterRange = floorWaterRange
                        ? {
                            ...floorWaterRange,
                            min: waterMinOverride ?? floorWaterRange.min,
                            valid: waterMinOverride
                              ? waterMinOverride <= floorWaterRange.max
                              : floorWaterRange.valid,
                          }
                        : null
                      const floorLightRange = toRange(floorPlants, 'lightMin', 'lightMax', 10)
                      const floorWaterRangeOriginal = toRange(
                        floorPlants,
                        'waterMin',
                        'waterMax',
                        0,
                      )
                      const floorLightRangeOriginal = toRange(
                        floorPlants,
                        'lightMin',
                        'lightMax',
                        0,
                      )

                      return (
                        <Card
                          key={floor.id}
                          className="planting-floor"
                          title={`Floor ${index + 1}`}
                          extra={
                            <Button
                              icon={<DeleteOutlined />}
                              danger
                              onClick={() => handleRemoveFloor(floor.id)}
                            >
                              Remove
                            </Button>
                          }
                        >
                      <div className="planting-floor-header">
                        <div className="planting-floor-recommended-wrap">
                        <Space
                          size="small"
                          align="center"
                          className={`planting-floor-recommended${
                            adjustedWaterRange && !adjustedWaterRange.valid ? ' is-invalid' : ''
                          }${
                            config.autoMode && floorLightRange && !floorLightRange.valid
                              ? ' is-invalid'
                              : ''
                          }`}
                        >
                          <Text type="secondary">Recommended</Text>
                          <Tooltip
                            title={
                              <Text type="secondary">
                                Original water: {formatRangeRaw(floorWaterRangeOriginal)}
                              </Text>
                            }
                          >
                            <Text type={adjustedWaterRange?.valid ? 'success' : undefined}>
                              💧 {formatRange(adjustedWaterRange)}
                            </Text>
                          </Tooltip>
                          {config.autoMode ? (
                            <Tooltip
                              title={
                                <Text type="secondary">
                                  Original light: {formatRangeRaw(floorLightRangeOriginal)}
                                </Text>
                              }
                            >
                              <Text type={floorLightRange?.valid ? 'success' : undefined}>
                                ☀️ {formatRange(floorLightRange)}
                              </Text>
                            </Tooltip>
                          ) : null}
                        </Space>
                        {waterIsOverwritten ? (
                          <Text type="warning" className="planting-floor-note">
                            Lower water bound overwritten by upper floor.
                          </Text>
                        ) : null}
                        </div>
                      </div>

                      <div className="planting-groups">
                        {floor.groups.map((group, groupIndex) => {
                          const plant = group.plantId ? plantMap.get(group.plantId) : null
                          const lightRange = plant
                            ? formatPlantRange(plant, 'lightMin', 'lightMax')
                            : '—'
                          const waterRange = plant
                            ? formatPlantRange(plant, 'waterMin', 'waterMax')
                            : '—'
                          const lightRangeRecommended = plant
                            ? formatPlantRecommendedRange(plant, 'lightMin', 'lightMax')
                            : '—'
                          const waterRangeRecommended = plant
                            ? formatPlantRecommendedRange(plant, 'waterMin', 'waterMax')
                            : '—'

                          return (
                            <Card key={group.id} className="planting-group" size="small">
                              <Space direction="vertical" size="small" className="stretch">
                                <Space align="center" className="planting-group-title">
                                  <Text strong>Group {groupIndex + 1}</Text>
                                  <Tag>10 pots</Tag>
                                  {plant?.group ? <Tag color="blue">{plant.group}</Tag> : null}
                                  {config.autoMode ? (
                                    <Tag
                                      color={
                                        globalLightRange?.valid && globalWaterRange?.valid
                                          ? 'green'
                                          : 'red'
                                      }
                                    >
                                      Auto
                                    </Tag>
                                  ) : null}
                                </Space>
                                <Select
                                  className="planting-group-select"
                                  showSearch
                                  allowClear
                                  placeholder="Select plant"
                                  value={group.plantId ?? undefined}
                                  options={plantOptionsByGroup}
                                  onChange={(value) =>
                                    handleUpdateFloor(floor.id, (current) => ({
                                      ...current,
                                      groups: current.groups.map((entry) =>
                                        entry.id === group.id
                                          ? { ...entry, plantId: value ?? null }
                                          : entry,
                                      ),
                                    }))
                                  }
                                  filterOption={(input, option) =>
                                    (option?.label ?? '')
                                      .toString()
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                />
                                <Space size="small" className="planting-metrics">
                                  <Text type="secondary">
                                    💧 <Text type="success">{waterRangeRecommended}</Text> /{' '}
                                    {waterRange}
                                  </Text>
                                  <Text type="secondary">
                                    ☀️ <Text type="success">{lightRangeRecommended}</Text> /{' '}
                                    {lightRange}
                                  </Text>
                                </Space>
                              </Space>
                            </Card>
                          )
                        })}
                      </div>
                    </Card>
                  )
                })}
                </Space>
              </Space>
            ) : (
              <Empty description="Select a planting config tab." />
            )}
          </div>
        )}
      </Space>

      <Modal
        open={Boolean(renameTarget)}
        title="Rename planting config"
        onCancel={closeRenameModal}
        onOk={submitRename}
        okText="Save"
      >
        <Paragraph type="secondary">Enter a new name.</Paragraph>
        <Input
          value={renameValue}
          placeholder="Planting config name"
          onChange={(event) => setRenameValue(event.target.value)}
          onPressEnter={submitRename}
        />
      </Modal>
    </PageLayout>
  )
}
