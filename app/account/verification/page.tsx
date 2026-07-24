import VerificationClient from "@/app/account/verification/VerificationClient";

export const dynamic = "force-dynamic";

export default function AccountVerificationPage() {
    return <VerificationClient embedded />;
}
