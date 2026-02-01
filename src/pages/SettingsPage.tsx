import { Radio, Space, Typography } from 'antd'
import { useTheme } from '../theme/ThemeProvider'
import { PageLayout } from '../components/PageLayout'

const { Text } = Typography

export const SettingsPage = () => {
  const { preference, resolved, setPreference } = useTheme()

  return (
    <PageLayout
      title="Settings"
      description={<Text type="secondary">Manage app preferences stored locally.</Text>}
    >
      <Space direction="vertical" size="small" className="stretch">
        <Text strong>Theme</Text>
        <Radio.Group
          value={preference}
          onChange={(event) => setPreference(event.target.value)}
        >
          <Space direction="vertical">
            <Radio value="system">System (fallback to light)</Radio>
            <Radio value="light">Light</Radio>
            <Radio value="dark">Dark</Radio>
          </Space>
        </Radio.Group>
        <Text type="secondary">Current theme: {resolved}</Text>
      </Space>
    </PageLayout>
  )
}
