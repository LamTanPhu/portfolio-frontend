export interface UpdateJobRequestDTO {
    companyName?: string
    role?:        string
    startedAt?:   string
    endedAt?:     string | null
    isEnded?:     boolean
}