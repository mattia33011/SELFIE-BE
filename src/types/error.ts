export class SelfieError extends Error {
    code: string
    status: number
    error: string
    context?: Record<string, any>
    
    constructor(code: string, status: number, error: string, context?: Record<string,any>){
        super()
        this.code=code
        this.status=status
        this.error=error
        this.context=context
    }
}

export const getSelfieError = (code: string, status: number, error: string, context? : Record<string, any>) => new SelfieError(code, status, error, context)

