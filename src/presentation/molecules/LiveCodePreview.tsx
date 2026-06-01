// =============================================================================
// LiveCodePreview — Molecule
// Right panel fake code editor. Updates live as the user types in the form.
// Shows the message being built as a JS object with syntax highlighting.
// =============================================================================

interface Props {
    name:    string
    email:   string
    message: string
}

interface CodeLine {
    n:    number
    parts: CodePart[]
}

interface CodePart {
    text:  string
    color: 'plain' | 'keyword' | 'string' | 'property' | 'comment' | 'operator'
}

const COLOR_MAP: Record<CodePart['color'], string> = {
    plain:    'text-(--text-primary)',
    keyword:  'text-(--text-keyword)',
    string:   'text-(--text-string)',
    property: 'text-(--text-secondary)',
    comment:  'text-(--text-comment)',
    operator: 'text-(--text-operator)',
}

function Line({ parts }: { parts: CodePart[] }) {
    return (
        <span>
        {parts.map((p, i) => (
            <span key={i} className={COLOR_MAP[p.color]}>{p.text}</span>
        ))}
        </span>
    )
}

export function LiveCodePreview({ name, email, message }: Props) {
    const date = new Date().toLocaleDateString('en-US', {
        weekday: 'short', day: '2-digit', month: 'short',
    })

    const lines: CodeLine[] = [
        {
            n: 1, parts: [
                { text: 'const ', color: 'keyword' },
                { text: 'button', color: 'plain' },
                { text: ' = ', color: 'operator' },
                { text: 'document', color: 'plain' },
                { text: '.querySelector(', color: 'plain' },
                { text: "'#sendBtn'", color: 'string' },
                { text: ');', color: 'plain' },
            ],
        },
        { n: 2,  parts: [] },
        {
            n: 3, parts: [
                { text: 'const ', color: 'keyword' },
                { text: 'message', color: 'plain' },
                { text: ' = {', color: 'plain' },
            ],
        },
        {
            n: 4, parts: [
                { text: '  name', color: 'property' },
                { text: ': ', color: 'plain' },
                { text: `"${name}"`, color: 'string' },
                { text: ',', color: 'plain' },
            ],
        },
        {
            n: 5, parts: [
                { text: '  email', color: 'property' },
                { text: ': ', color: 'plain' },
                { text: `"${email}"`, color: 'string' },
                { text: ',', color: 'plain' },
            ],
        },
        {
            n: 6, parts: [
                { text: '  message', color: 'property' },
                { text: ': ', color: 'plain' },
                { text: `"${message.length > 30 ? message.slice(0, 30) + '...' : message}"`, color: 'string' },
                { text: ',', color: 'plain' },
            ],
        },
        {
            n: 7, parts: [
                { text: '  date', color: 'property' },
                { text: ': ', color: 'plain' },
                { text: `"${date}"`, color: 'string' },
            ],
        },
        { n: 8,  parts: [{ text: '}', color: 'plain' }] },
        { n: 9,  parts: [] },
        {
            n: 10, parts: [
                { text: 'button', color: 'plain' },
                { text: '.addEventListener(', color: 'plain' },
                { text: "'click'", color: 'string' },
                { text: ', () ', color: 'plain' },
                { text: '=>', color: 'operator' },
                { text: ' {', color: 'plain' },
            ],
        },
        {
            n: 11, parts: [
                { text: '  form', color: 'plain' },
                { text: '.send(', color: 'plain' },
                { text: 'message', color: 'plain' },
                { text: ');', color: 'plain' },
            ],
        },
        { n: 12, parts: [{ text: '})', color: 'plain' }] },
    ]

    return (
        <section className="flex flex-col h-full border-l border-(--border-muted) bg-[rgba(1,13,24,0.4)] overflow-hidden">

        {/* Minimize button — decorative */}
        <div className="flex justify-end px-3 py-2 shrink-0">
            <span className="w-3 h-0.5 bg-(--border-muted) mt-1" />
        </div>

        {/* Code */}
        <div className="flex flex-1 overflow-y-auto">

            {/* Line numbers */}
            <div className="flex flex-col pt-2 pb-6 px-4 shrink-0 select-none border-r border-(--border-subtle)">
            {lines.map((line) => (
                <span key={line.n} className="font-mono text-sm text-(--text-muted) leading-7 text-right min-w-6">
                {line.n}
                </span>
            ))}
            </div>

            {/* Code lines */}
            <div className="flex flex-col pt-2 pb-6 px-6 overflow-x-auto">
            {lines.map((line) => (
                <div key={line.n} className="font-mono text-sm leading-7 whitespace-pre">
                <Line parts={line.parts} />
                </div>
            ))}
            </div>

        </div>
        </section>
    )
}