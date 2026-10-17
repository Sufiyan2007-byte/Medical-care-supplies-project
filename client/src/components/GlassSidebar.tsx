import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  FilePlus,
  FileText,
  Gamepad2,
  Home,
  Mail,
  Power,
  Settings,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import styles from './GlassSidebar.module.css';

const STORAGE_KEY = 'glass_sidebar_collapsed';

const ICONS: Record<string, LucideIcon> = {
  Bell,
  FilePlus,
  FileText,
  Gamepad2,
  Home,
  Mail,
  Power,
  Settings,
  Users,
  UsersRound,
};

export type GlassSidebarItem = {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  href?: string;
};

export type GlassSidebarGroup = {
  items: GlassSidebarItem[];
};

export type GlassSidebarUser = {
  name: string;
  role: string;
  avatar: string;
};

export type GlassSidebarProps = {
  brand?: string;
  brandShort?: string;
  user: GlassSidebarUser;
  groups: GlassSidebarGroup[];
  footer: GlassSidebarItem;
  activeId?: string;
  onSelect?: (id: string) => void;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
};

export function readGlassSidebarCollapsed(fallback = false): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === '1') return true;
    if (raw === '0') return false;
  } catch {
    /* storage blocked */
  }
  return fallback;
}

function NavGlyph({ name }: { name: string }) {
  const Icon = ICONS[name];
  if (!Icon) return <span className={styles.iconFallback} aria-hidden="true" />;
  return <Icon size={20} strokeWidth={1.75} aria-hidden="true" />;
}

type RowProps = {
  item: GlassSidebarItem;
  active: boolean;
  collapsed: boolean;
  onSelect?: (id: string) => void;
  onHover: (id: string) => void;
  setRef: (node: HTMLElement | null) => void;
};

function NavRow({ item, active, collapsed, onSelect, onHover, setRef }: RowProps) {
  const tipId = `gs-tip-${item.id}`;
  const showBadge = item.badge != null && item.badge > 0;
  const body = (
    <>
      <span className={styles.icon}>
        <NavGlyph name={item.icon} />
      </span>
      <span className={styles.text}>{item.label}</span>
      {showBadge && (
        <span className={styles.badge} aria-hidden={collapsed ? true : undefined}>
          {item.badge}
        </span>
      )}
      {collapsed && (
        <span className={styles.tooltip} id={tipId} role="tooltip" aria-hidden="true">
          {item.label}
        </span>
      )}
    </>
  );

  const shared = {
    className: styles.item,
    'data-id': item.id,
      'aria-current': active ? ('page' as const) : undefined,
    'aria-label': collapsed && showBadge ? `${item.label}, ${item.badge}` : undefined,
    onMouseEnter: () => onHover(item.id),
    onClick: () => onSelect?.(item.id),
    ref: setRef as Ref<HTMLButtonElement & HTMLAnchorElement>,
    children: body,
  };

  if (item.href) return <a href={item.href} {...shared} />;
  return <button type="button" {...shared} />;
}

export default function GlassSidebar({
  brand = 'CODEXR',
  brandShort = 'CXR',
  user,
  groups,
  footer,
  activeId,
  onSelect,
  defaultCollapsed = false,
  collapsed,
  onToggle,
}: GlassSidebarProps) {
  const controlled = collapsed !== undefined;
  const [stored, setStored] = useState(() => readGlassSidebarCollapsed(defaultCollapsed));
  const isCollapsed = controlled ? Boolean(collapsed) : stored;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pill, setPill] = useState({ top: 0, height: 44, on: false });
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isCollapsed ? '1' : '0');
    } catch {
      /* storage blocked */
    }
  }, [isCollapsed]);

  const toggle = () => {
    const next = !isCollapsed;
    if (!controlled) setStored(next);
    onToggle?.(next);
  };

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const measure = () => {
      const id = hoverId ?? activeId ?? null;
      const el = id ? itemRefs.current[id] : null;
      if (!el) {
        setPill((prev) => (prev.on ? { ...prev, on: false } : prev));
        return;
      }
      const top = el.offsetTop;
      const height = el.offsetHeight;
      setPill((prev) => (
        prev.on && prev.top === top && prev.height === height
          ? prev
          : { top, height, on: true }
      ));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(menu);
    return () => observer.disconnect();
  }, [hoverId, activeId, isCollapsed, groups, footer]);

  const avatarIsImage = user.avatar.startsWith('http') || user.avatar.startsWith('/');
  let avatar: ReactNode = user.avatar;
  if (avatarIsImage) {
    avatar = <img src={user.avatar} alt="" />;
  }

  return (
    <nav
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      aria-label="Main"
    >
      <button
        type="button"
        className={styles.collapse}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!isCollapsed}
        onClick={toggle}
      >
        <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      <div className={styles.head}>
        <span className={styles.dots} aria-hidden="true">
          <i className={`${styles.dot} ${styles.dotRed}`} />
          <i className={`${styles.dot} ${styles.dotYellow}`} />
          <i className={`${styles.dot} ${styles.dotGreen}`} />
        </span>
        <span className={styles.brand}>
          <span aria-hidden="true">{isCollapsed ? brandShort : brand}</span>
          <span className={styles.srOnly}>{brand}</span>
        </span>
      </div>

      <hr className={styles.divider} />

      <button
        type="button"
        className={styles.profile}
        aria-label={`${user.name}, ${user.role}`}
      >
        <span className={styles.avatar} aria-hidden="true">{avatar}</span>
        <span className={styles.profileCopy}>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.role}>{user.role}</span>
        </span>
        <span className={styles.chevron} aria-hidden="true">
          <ChevronDown size={16} strokeWidth={2} />
        </span>
        {isCollapsed && (
          <span className={styles.tooltip} role="tooltip">{user.name}</span>
        )}
      </button>

      <hr className={styles.divider} />

      <div
        className={styles.menu}
        ref={menuRef}
        onMouseLeave={() => setHoverId(null)}
      >
        <div
          className={`${styles.pill} ${pill.on ? styles.pillOn : ''}`}
          style={{ transform: `translateY(${pill.top}px)`, height: pill.height }}
          aria-hidden="true"
        />

        <p className={styles.menuLabel}>MENU</p>

        {groups.map((group, index) => (
          <div className={styles.group} key={group.items[0]?.id ?? index}>
            {index > 0 && <hr className={styles.divider} />}
            {group.items.map((item) => (
              <NavRow
                key={item.id}
                item={item}
                active={item.id === activeId}
                collapsed={isCollapsed}
                onSelect={onSelect}
                onHover={setHoverId}
                setRef={(node) => { itemRefs.current[item.id] = node; }}
              />
            ))}
          </div>
        ))}

        <div className={styles.pin}>
          <hr className={styles.divider} />
          <NavRow
            item={footer}
            active={footer.id === activeId}
            collapsed={isCollapsed}
            onSelect={onSelect}
            onHover={setHoverId}
            setRef={(node) => { itemRefs.current[footer.id] = node; }}
          />
        </div>
      </div>
    </nav>
  );
}
