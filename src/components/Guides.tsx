import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'

const guides = [
  {
    href: '/controller',
    name: 'Controller',
    description: 'Learn how the new controller works.',
  },
  {
    href: '/server-group',
    name: 'Server Groups',
    description: 'Understand how to manage server groups.',
  },
  {
    href: '/server',
    name: 'Servers',
    description: 'See how servers work, and how you can customize them.',
  },
  {
    href: '/template',
    name: 'Templates',
    description: 'Learn how a template is structured and how you can use it.',
  },
  {
    href: '/permissions',
    name: 'Permissions',
    description: 'See how you can integrate a permissions system with SimpleCloud.',
  }
]

export function Guides() {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="guides">
        Guides
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4 dark:border-white/5">
        {guides.map((guide) => (
          <div key={guide.href}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {guide.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {guide.description}
            </p>
            <p className="mt-4">
              <Button href={guide.href} variant="text" arrow="right">
                Read more
              </Button>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
