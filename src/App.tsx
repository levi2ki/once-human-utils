import { Layout, Menu, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { ConfigsPage } from './pages/ConfigsPage'
import { ComingSoon } from './pages/ComingSoon'
import './App.css'

const { Content, Footer, Sider } = Layout
const { Text } = Typography

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedKey =
    location.pathname === '/memetics'
      ? 'memetics'
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
              if (key === 'settings') navigate('/settings')
            }}
            items={[
              { key: 'configs', label: 'Configurations' },
              { key: 'memetics', label: 'Memetics Library' },
              { key: 'settings', label: 'Settings' },
            ]}
          />
        </Sider>
        <Content className="app-content">
          {selectedKey === 'configs' && <ConfigsPage />}
          {selectedKey === 'memetics' && (
            <ComingSoon
              title="Memetics Library"
              description="Browse and explore memetic specializations here."
            />
          )}
          {selectedKey === 'settings' && (
            <ComingSoon
              title="Settings"
              description="Manage app preferences and storage here."
            />
          )}
        </Content>
      </Layout>
      <Footer className="app-footer">
        <Text type="secondary">Configurations are stored locally in your browser.</Text>
      </Footer>
    </Layout>
  )
}

export default App
