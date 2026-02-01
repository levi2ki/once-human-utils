import { Button, Card, Space, Typography } from 'antd'
import { Link } from 'react-router-dom'

const { Title, Paragraph, Text } = Typography

type ComingSoonProps = {
  title: string
  description?: string
}

export const ComingSoon = ({ title, description }: ComingSoonProps) => (
  <Card className="coming-soon-card">
    <Space direction="vertical" size="middle">
      <Text type="secondary">Coming soon</Text>
      <Title level={3}>{title}</Title>
      <Paragraph type="secondary">
        {description ?? 'This page is under construction.'}
      </Paragraph>
      <Button type="primary">
        <Link to="/">Back to configurator</Link>
      </Button>
    </Space>
  </Card>
)
