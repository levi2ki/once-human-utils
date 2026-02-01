import { Avatar, Collapse, Space, Table, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { animals, furniture } from '../data/deviations'
import type { Deviation } from '../types'
import {
  loadFusingUiState,
  saveFusingUiState,
  type FusingUiState,
} from '../storage/fusingStore'
import { PageLayout } from '../components/PageLayout'

const { Text } = Typography

const columns = [
  {
    title: 'Name',
    key: 'name',
    width: 200,
    render: (_: unknown, row: Deviation) => {
      const name = row.animal ?? row.item ?? '—'
      return (
        <Space size="small" align="center">
          {row.icon ? (
            <Avatar shape="square" src={row.icon} size={36}>
              {name[0]}
            </Avatar>
          ) : null}
          <span>{name}</span>
        </Space>
      )
    },
  },
  {
    title: 'Trait',
    dataIndex: 'trait' as const,
    key: 'trait',
    width: 180,
    render: (trait: string) => <Text strong>{trait}</Text>,
  },
  {
    title: 'Combat',
    dataIndex: 'combatEffect' as const,
    key: 'combat',
    ellipsis: true,
    render: (text: string) => <Text type="secondary">{text}</Text>,
  },
  {
    title: 'Crafting',
    dataIndex: 'craftingEffect' as const,
    key: 'crafting',
    ellipsis: true,
    render: (text: string) => <Text type="secondary">{text}</Text>,
  },
]

export const FusingTraitsPage = () => {
  const [uiState, setUiState] = useState<FusingUiState>(loadFusingUiState)

  useEffect(() => {
    saveFusingUiState(uiState)
  }, [uiState])

  const activeKeys = uiState.expandedSections as string[]
  const onCollapseChange = (keys: string | string[]) => {
    const next = Array.isArray(keys) ? keys : [keys]
    setUiState((s) => ({
      ...s,
      expandedSections: next as ('animals' | 'furniture')[],
    }))
  }

  return (
    <PageLayout
      title="Fusing Traits"
      description={
        <Text type="secondary">
          Deviations: Combat and Crafting effects by trait and name.
        </Text>
      }
    >
      <Collapse
        activeKey={activeKeys}
        onChange={onCollapseChange}
        items={[
          {
            key: 'animals',
            label: `Animals (${animals.length})`,
            children: (
              <Table
                dataSource={animals}
                rowKey="id"
                columns={columns}
                pagination={false}
                size="small"
                className="fusing-table"
              />
            ),
          },
          {
            key: 'furniture',
            label: `Furniture (${furniture.length})`,
            children: (
              <Table
                dataSource={furniture}
                rowKey="id"
                columns={columns}
                pagination={false}
                size="small"
                className="fusing-table"
              />
            ),
          },
        ]}
      />
    </PageLayout>
  )
}
