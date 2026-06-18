import type { IContactWriteRepository } from '../../../../domain/repositories/contact/IContactWriteRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiContactRepository } from '../../../../infrastructure/repositories/ApiContactRepository'

// =============================================================================
// SubmitContactCommand
// Submits a contact message. Resolves silently on success; throws
// ValidationError, RateLimitedError, or ServerError on failure — these are
// thrown by the repository implementation and simply bubble up unchanged,
// since by the time they reach here they're already meaningful at this layer.
//
// SubmitContactInput is intentionally its own type, not a reuse of
// SubmitContactRequestDTO (the wire shape POST /contact expects). That DTO is
// pinned to the backend's contract; this input is the application layer's own
// vocabulary, so a future change to the wire format doesn't ripple into here.
//
// Server-only — call create() from a Server Action (form submit handler),
// not from a Server Component's render path. Unlike loadBlogs/loadProjects
// etc., this performs a write, so it has no business running during render.
// =============================================================================
export interface SubmitContactInput {
    name:           string
    email:          string
    message:        string
    turnstileToken: string
}

export class SubmitContactCommand {
    constructor(private readonly repo: IContactWriteRepository) {}

    // Composition root — wires the real HTTP-backed repository. Tests can
    // bypass this and call `new SubmitContactCommand(fakeRepo)` directly.
    static create(): SubmitContactCommand {
        const client = new HttpApiClient()
        const repo   = new ApiContactRepository(client)
        return new SubmitContactCommand(repo)
    }

    async execute(input: SubmitContactInput): Promise<void> {
        await this.repo.save(input)
    }
}