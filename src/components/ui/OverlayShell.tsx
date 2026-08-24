import type { ReactNode } from 'react'
import { ArrowLeftIcon, XIcon } from '../icons'

type OverlayShellProps = {
  title: string
  subtitle?: string
  onBack?: () => void
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** Replaces the footer's own chrome, for panels that paint themselves. */
  footerClass?: string
  /** Thin progress line under the header, 0–100. */
  progress?: number
}

export default function OverlayShell({
  title,
  subtitle,
  onBack,
  onClose,
  children,
  footer,
  footerClass,
  progress,
}: OverlayShellProps) {
  return (
    <div className="animate-fade fixed inset-0 z-40 flex flex-col bg-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-ink/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-md items-center gap-2 px-4 py-3.5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
            >
              <ArrowLeftIcon className="h-4.5 w-4.5" />
            </button>
          ) : (
            <span className="w-9" />
          )}

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-semibold tracking-tight text-fg">{title}</p>
            {subtitle && <p className="truncate text-xs text-faint">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {progress !== undefined && (
          <div className="h-0.5 w-full bg-white/[0.06]">
            <div
              className="h-full bg-brand transition-[width] duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-md px-5 py-5">{children}</div>
      </div>

      {footer && (
        <div
          className={
            footerClass ??
            'border-t border-line bg-ink/90 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl'
          }
        >
          <div className="mx-auto w-full max-w-md px-5 pt-3">{footer}</div>
        </div>
      )}
    </div>
  )
}
