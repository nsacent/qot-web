export const AD_TITLE_MIN_LENGTH = 10;
export const AD_TITLE_MAX_LENGTH = 180;
export const AD_DESCRIPTION_MIN_LENGTH = 30;

export function getAdCopyValidationError(title: string, description: string) {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) return "Please enter an ad title.";
    if (cleanTitle.length < AD_TITLE_MIN_LENGTH) {
        return `Ad title must be at least ${AD_TITLE_MIN_LENGTH} characters.`;
    }
    if (cleanTitle.length > AD_TITLE_MAX_LENGTH) {
        return `Ad title cannot exceed ${AD_TITLE_MAX_LENGTH} characters.`;
    }
    if (!cleanDescription) return "Please enter an ad description.";
    if (cleanDescription.length < AD_DESCRIPTION_MIN_LENGTH) {
        return `Ad description must be at least ${AD_DESCRIPTION_MIN_LENGTH} characters.`;
    }

    return "";
}
