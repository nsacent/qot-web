export const REPORT_REASONS = [
    { value: "scam", label: "Scam or fraud" },
    { value: "fake", label: "Fake or misleading advert" },
    { value: "wrong_price", label: "Wrong or misleading price" },
    { value: "duplicate", label: "Duplicate advert" },
    { value: "wrong_category", label: "Wrong category" },
    { value: "prohibited", label: "Prohibited or illegal item" },
    { value: "sold_but_active", label: "Item already sold" },
    { value: "suspicious_seller", label: "Suspicious seller" },
    { value: "offensive", label: "Offensive or inappropriate content" },
    { value: "other", label: "Other issue" },
] as const;
