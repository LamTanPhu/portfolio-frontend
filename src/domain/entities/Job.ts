// =============================================================================
// Job
// endedAt null = currently employed at this company.
// =============================================================================
export class Job {
    constructor(
        public readonly id:          number,
        public readonly companyName: string,
        public readonly role:        string,
        public readonly startedAt:   Date,
        public readonly endedAt:     Date | null,
        public readonly isEnded:     boolean,
    ) {}
}