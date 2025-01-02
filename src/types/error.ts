export interface SelfieError {
    code: string,
    status: number,
    error: string,
    context?: Record<string, any>
}

export const getSelfieError = (code: string, status: number, error: string, context? : Record<string, any>) => ({
    code: code,
    status: status,
    error: error,
    context: context
} as SelfieError)

