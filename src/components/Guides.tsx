import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'

const guides = [
  {
    href: '/minecraft-deployment',
    name: 'Minecraft Deployments',
    description: 'Learn how to create a Minecraft server deployment.',
  },
  {
    href: '/minecraft-stateful-set',
    name: 'Minecraft StatefulSets',
    description: 'Understand how to manage Minecraft StatefulSets.',
  },
  {
    href: '/minecraft-server-set',
    name: 'Minecraft ServerSets',
    description: 'See how Minecraft server sets work, and how they start servers',
  },
  {
    href: '/minecraft-server',
    name: 'Minecraft Servers',
    description: 'Learn how a Minecraft server is structured and how you can use it.',
  },
  {
    href: '/minecraft-autoscaler',
    name: 'Minecraft Autoscaler',
    description: 'Read about our Autoscaler and create your own one.',
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
