import { BookIcon, HomeIcon, ProgressIcon, UserIcon } from './icons'

type BottomNavProps = {
  /** Tabs other than Home are not built yet. */
  onUnavailable: (label: string) => void
}

const TABS = [
  { label: 'Home', Icon: HomeIcon, active: true },
  { label: 'Exams', Icon: BookIcon, active: false },
  { label: 'Progress', Icon: ProgressIcon, active: false },
  { label: 'Profile', Icon: UserIcon, active: false },
]

export default function BottomNav({ onUnavailable }: BottomNavProps) {
  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 border-t border-line bg-surface/95 px-4 pt-2 pb-3 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {TABS.map(({ label, Icon, active }) => (
          <li key={label}>
            <button
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={active ? undefined : () => onUnavailable(label)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-5 py-2 text-xs font-medium transition-colors ${
                active
                  ? 'bg-brand/15 text-brand'
                  : 'text-faint hover:text-muted'
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
