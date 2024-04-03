import Image from 'next/image'

import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'
import logoKotlin from '@/images/logos/kotlin.svg'
import logoJava from '@/images/logos/java.svg'
import logoGo from '@/images/logos/go.svg'

const libraries = [
  {
    href: '/sdk/kotlin',
    name: 'Kotlin',
    description:
      'A modern programming language that makes developers happier and more productive.',
    logo: logoKotlin,
  },
  {
    href: '/sdk/java',
    name: 'Java',
    description:
        'A general-purpose programming language that is class-based, object-oriented, and designed to have as few implementation dependencies as possible.',
    logo: logoJava,
  },
  {
    href: '/sdk/go',
    name: 'Go',
    description:
        'An open-source programming language supported by Google with built-in concurrency.',
    logo: logoGo,
  },
]

export function Libraries() {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="official-libraries">
        Official libraries
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-x-6 gap-y-10 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 xl:max-w-none xl:grid-cols-3 dark:border-white/5">
        {libraries.map((library) => (
          <div key={library.name} className="flex flex-row-reverse gap-6">
            <div className="flex-auto">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {library.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {library.description}
              </p>
              <p className="mt-4">
                <Button href={library.href} variant="text" arrow="right">
                  Read more
                </Button>
              </p>
            </div>
            <Image
              src={library.logo}
              alt=""
              className="h-12 w-12"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  )
}
