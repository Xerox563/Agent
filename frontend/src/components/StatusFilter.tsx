import Link from 'next/link'

const options = ['ALL', 'NEW', 'QUALIFIED', 'REJECTED']

export function StatusFilter({ current }: { current: string }) {
  return (
    <div className="tabs tabs-boxed bg-base-100 w-fit">
      {options.map((option) => (
        <Link
          key={option}
          href={option === 'ALL' ? '/' : `/?status=${option}`}
          className={`tab ${current === option ? 'tab-active' : ''}`}
        >
          {option}
        </Link>
      ))}
    </div>
  )
}
