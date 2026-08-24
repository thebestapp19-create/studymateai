import { ArrowRightIcon, BoltIcon } from './icons'
import { Button } from './ui/primitives'
import { actionLine, gainLine } from '../lib/engine/insights'
import { MODE_LABEL, type PlanItem } from '../lib/engine/planner'

type NextStepCardProps = {
  item: PlanItem
  done: boolean
  onStart: () => void
}

export default function NextStepCard({ item, done, onStart }: NextStepCardProps) {
  const gain = gainLine(item)

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-brand/25 bg-brand/[0.07] p-5">
      <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />

      <div className="relative">
        <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-brand uppercase">
          <BoltIcon className="h-3.5 w-3.5" />
          {done ? 'Done for now' : 'Your next best step'}
        </p>

        <h2 className="mt-2.5 text-[1.35rem] leading-tight font-bold tracking-tight text-fg">
          {actionLine(item)}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">{item.reason}</p>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={onStart} size="md">
            {done ? 'Go again' : `Start ${MODE_LABEL[item.mode].toLowerCase()}`}
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
          {gain && <span className="text-xs font-medium text-brand-tint">{gain}</span>}
        </div>
      </div>
    </section>
  )
}
