"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowDown,
    faClockRotateLeft,
    faDatabase,
    faHardDrive,
    faPlus,
    faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { apiGet, apiPost } from "@/lib/apiClient";
import AdminActionModal from "@/components/admin/AdminActionModal";
import {
    AdminEmptyState,
    AdminErrorState,
    AdminLoadingState,
    AdminPageHeader,
    AdminRefreshButton,
} from "@/components/admin/AdminUi";

type BackupRecord = {
    name: string;
    created_at?: string;
    created_by?: {
        full_name?: string;
        email?: string;
    } | null;
    database_vendor?: string;
    kind?: string;
    size_bytes?: number;
    sha256?: string;
    last_restored_at?: string;
};

const BACKUPS_ENDPOINT = "/admin-panel/backups/";

function getArray(data: any): BackupRecord[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function formatSize(value?: number) {
    const bytes = Number(value || 0);

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(value?: string) {
    if (!value) return "Unknown date";
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Unknown date";

    return new Intl.DateTimeFormat("en-UG", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export default function AdminBackupsClient() {
    const [backups, setBackups] = useState<BackupRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [restoreTarget, setRestoreTarget] = useState<BackupRecord | null>(null);
    const [confirmation, setConfirmation] = useState("");
    const [modalError, setModalError] = useState("");

    async function loadBackups() {
        setLoading(true);
        setError("");

        try {
            const data = await apiGet(BACKUPS_ENDPOINT);
            setBackups(getArray(data));
        } catch (requestError: any) {
            setError(requestError?.message || "Failed to load database backups.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadBackups();
    }, []);

    async function createBackup() {
        setCreating(true);
        setError("");
        setMessage("");

        try {
            await apiPost(BACKUPS_ENDPOINT);
            setMessage("A fresh database backup was created successfully.");
            await loadBackups();
        } catch (requestError: any) {
            setError(requestError?.message || "Failed to create the backup.");
        } finally {
            setCreating(false);
        }
    }

    function openRestore(backup: BackupRecord) {
        setRestoreTarget(backup);
        setConfirmation("");
        setModalError("");
        setMessage("");
    }

    async function restoreSelectedBackup() {
        if (!restoreTarget) return;

        if (confirmation !== "RESTORE") {
            setModalError('Enter "RESTORE" exactly to continue.');
            return;
        }

        setRestoring(true);
        setModalError("");

        try {
            await apiPost(
                `/admin-panel/backups/${encodeURIComponent(restoreTarget.name)}/restore/`,
                { confirmation }
            );
            setRestoreTarget(null);
            setMessage(
                "Database restored successfully. A safety backup was created first."
            );
            await loadBackups();
        } catch (requestError: any) {
            setModalError(requestError?.message || "Failed to restore this backup.");
        } finally {
            setRestoring(false);
        }
    }

    return (
        <section>
            <AdminPageHeader
                eyebrow="Data protection"
                title="Database backups"
                description="Create private snapshots of QOT data, download an off-server copy, or restore a previous snapshot when recovery is required."
                action={
                    <div className="flex flex-wrap gap-2">
                        <AdminRefreshButton onClick={loadBackups} loading={loading} />
                        <button
                            type="button"
                            onClick={createBackup}
                            disabled={creating || restoring}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-xs font-black text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
                        >
                            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                            {creating ? "Creating backup…" : "Create backup"}
                        </button>
                    </div>
                }
            />

            <div className="mb-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[24px] bg-slate-950 p-5 text-white shadow-lg lg:col-span-2">
                    <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white">
                            <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="text-sm font-black">Restore protection is enabled</p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                                QOT automatically creates a safety backup immediately before every restore. Restores require typing RESTORE exactly.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Available snapshots</p>
                    <p className="mt-2 text-3xl font-black text-slate-950">{backups.length}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Stored outside public web files</p>
                </div>
            </div>

            {message && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    {message}
                </div>
            )}

            {loading && backups.length === 0 ? (
                <AdminLoadingState label="Loading database backups" />
            ) : error ? (
                <AdminErrorState message={error} onRetry={loadBackups} />
            ) : backups.length === 0 ? (
                <AdminEmptyState
                    title="No backups yet"
                    description="Create the first database backup before making major platform or data changes."
                />
            ) : (
                <div className="grid gap-4">
                    {backups.map((backup) => {
                        const safetyBackup = backup.kind === "pre_restore_safety";

                        return (
                            <article
                                key={backup.name}
                                className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6"
                            >
                                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                                    <div className="flex min-w-0 items-start gap-4">
                                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${safetyBackup ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
                                            <FontAwesomeIcon icon={safetyBackup ? faHardDrive : faDatabase} className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="break-all text-sm font-black text-slate-950 sm:text-base">
                                                    {backup.name}
                                                </h3>
                                                {safetyBackup && (
                                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-blue-600">
                                                        Safety backup
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                                                <span>{formatDate(backup.created_at)}</span>
                                                <span>{formatSize(backup.size_bytes)}</span>
                                                <span>{backup.database_vendor || "Database"}</span>
                                                {backup.created_by?.full_name && (
                                                    <span>By {backup.created_by.full_name}</span>
                                                )}
                                            </div>
                                            {backup.sha256 && (
                                                <p className="mt-2 truncate font-mono text-[10px] text-slate-400">
                                                    SHA-256 {backup.sha256}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-wrap gap-2">
                                        <a
                                            href={`/api/admin/backups/${encodeURIComponent(backup.name)}/download`}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-200"
                                        >
                                            <FontAwesomeIcon icon={faArrowDown} className="h-3.5 w-3.5" />
                                            Download
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => openRestore(backup)}
                                            disabled={creating || restoring}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                        >
                                            <FontAwesomeIcon icon={faClockRotateLeft} className="h-3.5 w-3.5" />
                                            Restore
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {restoreTarget && (
                <AdminActionModal
                    title="Restore database backup?"
                    description={`This replaces the current QOT database with ${restoreTarget.name}. The system creates a safety backup first, but recent records added after this snapshot will be rolled back.`}
                    confirmLabel="Restore database"
                    tone="red"
                    fields={[
                        {
                            key: "confirmation",
                            label: 'Type "RESTORE" to confirm',
                            placeholder: "RESTORE",
                            helper: "This confirmation is case-sensitive.",
                            required: true,
                        },
                    ]}
                    values={{ confirmation }}
                    error={modalError}
                    loading={restoring}
                    onChange={(_, value) => setConfirmation(value)}
                    onConfirm={restoreSelectedBackup}
                    onClose={() => {
                        if (!restoring) setRestoreTarget(null);
                    }}
                />
            )}
        </section>
    );
}
