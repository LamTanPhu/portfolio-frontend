// =============================================================================
// Education
// endedAt null = currently enrolled (isCompleted mirrors that on the DTO,
// kept here too so callers don't have to re-derive it from a null check).
// =============================================================================
export class Education {
    constructor(
        public readonly id:            number,
        public readonly degreeName:    string,
        public readonly instituteName: string,
        public readonly instituteUrl:  string | null,
        public readonly startedAt:     Date,
        public readonly endedAt:       Date | null,
        public readonly isCompleted:   boolean,
    ) {}
}