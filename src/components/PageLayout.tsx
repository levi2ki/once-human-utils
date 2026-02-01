import type { ReactNode } from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

type PageLayoutProps = {
  title: string
  description?: ReactNode
  children: ReactNode
  cardClassName?: string
}

export const PageLayout = ({ title, description, children, cardClassName }: PageLayoutProps) => {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Title level={2}>{title}</Title>
          {description ?? null}
        </div>
      </div>
      <Card className={cardClassName ? `config-card ${cardClassName}` : 'config-card'}>
        {children}
      </Card>
    </div>
  )
}
