import { Layout, Menu, Space, Typography } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { ConfigsPage } from './pages/ConfigsPage'
import { SettingsPage } from './pages/SettingsPage'
import { MemeticsLibraryPage } from './pages/MemeticsLibraryPage'
import { PlantingConfigsPage } from './pages/PlantingConfigsPage'
import { FusingTraitsPage } from './pages/FusingTraitsPage'
import './App.css'

const { Content, Footer, Sider } = Layout
const { Link, Text } = Typography

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedKey =
    location.pathname === '/memetics'
      ? 'memetics'
      : location.pathname === '/planting'
        ? 'planting'
        : location.pathname === '/fusing'
          ? 'fusing'
          : location.pathname === '/settings'
            ? 'settings'
            : 'configs'

  return (
    <Layout className="app-layout">
      <Layout className="app-main">
        <Sider width={240} className="app-sider" theme="light">
          <div className="sider-header">
            <div className="sider-logo">OH</div>
            <div>
              <div className="sider-title">Once Human Helper</div>
              <div className="sider-subtitle">Twink Tech Management</div>
            </div>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={({ key }) => {
              if (key === 'configs') navigate('/')
              if (key === 'memetics') navigate('/memetics')
              if (key === 'planting') navigate('/planting')
              if (key === 'fusing') navigate('/fusing')
              if (key === 'settings') navigate('/settings')
            }}
            items={[
              { key: 'configs', label: 'Tech Configs' },
              { key: 'planting', label: 'Planting Configs' },
              { key: 'fusing', label: 'Fusing Traits' },
              { key: 'memetics', label: 'Memetics Library' },
              { key: 'settings', label: 'Settings' },
            ]}
          />
        </Sider>
        <Content className="app-content">
          {selectedKey === 'configs' && <ConfigsPage />}
          {selectedKey === 'planting' && <PlantingConfigsPage />}
          {selectedKey === 'fusing' && <FusingTraitsPage />}
          {selectedKey === 'memetics' && <MemeticsLibraryPage />}
          {selectedKey === 'settings' && <SettingsPage />}
        </Content>
      </Layout>
      <Footer className="app-footer">
        <Space size="large">
          <Text type="secondary">Configs are stored locally in your browser.</Text>
          <Space size="small">
            <Link href="https://github.com/levi2ki/once-human-utils" target="_blank">
              <GithubOutlined /> Repository
            </Link>
            <Link
              href="https://github.com/levi2ki/once-human-utils/issues"
              target="_blank"
            >
              Issues
            </Link>
            <Link
              href="https://github.com/levi2ki/once-human-utils/blob/main/LICENSE"
              target="_blank"
            >
              License
            </Link>
          </Space>
        </Space>
      </Footer>
    </Layout>
  )
}

export default App
