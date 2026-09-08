import { type Locator, type Page, expect } from "@playwright/test";

export type BusinessType = "Perseorangan" | "Badan Usaha";

export interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  businessType: BusinessType;
  businessName?: string;
  businessId: string;
  password: string;
}

export const SignupError = {
  emailFormat: "Format email salah",
  passwordTooShort: "Kata sandi minimal 8 karakter",
  passwordTooWeak: "Kata sandi terlalu lemah",
  businessIdCharset:
    "Hanya diperbolehkan kombinasi huruf, angka dan garis bawah (_)",
} as const;

export class SignupPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly businessNameInput: Locator;
  readonly businessIdInput: Locator;
  readonly businessIdSuggestions: Locator;
  readonly passwordInput: Locator;
  readonly individualBusinessRadio: Locator;
  readonly legalEntityBusinessRadio: Locator;
  readonly submitButton: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.getByTestId("qa-name-field");
    this.emailInput = page.getByTestId("qa-email-field");
    this.phoneInput = page.getByTestId("qa-phone-field");
    this.businessNameInput = page.getByTestId("qa-company-name-field");
    this.businessIdInput = page.getByTestId("qa-ffb-id-field");
    this.businessIdSuggestions = page.getByTestId(
      "qa-suggestion-ffb-id-button",
    );
    this.passwordInput = page.getByTestId("qa-password-field");
    this.individualBusinessRadio = page.getByTestId(
      "qa-guest-individual-business-type-radio-button",
    );
    this.legalEntityBusinessRadio = page.getByTestId(
      "qa-guest-legal-business-type-radio-button",
    );
    this.submitButton = page.getByTestId("qa-submit-button");
    this.loginButton = page.getByTestId("qa-back-to-login-link");
  }

  businessTypeRadio(type: BusinessType): Locator {
    return type === "Perseorangan"
      ? this.individualBusinessRadio
      : this.legalEntityBusinessRadio;
  }

  async goto(): Promise<void> {
    await this.page.goto("/signup");
    await expect(this.fullNameInput).toBeVisible();
  }

  async fillIdentity(
    data: Pick<SignupFormData, "fullName" | "email" | "phone">,
  ): Promise<void> {
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
  }

  async selectBusinessType(type: BusinessType): Promise<void> {
    await this.businessTypeRadio(type).check({ force: true });
    if (type === "Badan Usaha") {
      await expect(this.businessNameInput).toBeVisible();
    }
    await expect(this.businessIdInput).toBeVisible();
  }

  async fillForm(data: SignupFormData): Promise<void> {
    await this.fillIdentity(data);
    await this.selectBusinessType(data.businessType);
    if (data.businessType === "Badan Usaha") {
      if (!data.businessName) {
        throw new Error(
          'businessName is required when businessType is "Badan Usaha"',
        );
      }
      await this.businessNameInput.fill(data.businessName);
    }
    await this.businessIdInput.fill(data.businessId);
    await this.passwordInput.fill(data.password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
