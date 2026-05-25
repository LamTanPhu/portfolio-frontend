// // =============================================================================
// // GameActions — Molecule (snake-specific)
// // Bottom action bar. start-game left, skip right.
// // play-again moves into GameCanvas banner — this only shows idle + playing.
// // =============================================================================

// type Phase = 'idle' | 'playing' | 'won' | 'lost'

// interface Props {
//     phase:   Phase
//     eaten:   number
//     onStart: () => void
//     onSkip?: () => void
// }

// export function GameActions({ phase, eaten, onStart, onSkip }: Props) {
//     return (
//         <footer className="flex items-center justify-between px-8 pt-3 pb-6 border-t border-(--border-muted)">

//         {/* Left */}
//         <div>
//             {phase === 'idle' && (
//             <button
//                 onClick={onStart}
//                 className="
//                 font-mono text-xs font-semibold
//                 px-5 py-2 rounded-sm
//                 bg-(--accent-amber) text-[#010d18]
//                 hover:opacity-90 transition-opacity
//                 "
//             >
//                 start-game
//             </button>
//             )}

//             {phase === 'playing' && (
//             <span className="font-mono text-xs text-(--text-muted)">
//                 eaten: {eaten}
//             </span>
//             )}

//             {(phase === 'won' || phase === 'lost') && (
//             <span className="font-mono text-xs text-(--text-muted) opacity-0 select-none">
//                 {/* spacer to keep layout stable */}
//                 placeholder
//             </span>
//             )}
//         </div>

//         {/* Right — skip */}
//         <button
//             onClick={onSkip}
//             className="
//             font-mono text-xs
//             px-4 py-2 rounded-lg
//             text-(--text-muted)
//             border border-(--border-muted)
//             hover:text-(--text-primary) hover:border-(--accent-teal)
//             transition-colors duration-150
//             "
//         >
//             skip
//         </button>

//         </footer>
//     )
// }