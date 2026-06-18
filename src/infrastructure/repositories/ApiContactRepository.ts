import type { SubmitContactRequestDTO, SubmitContactResponseDTO } from '../../application/dtos/ContactDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import { RateLimitedError } from '../../domain/errors/RateLimitedError'
import { ServerError } from '../../domain/errors/ServerError'
import { ValidationError } from '../../domain/errors/ValidationError'
import type { ContactSubmission, IContactWriteRepository } from '../../domain/repositories/contact/IContactWriteRepository'
import { ApiError } from '../api/httpClient'

// =============================================================================
// ApiContactRepository
// save — POST /contact
// Translates transport-level failure (HTTP status) into domain errors here —
// this is the one place in the app allowed to know what a 400/429/5xx means.
// Everything above this layer only ever sees ValidationError / RateLimitedError
// / ServerError, never a raw status code.
// =============================================================================
export class ApiContactRepository implements IContactWriteRepository {
    constructor(private readonly client: IApiClient) {}

    async save(submission: ContactSubmission): Promise<void> {
        const body: SubmitContactRequestDTO = { ...submission }

        try {
            await this.client.post<SubmitContactResponseDTO>('/contact', body)
        } catch (err) {
        if (err instanceof ApiError) {
            if (err.status === 400) {
                throw new ValidationError(err.message)
            }
            if (err.status === 429) {
                throw new RateLimitedError('Too many messages sent. Please wait a moment and try again.')
            }
            throw new ServerError('The server failed to process your message. Please try again later.')
        }
        // Network failure, JSON parse failure, etc. — not an ApiError, but still
        // not the caller's fault, so treat it the same as a server-side failure.
        throw new ServerError('Could not reach the server. Please check your connection and try again.')
        }
    }
}