function uploadErrorMessage(data: any, fallback: string) {
    const direct = data?.detail || data?.message || data?.error;
    if (typeof direct === "string") return direct;

    for (const value of Object.values(data || {})) {
        if (Array.isArray(value) && value[0]) return String(value[0]);
        if (typeof value === "string") return value;
    }

    return fallback;
}

export function uploadFormWithProgress(
    path: string,
    payload: FormData,
    onProgress: (percentage: number) => void,
) {
    return new Promise<any>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("POST", `/api/proxy${path}`);
        request.withCredentials = true;

        request.upload.addEventListener("progress", (event) => {
            if (!event.lengthComputable) return;
            onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
        });

        request.addEventListener("load", () => {
            let data: any = {};

            try {
                data = request.responseText ? JSON.parse(request.responseText) : {};
            } catch {
                data = {};
            }

            if (request.status === 401 || request.status === 403) {
                reject(new Error("__AUTH__"));
                return;
            }

            if (request.status < 200 || request.status >= 300) {
                reject(new Error(uploadErrorMessage(data, "Photo upload failed.")));
                return;
            }

            onProgress(100);
            resolve(data);
        });

        request.addEventListener("error", () => {
            reject(new Error("Photo upload failed. Check your connection and try again."));
        });

        request.addEventListener("abort", () => {
            reject(new Error("Photo upload was cancelled."));
        });

        request.send(payload);
    });
}
