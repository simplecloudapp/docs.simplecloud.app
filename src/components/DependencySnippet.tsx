'use client'

import { Tab } from '@headlessui/react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import {Fragment, useEffect, useState} from "react";

interface DependencySnippetProps {
    groupId: string
    artifactId: string
    type: 'snapshot' | 'release'
}

const REPOSITORIES = {
    snapshot: [
        { id: 'simplecloud-snapshots', url: 'https://repo.simplecloud.app/snapshots' },
        { id: 'buf-maven', url: 'https://buf.build/gen/maven' }
    ],
    release: [
        { id: 'buf-maven', url: 'https://buf.build/gen/maven' }
    ]
} as const

function ClipboardIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
    return (
        <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
            <path strokeWidth="0" d="M5.5 13.5v-5a2 2 0 0 1 2-2l.447-.894A2 2 0 0 1 9.737 4.5h.527a2 2 0 0 1 1.789 1.106l.447.894a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2Z" />
            <path fill="none" strokeLinejoin="round" d="M12.5 6.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2m5 0-.447-.894a2 2 0 0 0-1.79-1.106h-.527a2 2 0 0 0-1.789 1.106L7.5 6.5m5 0-1 1h-3l-1-1" />
        </svg>
    )
}

function CopyButton({ code }: { code: string }) {
    const [copyCount, setCopyCount] = useState(0)
    const copied = copyCount > 0

    useEffect(() => {
        if (copied) {
            const timeout = setTimeout(() => setCopyCount(0), 1000)
            return () => clearTimeout(timeout)
        }
    }, [copied])

    return (
        <button
            type="button"
            className={clsx(
                'group/button absolute right-4 top-3.5 overflow-hidden rounded-full py-1 pl-2 pr-3 text-2xs font-medium opacity-0 backdrop-blur transition focus:opacity-100 group-hover:opacity-100',
                copied
                    ? 'bg-sky-400/10 ring-1 ring-inset ring-sky-400/20'
                    : 'bg-white/5 hover:bg-white/7.5 dark:bg-white/2.5 dark:hover:bg-white/5',
            )}
            onClick={() => {
                window.navigator.clipboard.writeText(code).then(() => {
                    setCopyCount((count) => count + 1)
                })
            }}
        >
            <span
                aria-hidden={copied}
                className={clsx(
                    'pointer-events-none flex items-center gap-0.5 text-zinc-400 transition duration-300',
                    copied && '-translate-y-1.5 opacity-0',
                )}
            >
                <ClipboardIcon className="h-5 w-5 fill-zinc-500/20 stroke-zinc-500 transition-colors group-hover/button:stroke-zinc-400" />
                Copy
            </span>
            <span
                aria-hidden={!copied}
                className={clsx(
                    'pointer-events-none absolute inset-0 flex items-center justify-center text-sky-400 transition duration-300',
                    !copied && 'translate-y-1.5 opacity-0',
                )}
            >
                Copied!
            </span>
        </button>
    )
}

async function fetchLatestVersion(groupId: string, artifactId: string, type: 'snapshot' | 'release'): Promise<string> {
    if (type === 'snapshot') {
        const response = await fetch(
            `https://repo.simplecloud.app/api/maven/latest/version/snapshots/${groupId.replace(/\./g, '/')}/${artifactId}?type=raw`
        )
        if (!response.ok) throw new Error('Version not found')
        const version = await response.text()
        if (!version) throw new Error('No version found')
        return version
    }

    const response = await fetch(
        `https://search.maven.org/solrsearch/select?q=g:&quot;${groupId}&quot;+AND+a:&quot;${artifactId}&quot;&rows=1&wt=json`
    )
    if (!response.ok) throw new Error('Version not found')

    const data = await response.json()
    const version = data?.response?.docs?.[0]?.latestVersion
    if (!version) throw new Error('No version found in Maven Central')

    return version
}

function getCodeString(language: 'kotlin' | 'groovy' | 'maven', {
    repositories,
    groupId,
    artifactId,
    version
}: {
    repositories: typeof REPOSITORIES[keyof typeof REPOSITORIES],
    groupId: string,
    artifactId: string,
    version: string
}) {
    switch (language) {
        case 'kotlin':
            return `repositories {
${repositories.map(repo => `    maven("${repo.url}")`).join('\n')}
}

dependencies {
    api("${groupId}:${artifactId}:${version}")}`

        case 'groovy':
            return `repositories {
${repositories.map(repo => `    maven {
        url "${repo.url}"
    }`).join('\n')}
}

dependencies {
    api '${groupId}:${artifactId}:${version}'}`

        case 'maven':
            return `<repositories>
${repositories.map(repo => `    <repository>
        <id>${repo.id}</id>
        <url>${repo.url}</url>
    </repository>`).join('\n')}
</repositories>

<dependency>
    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>${version}</version>
</dependency>`
    }
}

function KotlinSnippet({ repositories, groupId, artifactId, version }: {
    repositories: typeof REPOSITORIES[keyof typeof REPOSITORIES],
    groupId: string,
    artifactId: string,
    version: string
}) {
    const code = getCodeString('kotlin', { repositories, groupId, artifactId, version })

    return (
        <div className="relative group">
            <pre className="overflow-x-auto p-4 prose prose-code:border-none prose-code:bg-[#18181B] prose-code:text-xs prose-code:ring-0 bg-[#18181B]">
                <code className="text-white text-xs block">
                    <span className="text-sky-300">repositories</span> {'{'}
                    <br/>
                    {repositories.map(repo => (
                        <Fragment key={repo.id}>
                            {'    '}<span className="text-violet-300">maven</span>
                            {'('}<span className="text-sky-300">&quot;{repo.url}&quot;</span>{')'}<br/>
                        </Fragment>
                    ))}
                    {'}'}
                    <br/>
                    <br/>
                    <span className="text-sky-300">dependencies</span> {'{'}
                    <br/>
                    {'    '}<span className="text-violet-300">api</span>
                    {'('}<span className="text-sky-300">&quot;{groupId}:{artifactId}:{version}&quot;</span>{')'}
                    <br/>
                    {'}'}
                </code>
            </pre>
            <CopyButton code={code} />
        </div>
    )
}

function GroovySnippet({ repositories, groupId, artifactId, version }: {
    repositories: typeof REPOSITORIES[keyof typeof REPOSITORIES],
    groupId: string,
    artifactId: string,
    version: string
}) {
    const code = getCodeString('groovy', { repositories, groupId, artifactId, version })

    return (
        <div className="relative group">
            <pre className="overflow-x-auto p-4 prose prose-code:border-none prose-code:bg-[#18181B] prose-code:text-xs prose-code:ring-0 bg-[#18181B]">
                <code className="text-white text-xs block">
                    <span className="text-sky-300">repositories</span> {'{'}
                    {repositories.map(repo => (
                        <Fragment key={repo.id}>
                            <br/>{'    '}maven {'{'}
                            <br/>{'        '}url <span className="text-sky-300">&quot;{repo.url}&quot;</span>
                            <br/>{'    '}{'}'}<br/>
                        </Fragment>
                    ))}
                    {'}'}
                    <br/>
                    <br/>
                    <span className="text-sky-300">dependencies</span> {'{'}
                    <br/>{'    '}api <span className="text-sky-300">&apos;{groupId}:{artifactId}:{version}&apos;</span>
                    <br/>{'}'}
                </code>
            </pre>
            <CopyButton code={code} />
        </div>
    )
}

function MavenSnippet({ repositories, groupId, artifactId, version }: {
    repositories: typeof REPOSITORIES[keyof typeof REPOSITORIES],
    groupId: string,
    artifactId: string,
    version: string
}) {
    const code = getCodeString('maven', { repositories, groupId, artifactId, version })

    return (
        <div className="relative group">
            <pre className="overflow-x-auto p-4 prose prose-code:border-none prose-code:bg-[#18181B] prose-code:text-xs prose-code:ring-0 bg-[#18181B]">
                <code className="text-white text-xs block">
                    <span className="text-sky-300">&lt;repositories&gt;</span>
                    {repositories.map(repo => (
                        <Fragment key={repo.id}>
                            <br/>{'    '}<span className="text-sky-300">&lt;repository&gt;</span>
                            <br/>{'        '}<span className="text-sky-300">&lt;id&gt;</span>
                            <span className="text-white">{repo.id}</span>
                            <span className="text-sky-300">&lt;/id&gt;</span>
                            <br/>{'        '}<span className="text-sky-300">&lt;url&gt;</span>
                            <span className="text-white">{repo.url}</span>
                            <span className="text-sky-300">&lt;/url&gt;</span>
                            <br/>{'    '}<span className="text-sky-300">&lt;/repository&gt;</span>
                        </Fragment>
                    ))}
                    <br/><span className="text-sky-300">&lt;/repositories&gt;</span>
                    <br/>
                    <br/>
                    <span className="text-sky-300">&lt;dependency&gt;</span>
                    <br/>{'    '}<span className="text-sky-300">&lt;groupId&gt;</span>
                    <span className="text-white">{groupId}</span>
                    <span className="text-sky-300">&lt;/groupId&gt;</span>
                    <br/>{'    '}<span className="text-sky-300">&lt;artifactId&gt;</span>
                    <span className="text-white">{artifactId}</span>
                    <span className="text-sky-300">&lt;/artifactId&gt;</span>
                    <br/>{'    '}<span className="text-sky-300">&lt;version&gt;</span>
                    <span className="text-white">{version}</span>
                    <span className="text-sky-300">&lt;/version&gt;</span>
                    <br/><span className="text-sky-300">&lt;/dependency&gt;</span>
                </code>
            </pre>
            <CopyButton code={code} />
        </div>
    )
}

export function DependencySnippet({ groupId, artifactId, type }: DependencySnippetProps) {
    const { data: version, isLoading, isError } = useQuery({
        queryKey: ['dependency-version', groupId, artifactId, type],
        queryFn: () => fetchLatestVersion(groupId, artifactId, type),
        staleTime: 1000 * 60 * 60,
    })

    if (isLoading) return <div>Loading dependency information...</div>
    if (isError) return <div>Error: Version not found</div>
    if (!version) return <div>Version not found</div>

    const repositories = REPOSITORIES[type]

    return (
        <div className="my-6 overflow-hidden rounded-2xl bg-[#1E1E1E] shadow-md">
            <Tab.Group>
                <div className="flex min-h-[calc(theme(spacing.12)+1px)] flex-wrap items-start gap-x-4 border-b border-zinc-700 bg-[#27272A] px-4">
                    <Tab.List className="-mb-px flex gap-4 text-xs font-medium">
                        {['Kotlin', 'Groovy', 'Maven'].map(lang => (
                            <Tab key={lang} className={({ selected }) => clsx(
                                'border-b py-3 transition focus:outline-none',
                                selected ? 'border-sky-500 text-sky-400' : 'border-transparent text-zinc-400 hover:text-zinc-300'
                            )}>
                                {lang}
                            </Tab>
                        ))}
                    </Tab.List>
                </div>
                <Tab.Panels>
                    <Tab.Panel>
                        <KotlinSnippet
                            repositories={repositories}
                            groupId={groupId}
                            artifactId={artifactId}
                            version={version}
                        />
                    </Tab.Panel>
                    <Tab.Panel>
                        <GroovySnippet
                            repositories={repositories}
                            groupId={groupId}
                            artifactId={artifactId}
                            version={version}
                        />
                    </Tab.Panel>
                    <Tab.Panel>
                        <MavenSnippet
                            repositories={repositories}
                            groupId={groupId}
                            artifactId={artifactId}
                            version={version}
                        />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}