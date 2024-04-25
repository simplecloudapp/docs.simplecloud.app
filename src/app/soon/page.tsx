import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'

export default function Soon() {
    return (
        <>
            <HeroPattern />
            <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center py-16 text-center">
                <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                    Page under construction
                </h1>
                <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                    This resource has not been created yet.
                    Our Team is working hard on it.
                </p>
                <Button href="/" arrow="right" className="mt-8">
                    Back to docs
                </Button>
            </div>
        </>
    )
}
