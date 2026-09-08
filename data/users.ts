import type { SignupFormData } from "@pages/SignupPage.js";

/**
 * 15-char business ID. e.g. `"mtryj768m0y"`.
 */
function uniqueSuffix(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
  ).toLowerCase();
}

const EMAIL_DOMAIN = process.env.SIGNUP_EMAIL_DOMAIN ?? "example.com";

/**signup email. e.g. `"flip.qa+mtryj768m0y@example.com"`. */
function uniqueEmail(suffix: string): string {
  return `flip.qa+${suffix}@${EMAIL_DOMAIN}`;
}

/** Indonesian mobile number, no +62 prefix: "8" + 10 random digits. e.g. `"84816139481"`. */
function uniquePhone(): string {
  let digits = "";
  for (let i = 0; i < 10; i += 1) digits += Math.floor(Math.random() * 10);
  return `8${digits}`;
}

/** Lowercase alphanumeric handle, always <= 15 chars (Flip's "Buat ID" limit). */
function uniqueBusinessId(suffix: string): string {
  return `qa${suffix}`.slice(0, 15);
}

/** Valid signup data for an individual business ("Perseorangan"). */
export function buildIndividualSignup(
  overrides: Partial<SignupFormData> = {},
): SignupFormData {
  const suffix = uniqueSuffix();
  return {
    fullName: "Budi Santoso",
    email: uniqueEmail(suffix),
    phone: uniquePhone(),
    businessType: "Perseorangan",
    businessId: uniqueBusinessId(suffix),
    password: "Flip#Qa2026!",
    ...overrides,
  };
}

/** Valid signup data for a legal-entity business ("Badan Usaha"). */
export function buildCompanySignup(
  overrides: Partial<SignupFormData> = {},
): SignupFormData {
  const suffix = uniqueSuffix();
  return {
    fullName: "Ega Septian",
    email: uniqueEmail(suffix),
    phone: uniquePhone(),
    businessType: "Badan Usaha",
    businessName: `PT Maju Jaya ${suffix}`,
    businessId: uniqueBusinessId(suffix),
    password: "Flip#Qa2026!",
    ...overrides,
  };
}
