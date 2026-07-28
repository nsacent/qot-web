"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationCrosshairs,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

type CurrentLocationButtonProps = {
    cities: CityOption[];
    onSelect: (value: string) => void;
    onSelectArea?: (value: string, cityValue: string) => void;
    onNoMatch: (suggestion: string) => void;
};

type CityOption = {
    id?: string | number;
    value?: string | number;
    slug?: string;
    name?: string;
    title?: string;
    label?: string;
    region_name?: string;
    region?: { name?: string } | string | number;
    areas?: CityOption[];
};

type LocationResult = {
    locality?: string;
    city?: string;
    principalSubdivision?: string;
    countryCode?: string;
    localities?: Array<{ name?: string }>;
    localityInfo?: {
        administrative?: Array<{ name?: string; isoName?: string }>;
    };
};

function normalizeLocationName(value: unknown) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\b(city|municipality|municipal|district|division|town|county|sub-?county)\b/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function cityValue(city: CityOption) {
    return String(city?.id || city?.value || city?.slug || "");
}

function cityName(city: CityOption) {
    return String(city?.name || city?.title || city?.label || "").trim();
}

function candidateNames(result: LocationResult) {
    const values = [
        result.locality,
        result.city,
        result.principalSubdivision,
        ...(result.localities || []).map((item) => item?.name),
        ...(result.localityInfo?.administrative || []).flatMap((item) => [
            item?.name,
            item?.isoName,
        ]),
    ];

    return values
        .map((value) => String(value || "").trim())
        .filter((value, index, all) => value && all.indexOf(value) === index);
}

function findMatchingCity(cities: CityOption[], candidates: string[]) {
    const normalizedCandidates = candidates.map(normalizeLocationName).filter(Boolean);
    let bestMatch: { city: CityOption; score: number } | null = null;

    for (const city of cities) {
        const normalizedCity = normalizeLocationName(cityName(city));
        if (!normalizedCity) continue;

        for (const [index, candidate] of normalizedCandidates.entries()) {
            let score = 0;

            if (candidate === normalizedCity) {
                score = 100 - index;
            } else if (
                Math.min(candidate.length, normalizedCity.length) >= 4 &&
                (candidate.includes(normalizedCity) || normalizedCity.includes(candidate))
            ) {
                score = 70 - index;
            }

            if (score > (bestMatch?.score || 0)) bestMatch = { city, score };
        }
    }

    return bestMatch?.city || null;
}

function findMatchingArea(cities: CityOption[], candidates: string[]) {
    const normalizedCandidates = candidates.map(normalizeLocationName).filter(Boolean);
    let bestMatch: { city: CityOption; area: CityOption; score: number } | null = null;

    for (const city of cities) {
        const normalizedCity = normalizeLocationName(cityName(city));
        const region = typeof city.region === "object"
            ? city.region?.name
            : city.region_name;
        const normalizedRegion = normalizeLocationName(region);
        const parentScore = normalizedCandidates.reduce((best, candidate, index) => {
            if (candidate === normalizedCity) return Math.max(best, 55 - index);
            if (candidate === normalizedRegion) return Math.max(best, 25 - index);
            if (
                normalizedCity
                && Math.min(candidate.length, normalizedCity.length) >= 4
                && (candidate.includes(normalizedCity) || normalizedCity.includes(candidate))
            ) return Math.max(best, 35 - index);
            return best;
        }, 0);

        for (const area of city.areas || []) {
            const normalizedArea = normalizeLocationName(cityName(area));
            if (!normalizedArea) continue;

            for (const [index, candidate] of normalizedCandidates.entries()) {
                let score = 0;
                if (candidate === normalizedArea) score = 120 - index + parentScore;
                else if (
                    Math.min(candidate.length, normalizedArea.length) >= 4
                    && (candidate.includes(normalizedArea) || normalizedArea.includes(candidate))
                ) score = 90 - index + parentScore;
                if (score > (bestMatch?.score || 0)) bestMatch = { city, area, score };
            }
        }
    }

    return bestMatch;
}

function getBrowserPosition() {
    return new Promise<GeolocationPosition>((resolve, reject) => {
        if (!window.isSecureContext) {
            reject(new Error("Location access requires a secure HTTPS connection."));
            return;
        }

        if (!navigator.geolocation) {
            reject(new Error("Location detection is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000,
        });
    });
}

async function getLocationPermissionState() {
    if (!navigator.permissions?.query) return "prompt" as PermissionState;

    try {
        const result = await navigator.permissions.query({ name: "geolocation" });
        return result.state;
    } catch {
        // Older Safari versions do not expose geolocation through Permissions API.
        return "prompt" as PermissionState;
    }
}

function locationErrorMessage(error: unknown) {
    const geolocationError = error as { code?: number; message?: string };

    if (typeof geolocationError?.code === "number") {
        if (geolocationError.code === 1) {
            return "Location access is blocked. Allow Location for qot.ug in Safari, then tap this button again.";
        }
        if (geolocationError.code === 3) {
            return "Your location took too long to detect. Try again or choose a city.";
        }
    }

    return error instanceof Error
        ? error.message
        : "We could not detect your location. Choose a city instead.";
}

export default function CurrentLocationButton({
    cities,
    onSelect,
    onSelectArea,
    onNoMatch,
}: CurrentLocationButtonProps) {
    const [locating, setLocating] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [permissionBlocked, setPermissionBlocked] = useState(false);

    async function useCurrentLocation() {
        setLocating(true);
        setMessage("");
        setIsError(false);
        setPermissionBlocked(false);

        try {
            const permissionState = await getLocationPermissionState();
            if (permissionState === "denied") {
                setPermissionBlocked(true);
                throw new Error("Location access is blocked. Allow Location for qot.ug in Safari, then tap this button again.");
            }

            const position = await getBrowserPosition();
            const params = new URLSearchParams({
                latitude: String(position.coords.latitude),
                longitude: String(position.coords.longitude),
                localityLanguage: "en",
            });
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`,
                { cache: "no-store" }
            );

            if (!response.ok) throw new Error("We could not identify your current city.");

            const result = (await response.json()) as LocationResult;
            if (result.countryCode && result.countryCode.toUpperCase() !== "UG") {
                throw new Error("Your current location is outside Uganda. Choose a Ugandan city instead.");
            }

            const candidates = candidateNames(result);
            const areaMatch = findMatchingArea(cities, candidates);
            if (areaMatch && cityValue(areaMatch.city) && cityValue(areaMatch.area)) {
                onSelectArea?.(cityValue(areaMatch.area), cityValue(areaMatch.city));
                if (onSelectArea) {
                    const region = typeof areaMatch.city.region === "object"
                        ? areaMatch.city.region?.name
                        : areaMatch.city.region_name;
                    setMessage(
                        `Current location set to ${[
                            cityName(areaMatch.area),
                            cityName(areaMatch.city),
                            region,
                        ].filter(Boolean).join(", ")}.`
                    );
                    return;
                }
            }
            const match = findMatchingCity(cities, candidates);

            if (!match || !cityValue(match)) {
                const suggestion = result.locality || result.city || result.principalSubdivision || "";
                setMessage(
                    suggestion
                        ? `We found ${suggestion}. Choose the nearest QOT city to continue.`
                        : "Choose the nearest QOT city to continue."
                );
                setIsError(true);
                onNoMatch(suggestion);
                return;
            }

            onSelect(cityValue(match));
            const region = typeof match.region === "object"
                ? match.region?.name
                : match.region_name;
            setMessage(`Current location set to ${[cityName(match), region].filter(Boolean).join(", ")}.`);
        } catch (error) {
            const geolocationError = error as { code?: number };
            if (geolocationError?.code === 1) setPermissionBlocked(true);
            setMessage(locationErrorMessage(error));
            setIsError(true);
        } finally {
            setLocating(false);
        }
    }

    return (
        <div className="mt-2.5">
            <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating || cities.length === 0}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[14px] bg-orange-50 px-3 py-2 text-xs font-black text-orange-700 ring-1 ring-orange-100 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-55"
            >
                <FontAwesomeIcon
                    icon={locating ? faSpinner : faLocationCrosshairs}
                    className={`h-3.5 w-3.5 ${locating ? "animate-spin" : ""}`}
                />
                {locating ? "Finding your area…" : "Allow location & use current area"}
            </button>

            {message && (
                <p className={`mt-2 text-[10px] font-bold leading-4 ${isError ? "text-red-600" : "text-emerald-600"}`}>
                    {message}
                </p>
            )}
            {permissionBlocked && (
                <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[9px] font-semibold leading-4 text-red-700 ring-1 ring-red-100">
                    <span className="block font-black">Enable location on iPhone</span>
                    Open Safari’s page menu (aA) → Website Settings → Location → Allow, then reload this page. If that option is unavailable, use Settings → Privacy &amp; Security → Location Services → Safari Websites.
                </div>
            )}
            <p className="mt-1 text-[9px] font-semibold leading-4 text-slate-400">
                QOT saves only the selected area or city, not your exact coordinates.
            </p>
        </div>
    );
}
