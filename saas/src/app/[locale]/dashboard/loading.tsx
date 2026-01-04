export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse text-sm">Loading pulses...</p>
            </div>
        </div>
    )
}
