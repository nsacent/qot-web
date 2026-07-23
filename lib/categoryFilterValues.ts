export function getCategoryFilterOptionValue(option: any) {
    if (["string", "number", "boolean"].includes(typeof option)) {
        return String(option);
    }

    return String(option?.value ?? option?.slug ?? option?.id ?? "");
}

export function getCategoryFilterOptionLabel(option: any) {
    if (["string", "number", "boolean"].includes(typeof option)) {
        return String(option);
    }

    return String(
        option?.label ??
        option?.name ??
        option?.title ??
        option?.value ??
        "Unnamed"
    );
}

export function normalizeCategoryFilterValue(options: any[], value: unknown) {
    const rawValue = String(value ?? "").trim();

    if (!rawValue) return "";

    const matchingOption = options.find((option) => {
        const optionValue = getCategoryFilterOptionValue(option);
        const legacyOptionId =
            option && typeof option === "object" ? String(option.id ?? "") : "";

        return optionValue === rawValue || legacyOptionId === rawValue;
    });

    return matchingOption
        ? getCategoryFilterOptionValue(matchingOption)
        : rawValue;
}

export function getCategoryFilterDisplayValue(options: any[], value: unknown) {
    const normalizedValue = normalizeCategoryFilterValue(options, value);

    const matchingOption = options.find(
        (option) => getCategoryFilterOptionValue(option) === normalizedValue
    );

    return matchingOption
        ? getCategoryFilterOptionLabel(matchingOption)
        : normalizedValue;
}
