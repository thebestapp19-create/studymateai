import { HomeIcon, BookIcon, ProgressIcon, UserIcon } from './icons'
import { useNav, type Tab } from '../lib/nav'

const TABS: { id: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'exams', label: 'Exams', Icon: BookIcon },
  { id: 'progress', label: 'Progress', Icon: ProgressIcon },
  { id: 'profile', label: 'Profile', Icon: UserIcon },
]

export default function BottomNav() {
  const nav = useNav()

  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 z-30 border-t border-line bg-ink/85 pt-1.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around px-4">
        {TABS.map(({ id, label, Icon }) => {
          const active = nav.tab === id
          return (
            <li key={id}>
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => nav.setTab(id)}
                className={`flex w-16 flex-col items-center gap-1 rounded-2xl py-2 text-[0.68rem] font-medium transition-colors ${
                  active ? 'text-brand' : 'text-faint hover:text-muted'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                    active ? 'bg-brand/14' : ''
                  }`}
                >
                  <Icon className="h-[1.15rem] w-[1.15rem]" />
                </span>
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
