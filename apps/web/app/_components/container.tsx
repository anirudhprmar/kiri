import { cn } from '@/lib/utils'
import React from 'react'

export default function Container({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("max-w-6xl h-full mx-auto relative z-10 selection:bg-primary selection:text-white", className)}>
            {children}
        </div>
    )
}
