// =============================================================================
// Certification
// endDate null = no expiry / lifetime certification.
// =============================================================================
export class Certification {
  constructor(
    public readonly id:        number,
    public readonly name:      string,
    public readonly url:       string,
    public readonly startDate: Date,
    public readonly endDate:   Date | null,
  ) {}
}