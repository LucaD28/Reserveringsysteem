export default function validateRequestBody(data: any, requiredFields: string[]): { valid: boolean; missingFields?: string[] } {
    const missingFields: string[] = requiredFields.filter(field => !(field in data));

    return {
        valid: missingFields.length === 0,
        missingFields: missingFields.length > 0 ? missingFields : undefined
    };
}