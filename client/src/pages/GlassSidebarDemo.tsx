import { useMemo, useState } from 'react';
import GlassSidebar, { readGlassSidebarCollapsed, type GlassSidebarGroup, type GlassSidebarItem } from '../components/GlassSidebar';
import styles from './GlassSidebarDemo.module.css';

const GROUPS: GlassSidebarGroup[] = [
  {
    items: [
      { id: 'home', label: 'Home', icon: 'Home' },
      { id: 'post', label: 'Post', icon: 'FilePlus' },
      { id: 'messages', label: 'Messages', icon: 'Mail' },
      { id: 'friends', label: 'Friends', icon: 'Users' },
      { id: 'notifications', label: 'Notifications', icon: 'Bell', badge: 2 },
      { id: 'group', label: 'Group', icon: 'UsersRound' },
    ],
  },
  {
    items: [
      { id: 'pages', label: 'Pages', icon: 'FileText' },
      { id: 'games', label: 'Games', icon: 'Gamepad2' },
      { id: 'settings', label: 'Setting', icon: 'Settings' },
    ],
  },
];

const FOOTER: GlassSidebarItem = { id: 'logout', label: 'Log Out', icon: 'Power' };

const COPY: Record<string, string> = {
  home: 'The home feed sits beside the floating glass navigation.',
  post: 'Start a new post from here.',
  messages: 'Messages open in this content area.',
  friends: 'People you follow are listed here.',
  notifications: 'Two notifications are waiting.',
  group: 'Groups you belong to.',
  pages: 'Pages you manage.',
  games: 'Games available to this account.',
  settings: 'Account and display settings.',
  logout: 'Log out of this session.',
};

export default function GlassSidebarDemo() {
  const [collapsed, setCollapsed] = useState(() => readGlassSidebarCollapsed(false));
  const [activeId, setActiveId] = useState('home');

  const active = useMemo(() => {
    const items = GROUPS.flatMap((group) => group.items);
    return items.find((item) => item.id === activeId) ?? FOOTER;
  }, [activeId]);

  return (
    <div className={styles.page} dir="ltr">
      <div className={styles.orbA} aria-hidden="true" />
      <div className={styles.orbB} aria-hidden="true" />
      <GlassSidebar
        brand="CODEXR"
        brandShort="CXR"
        user={{ name: 'softysta.com', role: 'Super Admin', avatar: 'S' }}
        groups={GROUPS}
        footer={FOOTER}
        activeId={activeId}
        onSelect={setActiveId}
        collapsed={collapsed}
        onToggle={setCollapsed}
      />
      <main className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        <p className={styles.kicker}>Glass sidebar</p>
        <h1>{active.label}</h1>
        <p className={styles.copy}>{COPY[active.id]}</p>
      </main>
    </div>
  );
}
